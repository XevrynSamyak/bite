import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import time
from contextlib import closing
from pathlib import Path
from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Everything lives in bite.db next to this file. sqlite3 is built into Python, so there's no
# database server to install. The tests point DB_FILE at a throwaway file instead.
DB_FILE = os.environ.get('DB_FILE', Path(__file__).with_name('bite.db'))
SESSION_DAYS = 30
EMAIL = re.compile(r'[^\s@]+@[^\s@]+\.[^\s@]+')
PRODUCTION = os.environ.get('ENV') == 'production'
WEBSITE = Path(__file__).parent.parent / 'frontend' / 'dist'

app = FastAPI(title='BITE API')


def connect():
    # autocommit: every statement is saved straight away.
    # check_same_thread off because FastAPI can hand one request between threads.
    db = sqlite3.connect(DB_FILE, autocommit=True, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys = ON')
    return db


with closing(connect()) as db:
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE COLLATE NOCASE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- one row per logged-in browser
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
          expires_at INTEGER NOT NULL  -- milliseconds since 1970
        );

        CREATE TABLE IF NOT EXISTS waitlist (
          email TEXT PRIMARY KEY COLLATE NOCASE,
          joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)


# one database connection per request, closed when the request is done
def database():
    db = connect()
    try:
        yield db
    finally:
        db.close()


Database = Annotated[sqlite3.Connection, Depends(database)]
SessionCookie = Annotated[str | None, Cookie(alias='session')]


# Passwords are never stored, only a salted scrypt hash of them ("salt:hash").
def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    key = hashlib.scrypt(password.encode(), salt=salt.encode(), n=2**14, r=8, p=1, dklen=64)
    return f'{salt}:{key.hex()}'


def check_password(password: str, stored: str) -> bool:
    salt = stored.split(':')[0]
    return hmac.compare_digest(hash_password(password, salt), stored)


# The browser keeps the session token in a cookie, the database only keeps a hash of it,
# so someone who gets a copy of the database still can't log in as anyone.
def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def now_ms() -> int:
    return int(time.time() * 1000)


def start_session(db: sqlite3.Connection, response: Response, user_id: int):
    token = secrets.token_urlsafe(32)
    db.execute(
        'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
        (hash_token(token), user_id, now_ms() + SESSION_DAYS * 24 * 60 * 60 * 1000),
    )
    # httponly: page scripts can't read it. samesite lax: other sites can't send it with their requests.
    response.set_cookie(
        'session',
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        samesite='lax',
        secure=PRODUCTION,
    )


# trimmed and lowercased, or None if it doesn't look like an email
def clean_email(email: str) -> str | None:
    email = email.strip().lower()
    return email if len(email) <= 254 and EMAIL.fullmatch(email) else None


def error(status: int, message: str):
    return JSONResponse({'error': message}, status_code=status)


def public(user) -> dict:
    return {'id': user['id'], 'name': user['name'], 'email': user['email']}


class LogIn(BaseModel):
    email: str = ''
    password: str = ''


class Register(LogIn):
    name: str = ''


@app.post('/api/register', status_code=201)
def register(body: Register, response: Response, db: Database):
    name, email = body.name.strip(), clean_email(body.email)
    if not name or len(name) > 60:
        return error(400, 'Tell us your name (up to 60 characters).')
    if not email:
        return error(400, "That email doesn't look right.")
    if not 8 <= len(body.password) <= 200:
        return error(400, 'Your password needs at least 8 characters.')

    try:
        user_id = db.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            (name, email, hash_password(body.password)),
        ).lastrowid
    except sqlite3.IntegrityError:  # the email is already taken
        return error(409, 'There’s already an account with that email. Log in instead?')
    start_session(db, response, user_id)
    return {'user': {'id': user_id, 'name': name, 'email': email}}


@app.post('/api/login')
def login(body: LogIn, response: Response, db: Database):
    user = db.execute('SELECT * FROM users WHERE email = ?', (body.email.strip(),)).fetchone()
    # same message either way, so nobody can use this to check who has an account
    if not user or not check_password(body.password, user['password_hash']):
        return error(401, 'Wrong email or password.')

    db.execute('DELETE FROM sessions WHERE expires_at < ?', (now_ms(),))  # tidy up old sessions
    start_session(db, response, user['id'])
    return {'user': public(user)}


@app.post('/api/logout')
def logout(response: Response, db: Database, session: SessionCookie = None):
    if session:
        db.execute('DELETE FROM sessions WHERE token_hash = ?', (hash_token(session),))
    response.delete_cookie('session')
    return {'ok': True}


# who's logged in, or {"user": null}
@app.get('/api/me')
def me(db: Database, session: SessionCookie = None):
    user = session and db.execute(
        """SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
           WHERE sessions.token_hash = ? AND sessions.expires_at > ?""",
        (hash_token(session), now_ms()),
    ).fetchone()
    return {'user': public(user) if user else None}


class JoinWaitlist(BaseModel):
    email: str = ''


@app.post('/api/waitlist', status_code=201)
def join_waitlist(body: JoinWaitlist, db: Database):
    email = clean_email(body.email)
    if not email:
        return error(400, "That email doesn't look right.")
    db.execute('INSERT OR IGNORE INTO waitlist (email) VALUES (?)', (email,))  # joining twice is fine
    return {'ok': True}


# The built website. /login and /register are pages of the same app, so they get index.html too.
# This has to come after the API routes: the mount at "/" catches everything that's left.
if WEBSITE.exists():

    @app.get('/login', include_in_schema=False)
    @app.get('/register', include_in_schema=False)
    def page():
        return FileResponse(WEBSITE / 'index.html')

    app.mount('/', StaticFiles(directory=WEBSITE, html=True), name='website')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', port=int(os.environ.get('PORT', 3001)), reload=True)

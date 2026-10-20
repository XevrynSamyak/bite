"""Checks register, log in and log out still work.  Run with:  uv run test_main.py"""

import os
import tempfile

# fresh throwaway database, the real bite.db is never touched
os.environ['DB_FILE'] = os.path.join(tempfile.mkdtemp(), 'test.db')

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


def test_register_login_logout():
    browser = TestClient(app)  # keeps cookies between requests, like a real browser
    asha = {'name': 'Asha Rao', 'email': 'Asha@Example.com', 'password': 'masala-dosa'}

    res = browser.post('/api/register', json=asha)
    assert res.status_code == 201
    assert res.json()['user']['email'] == 'asha@example.com'
    assert browser.get('/api/me').json()['user']['name'] == 'Asha Rao'

    assert browser.post('/api/register', json={**asha, 'email': 'asha@example.com'}).status_code == 409
    short = browser.post('/api/register', json={**asha, 'email': 'new@ex.com', 'password': 'short'})
    assert short.status_code == 400 and 'error' in short.json()

    browser.post('/api/logout')
    assert browser.get('/api/me').json()['user'] is None

    wrong = {'email': asha['email'], 'password': 'wrong-password'}
    assert browser.post('/api/login', json=wrong).status_code == 401
    nobody = {'email': 'nobody@example.com', 'password': 'whatever1'}
    assert browser.post('/api/login', json=nobody).status_code == 401

    right = {'email': 'ASHA@example.com', 'password': asha['password']}
    assert browser.post('/api/login', json=right).status_code == 200
    assert browser.get('/api/me').json()['user']['name'] == 'Asha Rao'


def test_waitlist():
    browser = TestClient(app)
    assert browser.post('/api/waitlist', json={'email': 'not an email'}).status_code == 400
    assert browser.post('/api/waitlist', json={'email': 'Ravi@Example.com'}).status_code == 201
    assert browser.post('/api/waitlist', json={'email': 'ravi@example.com'}).status_code == 201


if __name__ == '__main__':
    test_register_login_logout()
    test_waitlist()
    print('all good')

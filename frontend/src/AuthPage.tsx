import { useEffect } from 'react'
import PhoneFeed from './components/PhoneFeed'
import { LOGO } from './components/Hero'
import { useApiForm } from './auth'

const pages = {
  login: {
    title: 'Welcome back',
    lead: 'Log in to see where your friends are eating tonight.',
    button: 'Log in',
    other: ['New to BITE?', 'Create an account', 'register'],
  },
  register: {
    title: 'Pull up a chair',
    lead: 'Make an account, tell us what you like, and every pick after that is yours.',
    button: 'Create account',
    other: ['Already have an account?', 'Log in', 'login'],
  },
}

// Log in and register are the same form, register just asks for a name too.
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  // back to the home page, now logged in
  const { submit, error, busy } = useApiForm(mode, () => (location.href = './'))
  const page = pages[mode]
  const [otherText, otherLink, otherHref] = page.other

  useEffect(() => {
    document.title = `${page.button} · BITE`
  }, [page])

  return (
    <div className="auth">
      <a href="./" className="brand auth-brand">
        <img src={LOGO} alt="" width={480} height={471} />
        BITE
      </a>

      <div className="auth-preview" aria-hidden="true">
        <PhoneFeed />
      </div>

      <main className="card auth-card">
        <h1>{page.title}</h1>
        <p className="muted">{page.lead}</p>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input name="name" required maxLength={60} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="example@gmail.com"
            />
          </label>
          <label>
            <span>
              Password{' '}
              {mode === 'register' && <span className="muted">· at least 8 characters</span>}
            </span>
            <input
              type="password"
              name="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="pill-button" type="submit" disabled={busy}>
            {busy ? 'One sec…' : page.button}
          </button>
        </form>

        <p className="auth-switch">
          {otherText} <a href={otherHref}>{otherLink}</a>
        </p>
      </main>
    </div>
  )
}

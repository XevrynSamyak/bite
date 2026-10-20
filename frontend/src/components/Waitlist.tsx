import { useState } from 'react'
import { useApiForm } from '../auth'
import { usePopIn } from '../usePopIn'
import { LOGO } from './Hero'

// Saves the email in the backend's waitlist table. `email` is filled in for people who are logged in.
export default function Waitlist({ email }: { email?: string }) {
  const [joined, setJoined] = useState(false)
  const { submit, error, busy } = useApiForm('waitlist', () => setJoined(true))
  const logo = usePopIn<HTMLImageElement>()
  //i can use llm but i want to do it myself and now im fucking doneeeeeee
  return (
    <section className="card medium waitlist-card" id="join" aria-labelledby="join-title">
      <img className="waitlist-logo" src={LOGO} alt="" width={480} height={471} ref={logo} />
      <div>
        <h2 id="join-title">Join the waitlist</h2>
        <p>
          Launching in one city first, for college students and young professionals. Version one:
          taste onboarding, a personalised feed, friend network, visit tracking, personalised
          ranking and group mode.
        </p>
        {joined ? (
          <p className="joined-message pop-in popped" role="status">
            You're on the list. We'll email you when BITE opens near you.
          </p>
        ) : (
          <form className="waitlist" onSubmit={submit}>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="example@gmail.com"
              aria-label="Email address"
              defaultValue={email}
              key={email} // fills it in once we know who's logged in
            />
            <button className="pill-button" type="submit" disabled={busy}>
              {busy ? 'One sec…' : 'Join the waitlist'}
            </button>
          </form>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

import { useState, type FormEvent } from 'react'
import { usePopIn } from '../usePopIn'
import { LOGO } from './Hero'

export default function Waitlist() {
  const [joined, setJoined] = useState(false)
  const logo = usePopIn<HTMLImageElement>()

  // TODO: actually send the email somewhere (Formspree, a Google Form or our own API).
  // Right now it only shows the thank-you message.
  function submit(event: FormEvent) {
    event.preventDefault()
    setJoined(true)
  }
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
            />
            <button className="pill-button" type="submit">
              Join the waitlist
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

import type { CSSProperties } from 'react'
import { picks, type Pick } from '../data'
import { usePopIn } from '../usePopIn'
import { LOGO } from './Hero'

function PickCard({ pick, index }: { pick: Pick; index: number }) {
  const card = usePopIn<HTMLElement>(120 + index * 80)
  return (
    <article className="pick" ref={card}>
      <div className="pick-header">
        <div
          className="pick-emoji"
          style={{ '--tint': pick.tint } as CSSProperties}
          aria-hidden="true"
        >
          {pick.emoji}
        </div>
        <h3>{pick.name}</h3>
        <span className="match" style={{ '--match': pick.match } as CSSProperties}>
          <b>{pick.match}%</b>
          <span className="sr-only"> taste match</span>
        </span>
      </div>
      <ul>
        {pick.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  )
}

// Mock app screen for the intro section cryyyyyyyyyyyyyyyy
export default function PhoneFeed() {
  return (
    <div className="phone" role="group" aria-label="Preview of the BITE app">
      <div className="phone-screen">
        <div className="status-bar" aria-hidden="true">
          <span>8:10</span>
          <span className="signal-bars">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="app-top">
          <img className="app-logo" src={LOGO} alt="" width={480} height={471} />
          <div>
            <p className="app-greeting">Good evening</p>
            <p className="app-location">Near campus</p>
          </div>
        </div>
        <div className="app-search" aria-hidden="true">
          Search dishes, places, friends
        </div>
        <p className="app-label">Picked for you tonight</p>
        <div className="pick-list">
          {picks.map((pick, i) => (
            <PickCard key={pick.name} pick={pick} index={i} />
          ))}
        </div>
        <nav className="app-tabbar" aria-hidden="true">
          <span className="active">
            <svg viewBox="0 0 20 20">
              <path d="M3 10h14a7 7 0 0 1-14 0zM8 7c0-1.5 1.5-1.5 1.5-3M11.5 7c0-1.5 1.5-1.5 1.5-3" />
            </svg>
            Feed
          </span>
          <span>
            <svg viewBox="0 0 20 20">
              <circle cx="7" cy="8" r="3" />
              <circle cx="13" cy="8" r="3" />
              <circle cx="10" cy="13" r="3" />
            </svg>
            Circles
          </span>
          <span>
            <svg viewBox="0 0 20 20">
              <path d="M10 18s6-5.5 6-10a6 6 0 0 0-12 0c0 4.5 6 10 6 10z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            Map
          </span>
          <span>
            <svg viewBox="0 0 20 20">
              <circle cx="10" cy="7" r="3.2" />
              <path d="M4 17c1-3.5 3.5-5 6-5s5 1.5 6 5" />
            </svg>
            You
          </span>
        </nav>
      </div>
    </div>
  )
}

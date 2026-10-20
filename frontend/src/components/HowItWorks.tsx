import type { ReactNode } from 'react'
import { usePopIn } from '../usePopIn'

const signals = [
  'Your taste',
  "Friends' visits",
  'Repeat visits',
  'Budget fit',
  'Distance',
  'Cuisine preferences',
  'Recent experiences',
]

// One box in the flowchart. `order` staggers the pop-in so the chart fills in top to bottom.
function Step({
  order,
  className = '',
  children,
}: {
  order: number
  className?: string
  children: ReactNode
}) {
  const ref = usePopIn<HTMLDivElement>(order * 110)
  return (
    <div className={`flow-step ${className}`} ref={ref}>
      {children}
    </div>
  )
}

// Lines between rows. `from` and `to` are x positions (0-100) across the row.
function Connector({ from, to }: { from: number[]; to: number[] }) {
  return (
    <svg
      className="flow-connector"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {from.flatMap((x1) =>
        to.map((x2) => (
          <path
            key={`${x1}-${x2}`}
            d={`M${x1} 0 C${x1} 22 ${x2} 18 ${x2} 40`}
            vectorEffect="non-scaling-stroke"
          />
        )),
      )}
    </svg>
  )
}

export default function HowItWorks() {
  return (
    <section className="wide" aria-labelledby="how">
      <h2 id="how" className="flow-title">
        How it works
      </h2>
      <div className="flow">
        <div className="flow-row">
          <Step order={0}>
            <span className="flow-number">1</span>
            <h3>Set your taste</h3>
            <p>Cuisines, veg, non-veg or vegan, budget per meal, street food or fine dining.</p>
          </Step>
          <Step order={1}>
            <span className="flow-number">2</span>
            <h3>Follow food friends</h3>
            <p>See the visits they choose to share, within their privacy settings.</p>
          </Step>
          <Step order={2}>
            <span className="flow-number">3</span>
            <h3>Eat and log</h3>
            <p>What you save, skip, visit and go back to.</p>
          </Step>
        </div>

        <Connector from={[16.7, 50, 83.3]} to={[50]} />

        <Step order={3} className="flow-engine">
          <h3>BITE scores every place for you</h3>
          <ul className="flow-signals">
            {signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </Step>

        <Connector from={[50]} to={[25, 75]} />

        <div className="flow-row flow-row-two">
          <Step order={4}>
            <h3>Your feed</h3>
            <p>Places ranked by how likely you are to love them, with the reasons shown.</p>
          </Step>
          <Step order={5}>
            <h3>Taste Circles</h3>
            <p>One pick the whole group will enjoy, inside everyone's budget.</p>
          </Step>
        </div>

        <Connector from={[25, 75]} to={[50]} />

        <Step order={6} className="flow-result">
          <h3>You go, eat and log it</h3>
          <p>
            That visit feeds straight back into your taste, so every meal makes the next pick
            better.
          </p>
        </Step>
      </div>
    </section>
  )
}

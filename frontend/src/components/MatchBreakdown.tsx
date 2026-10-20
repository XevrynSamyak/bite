import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { breakdowns, signals } from '../data'
import { POP_IN_KEYFRAMES, SPRING_EASING, reduceMotion, usePopIn } from '../usePopIn'

function Bar({ label, value, index }: { label: string; value: number; index: number }) {
  const ref = usePopIn<HTMLDivElement>(120 + index * 80)
  return (
    <div className="bar" ref={ref}>
      <span>{label}</span>
      <span className="bar-track">
        <i style={{ '--value': value } as CSSProperties} />
      </span>
      <b>{value}</b>
    </div>
  )
}

// Tabs showing what each example match score is made of
export default function MatchBreakdown() {
  const [openTab, setOpenTab] = useState(0)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const firstRender = useRef(true) // no pop on page load, only when you switch tabs bruhhhhhhhhhhhhhhhhh
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!reduceMotion)
      panels.current[openTab]?.animate(POP_IN_KEYFRAMES, { duration: 600, easing: SPRING_EASING })
  }, [openTab])

  return (
    <>
      <div className="wide">
        <div className="tabs" role="tablist" aria-label="Example picks">
          {breakdowns.map((b, i) => (
            <button
              key={b.name}
              role="tab"
              id={`t${i}`}
              aria-selected={openTab === i}
              aria-controls={`b${i}`}
              onClick={() => setOpenTab(i)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <div className="column">
        {breakdowns.map((b, i) => (
          <div
            key={b.name}
            className="card"
            role="tabpanel"
            id={`b${i}`}
            aria-labelledby={`t${i}`}
            hidden={openTab !== i}
            ref={(el) => {
              panels.current[i] = el
            }}
          >
            <div className="card-head">
              <p className="card-title">
                {b.name}, {b.match}% match
              </p>
              <span className="muted">Example breakdown</span>
            </div>
            <div className="bars">
              {b.bars.map((v, j) => (
                <Bar key={signals[j]} label={signals[j]} value={v} index={j} />
              ))}
            </div>
            <p className="caption">{b.caption}</p>
          </div>
        ))}
      </div>
    </>
  )
}

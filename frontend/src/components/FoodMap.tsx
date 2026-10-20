import { useEffect } from 'react'
import { usePopIn } from '../usePopIn'

// Static SVG map. Pins pop in one by one when it scrolls into view.im gonna dieeeeeeeeeeeeeeeeeeee
export default function FoodMap() {
  const map = usePopIn<SVGSVGElement>()
  useEffect(() => {
    map.current
      ?.querySelectorAll('circle')
      .forEach((pin, i) => pin.style.setProperty('--pin-delay', `${300 + i * 70}ms`))
  }, [map])
  return (
    <div className="card">
      <svg
        className="food-map"
        viewBox="0 0 440 300"
        role="img"
        aria-labelledby="map-title"
        ref={map}
      >
        <title id="map-title">
          A food map with places you've loved, visited, saved and want to try
        </title>
        <rect width="440" height="300" fill="#1B110A" />
        <path
          d="M310 -20 C 340 80 250 160 295 320"
          fill="none"
          stroke="rgba(110,170,190,.14)"
          strokeWidth="26"
        />
        <rect x="34" y="112" width="104" height="54" rx="12" fill="rgba(120,200,140,.09)" />
        <g fill="none" stroke="rgba(255,236,214,.1)" strokeLinecap="round">
          <path d="M-20 190 C 100 160 190 230 460 180" strokeWidth="12" />
          <path d="M185 -20 C 172 100 205 210 160 320" strokeWidth="9" />
          <path d="M-20 86 L 460 114" strokeWidth="7" />
          <path d="M60 320 L 118 196" strokeWidth="5" />
          <path d="M235 200 L 440 300" strokeWidth="5" />
        </g>
        <g fill="#F4B41A">
          <circle cx="104" cy="204" r="16" opacity=".18" />
          <circle cx="104" cy="204" r="6" />
          <circle cx="360" cy="142" r="16" opacity=".18" />
          <circle cx="360" cy="142" r="6" />
        </g>
        <g fill="#FFF6EA">
          <circle cx="222" cy="58" r="4" />
          <circle cx="392" cy="246" r="4" />
          <circle cx="62" cy="268" r="4" />
          <circle cx="270" cy="98" r="4" />
        </g>
        <g fill="#F08A73">
          <circle cx="258" cy="262" r="5" />
          <circle cx="112" cy="46" r="5" />
        </g>
        <g fill="none" stroke="#FFF6EA" strokeWidth="1.5" strokeDasharray="3 3">
          <circle cx="334" cy="52" r="7" />
          <circle cx="196" cy="282" r="7" />
        </g>
        <text x="118" y="208">
          Momo Republic
        </text>
        <text x="346" y="146" textAnchor="end">
          Tokyo Table
        </text>
        <text x="270" y="266">
          Exam-week fuel
        </text>
      </svg>
      <ul className="map-legend">
        <li>
          <i style={{ background: '#F4B41A', boxShadow: '0 0 8px #F4B41A' }} />
          Loved
        </li>
        <li>
          <i style={{ background: '#FFF6EA' }} />
          Visited
        </li>
        <li>
          <i style={{ background: '#F08A73' }} />
          Saved
        </li>
        <li>
          <i style={{ border: '1.5px dashed #FFF6EA' }} />
          Want to try
        </li>
      </ul>
    </div>
  )
}

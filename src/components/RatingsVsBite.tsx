import { usePopIn } from '../usePopIn'

// Same restaurant seen two ways: a generic ratings app next to BITE.
export default function RatingsVsBite() {
  const ratingsCard = usePopIn<HTMLDivElement>(0)
  const biteCard = usePopIn<HTMLDivElement>(180)

  return (
    <section className="medium versus-section" aria-labelledby="versus-title">
      <p className="versus-title" id="versus-title">
        Same restaurant, two answers
      </p>
      <div className="versus">
        <div className="versus-card versus-ratings" ref={ratingsCard}>
          <p className="versus-label">A ratings app</p>
          <p className="versus-big">
            4.8 <span aria-hidden="true">★</span>
          </p>
          <ul>
            <li>2,341 reviews from strangers</li>
            <li>Bestseller: chicken biryani</li>
            <li>Popular in your area</li>
          </ul>
        </div>

        <span className="versus-vs" aria-hidden="true">
          vs
        </span>

        <div className="versus-card versus-bite" ref={biteCard}>
          <p className="versus-label">BITE</p>
          <p className="versus-big">
            94% <span>your match</span>
          </p>
          <ul>
            <li>4 of your friends went this month</li>
            <li>Your friends ordered the sushi</li>
            <li>People who eat like you come back twice a month</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

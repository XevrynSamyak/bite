import Hero, { LOGO } from './components/Hero'
import PhoneFeed from './components/PhoneFeed'
import MatchBreakdown from './components/MatchBreakdown'
import TasteCircles from './components/TasteCircles'
import FoodMap from './components/FoodMap'
import Waitlist from './components/Waitlist'

const sections = [
  ['#how', 'How it works'],
  ['#circles', 'Taste Circles'],
  ['#privacy', 'Privacy'],
  ['#faq', 'FAQ'],
]

const faq = [
  [
    'Is BITE free?',
    'Yes. A premium tier with deeper personalisation, exclusive collections and planning tools is planned.',
  ],
  [
    'Where does restaurant information come from?',
    'Reputable data providers, licensed datasets and restaurant partnerships, starting with a hand-picked set of places in the launch city.',
  ],
  [
    'I run a restaurant. How do I join?',
    'Join the waitlist to hear when partnerships open. Partners get reservations, labelled promotions and aggregated customer insights.',
  ],
  [
    "What's the long-term plan?",
    'A personal food graph that connects people, cuisines, restaurants, budgets and experiences. We start social-first and add AI personalisation as real usage grows.',
  ],
]

export default function App() {
  return (
    <>
      <nav className="nav" aria-label="Main">
        <a href="#" className="brand">
          <img src={LOGO} alt="" width={480} height={471} />
          BITE
        </a>
        <div className="nav-links">
          {sections.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <a href="#join" className="pill-button">
          Join the waitlist
        </a>
      </nav>

      <Hero />

      <main>
        <section className="wide intro">
          <PhoneFeed />
          <div className="intro-copy">
            <h2>A feed of places you'll actually like</h2>
            <p>
              BITE is a social food-discovery app that predicts which restaurants you'll love from
              your taste, your friends' experiences and where people like you keep going back.
            </p>
            <p>
              Ratings tell you what strangers think. BITE answers a better question: "Which
              restaurant will I probably love?"
            </p>
            <p className="status-note">
              BITE is in development. We're building the first version for one city, and the
              waitlist is open. <a href="#join">Join it</a>.
            </p>
          </div>
        </section>

        <div className="column">
          <div className="table-block">
            <p className="table-title">Same restaurant, two answers</p>
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">A rating tells you</th>
                  <th scope="col">BITE tells you</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>4.8 stars</td>
                  <td>94% match with your taste</td>
                </tr>
                <tr>
                  <td>2,341 reviews from strangers</td>
                  <td>4 of your friends went this month</td>
                </tr>
                <tr>
                  <td>Bestseller: chicken biryani</td>
                  <td>Your friends ordered the sushi</td>
                </tr>
                <tr>
                  <td>Popular in your area</td>
                  <td>People who eat like you come back twice a month</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="how">How it works</h2>
          <ol className="steps">
            <li>
              <strong>Set your taste.</strong> Cuisines, veg, non-veg or vegan, budget per meal,
              casual or fine dining, street food or premium, cafés and desserts.
            </li>
            <li>
              <strong>Follow food friends.</strong> See the visits they choose to share, within
              their privacy settings.
            </li>
            <li>
              <strong>Eat and log.</strong> BITE learns from what you save, skip, visit and revisit.
            </li>
            <li>
              <strong>Get your picks.</strong> Every place is scored on seven signals: your taste,
              friends' visits, repeat visits, budget fit, distance, cuisine preferences and recent
              experiences.
            </li>
          </ol>
        </div>

        <MatchBreakdown />

        <section className="banner wide" id="circles" aria-labelledby="circles-title">
          <h2 id="circles-title">Taste Circles</h2>
          <p>Five friends. Five cravings. One dinner.</p>
        </section>
        <div className="column">
          <p>
            Ask for "somewhere everyone will enjoy tonight, under ₹500 each" and BITE weighs each
            person's taste, budget, location and history, leaning on the least excited person so
            nobody gets dragged somewhere they'll hate. Tap a friend or change the budget:
          </p>
        </div>
        <TasteCircles />

        <div className="column">
          <h2 id="map">My Food Map</h2>
          <p>
            A private map of everywhere you've visited, loved, saved or want to try, with shared
            lists, a food journal, campus communities, restaurant challenges and group dining plans
            around it.
          </p>
          <FoodMap />

          <h2 id="privacy">What BITE knows about you</h2>
          <div className="two-columns">
            <div>
              <h3>BITE learns from</h3>
              <ul>
                <li>Places you save and visits you log</li>
                <li>Reviews you write and friends you follow</li>
                <li>Places you go back to</li>
                <li>Your preferences and budget</li>
                <li>Reservations made through BITE</li>
              </ul>
            </div>
            <div>
              <h3>BITE won't</h3>
              <ul>
                <li>Read bank or UPI data without your explicit consent</li>
                <li>Show your visits to anyone you haven't allowed</li>
                <li>Let restaurants pay to change your picks</li>
              </ul>
            </div>
          </div>
          <p>
            A repeat visit is a signal, not proof: people also go back because a place is close,
            cheap or convenient, so BITE weighs it alongside everything else.
          </p>

          <h2 id="compare">How BITE compares</h2>
          <div className="table-block">
            <table className="compare-table platform-table">
              <thead>
                <tr>
                  <th scope="col">Platform</th>
                  <th scope="col">How you find food</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Google Maps</td>
                  <td>Ratings, reviews, distance and local search</td>
                </tr>
                <tr>
                  <td>Zomato</td>
                  <td>Discovery, reviews, menus and ordering</td>
                </tr>
                <tr>
                  <td>Instagram</td>
                  <td>Influencer content and social discovery</td>
                </tr>
                <tr className="bite-row">
                  <td>BITE</td>
                  <td>Your taste, trusted friends and real visits, combined into one prediction</td>
                </tr>
              </tbody>
            </table>
            <p className="caption">Simplified: these platforms offer some personalisation too.</p>
          </div>

          <h2 id="faq">Questions</h2>
          <div className="faq">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>

        <Waitlist />
      </main>

      <footer className="footer">
        <span> 2026 BITE. Made for people who'd rather ask a friend.</span>
        <nav className="footer-links" aria-label="Footer">
          {[...sections, ['#join', 'Waitlist']].map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </>
  )
}

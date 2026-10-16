import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { friends, places, rupees } from '../data'
import { SPRING_EASING, reduceMotion } from '../usePopIn'

// Top 3 places for the group within budget. The score leans on whoever likes the place least,
// so one person hating it drags it down.
function rankPlacesForGroup(chosenFriends: number[], budget: number) {
  return places
    .filter((place) => place.price <= budget)
    .map((place) => {
      const friendScores = chosenFriends.map((friend) => place.scores[friend])
      const lowest = Math.min(...friendScores)
      const average = friendScores.reduce((sum, score) => sum + score, 0) / friendScores.length
      return {
        ...place,
        groupScore: Math.round(0.4 * lowest + 0.6 * average),
        hardestSell: chosenFriends[friendScores.indexOf(lowest)], // the friend least excited about this place
        hardestSellScore: lowest,
      }
    })
    .sort((a, b) => b.groupScore - a.groupScore)
    .slice(0, 3)
}

export default function TasteCircles() {
  const [inCircle, setInCircle] = useState(() => friends.map(() => true)) // true = that friend is coming
  const [budget, setBudget] = useState(500)
  const centre = useRef<HTMLDivElement>(null)

  const chosenFriends = inCircle.flatMap((coming, i) => (coming ? [i] : []))
  const shortlist = chosenFriends.length ? rankPlacesForGroup(chosenFriends, budget) : []
  const tonightsPick = shortlist[0]
  const question = !chosenFriends.length
    ? 'Add someone to the circle to start.'
    : chosenFriends.length === 1 && chosenFriends[0] === 0
      ? `Dinner tonight for just you, under ${rupees(budget)}.`
      : `Dinner tonight for ${chosenFriends.length}, under ${rupees(budget)} each.`

  // tonight's pick pops whenever it changes
  const pickId = tonightsPick
    ? `${tonightsPick.name}${tonightsPick.groupScore}`
    : `none${chosenFriends.length}`
  useEffect(() => {
    if (!reduceMotion)
      centre.current?.animate(
        [
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1 },
        ],
        { duration: 500, easing: SPRING_EASING },
      )
  }, [pickId])

  function toggleFriend(friend: number, event: MouseEvent<HTMLButtonElement>) {
    setInCircle((current) => current.map((coming, i) => (i === friend ? !coming : coming)))
    const dot = event.currentTarget.firstChild as HTMLElement
    if (!reduceMotion)
      dot.animate([{ scale: 0.4 }, { scale: 1.3 }, { scale: 1 }], {
        duration: 500,
        easing: SPRING_EASING,
      })
  }
// why im even doing this, i could just use a library but noooooo i have to do it myself and now im crying
  return (
    <div className="card wide circles-demo">
      <div className="orbit">
        <div className="orbit-center" ref={centre} aria-live="polite">
          {tonightsPick ? (
            <>
              <span className="pick-label">Tonight's pick</span>
              <span className="pick-name">{tonightsPick.name}</span>
              <span className="pick-score">{tonightsPick.groupScore}% group match</span>
            </>
          ) : (
            <span className="pick-label">
              {chosenFriends.length
                ? `Nothing fits ${rupees(budget)} a head. Slide the budget up.`
                : 'Tap a friend to add them.'}
            </span>
          )}
        </div>
        {friends.map((friend, i) => (
          <button
            key={friend.name}
            type="button"
            className="friend"
            aria-pressed={inCircle[i]}
            aria-label={`${friend.name}, ${friend.craving}`}
            style={{ '--angle': `${i * 72}deg`, '--friend-color': friend.color } as CSSProperties}
            onClick={(event) => toggleFriend(i, event)}
          >
            <span className="friend-dot" />
            <span className="friend-name">{friend.name}</span>
            <span className="craving">{friend.craving}</span>
          </button>
        ))}
      </div>
      <div>
        <p className="circle-question">{question}</p>
        <label className="budget">
          <span className="budget-row">
            Budget per person <output>{rupees(budget)}</output>
          </span>
          <input
            type="range"
            min={200}
            max={1500}
            step={50}
            value={budget}
            onChange={(event) => setBudget(+event.target.value)}
          />
        </label>
        <ol className="shortlist">
          {shortlist.map((place) => {
            const hardestSell = friends[place.hardestSell]
            return (
              <li key={place.name}>
                <span className="option-name">{place.name}</span>
                <span className="option-score">{place.groupScore}%</span>
                <span className="option-details">
                  {place.what}, {rupees(place.price)} a head
                </span>
                <span
                  className="option-bars"
                  role="img"
                  aria-label={chosenFriends
                    .map((i) => `${friends[i].name} ${place.scores[i]}%`)
                    .join(', ')}
                >
                  {chosenFriends.map((i) => (
                    <i
                      key={i}
                      style={
                        {
                          '--bar-color': friends[i].color,
                          '--value': place.scores[i],
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
                {chosenFriends.length > 1 && (
                  <p className="option-note">
                    {hardestSell.name === 'You' ? "You're" : `${hardestSell.name}'s`} the hardest
                    sell here ({place.hardestSellScore}%).
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

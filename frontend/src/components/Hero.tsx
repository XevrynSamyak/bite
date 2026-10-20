import { useEffect, useRef } from 'react'
import { startHeroAnimation } from '../heroAnimation'
//fuckkkkkkkkkkkkkkkkkkkk mammmmmmmmmmmmmmmmmmmmm
export const LOGO = `${import.meta.env.BASE_URL}logo.webp`
export default function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null),
    hero = useRef<HTMLElement>(null)
  useEffect(() => startHeroAnimation(canvas.current!, hero.current!, LOGO), [])
  return (
    <>
      <canvas id="hero-canvas" ref={canvas} aria-hidden="true" />
      <header className="hero" id="hero" ref={hero}>
        <div className="hero-sticky">
          <p className="hero-intro">Too many restaurants. Too many ratings.</p>
          <span className="scroll-hint" aria-hidden="true">
            Scroll
          </span>
          <h1>Your Taste. Your People. Your Next Favourite.</h1>
        </div>
      </header>
    </>
  )
}

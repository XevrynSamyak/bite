import { useEffect, useRef } from 'react'

// slight overshoot, then settles. same curve as --spring in the CSS
export const SPRING_EASING = 'cubic-bezier(.34,1.56,.64,1)'
export const POP_IN_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateY(14px) scale(.95)' },
  { opacity: 1, transform: 'none' },
]
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

// Pops the element in the first time it scrolls into view.
// If pop-ins-on isn't on <html> (see index.html, it's skipped for reduced motion) we do nothing,
// so content never gets stuck hidden.
export function usePopIn<T extends Element>(delayMs = 0) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !document.documentElement.classList.contains('pop-ins-on')) return
    element.classList.add('pop-in')
    if (delayMs) (element as unknown as HTMLElement).style.setProperty('--delay', `${delayMs}ms`)
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('popped')
          watcher.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    watcher.observe(element)
    return () => watcher.disconnect()
  }, [delayMs])
  return ref
}

import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Drives the whole page's scroll through Lenis for the smooth,
 * weighted feel, and keeps ScrollTrigger's internal clock in lockstep
 * with it so pinned/scrubbed sections track the same scroll position. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    })

    lenis.on('scroll', (l) => {
      scrollVelocity.current = l.velocity
      ScrollTrigger.update()
    })

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}

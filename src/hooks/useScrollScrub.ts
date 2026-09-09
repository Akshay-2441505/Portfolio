import { useEffect, useRef, type RefObject } from 'react'
import { ScrollTrigger } from '../lib/gsap'

/** Tracks how far an element has scrolled through the viewport as a plain
 * ref (never React state) — reading it inside a rAF loop drives animation
 * without ever triggering a re-render on scroll. */
export function useScrollScrub(elementRef: RefObject<HTMLElement | null>) {
  const progress = useRef(0)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })

    return () => trigger.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return progress
}

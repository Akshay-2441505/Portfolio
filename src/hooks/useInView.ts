import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element is on screen, so we can freeze expensive
 * work (e.g. the WebGL render loop) while it's scrolled out of view. */
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  // Optimistic default: assume visible until the observer says otherwise.
  // Matters when this gates a frameloop — R3F's "never" mode renders
  // nothing at all (not even one frame) until it flips.
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options,
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView } as const
}

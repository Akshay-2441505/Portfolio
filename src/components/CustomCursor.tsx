import { useEffect, useRef, useState } from 'react'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Small cyan dot + lagging ring following the cursor (VISUAL_CRAFT.md,
 * "build it all, trim later" list). Pure ref/transform-driven, no React
 * state, matching the site's established no-re-render-on-frequent-events
 * pattern (useScrollScrub, the Marquee rAF loop). Off entirely on touch
 * devices and under reduced motion, checked once like every other
 * reduced-motion gate in this codebase. */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  // Lazy-initialized once, matching every other reduced-motion check in this
  // codebase — not a live-updating listener, same convention throughout.
  const [enabled] = useState(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    return !prefersReducedMotion && !isCoarsePointer
  })

  useEffect(() => {
    if (!enabled) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...target }

    function handleMove(e: PointerEvent) {
      target.x = e.clientX
      target.y = e.clientY
    }
    window.addEventListener('pointermove', handleMove)

    let raf = 0
    function tick() {
      // Scroll-velocity-reactive intensity: the ring flares briefly on a
      // fast scroll rather than staying a fixed size (VISUAL_CRAFT.md).
      const flare = Math.min(1, Math.abs(scrollVelocity.current) / 40)
      ringPos.x += (target.x - ringPos.x) * 0.18
      ringPos.y += (target.y - ringPos.y) * 0.18
      dot!.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      ring!.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${1 + flare * 0.6})`
      ring!.style.opacity = String(0.5 + flare * 0.5)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', handleMove)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-100 h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-100 h-8 w-8 rounded-full border border-[var(--color-accent-primary)]"
      />
    </>
  )
}

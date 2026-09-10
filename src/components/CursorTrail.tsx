import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

const COLORS = ['var(--color-accent-primary)', 'var(--color-fg)']
const TRAIL_LENGTH = 8
const MIN_SPAWN_INTERVAL_MS = 40

/** Cursor trail (EFFECTS_PLAN.md experimental trio, ref: "flair cursor
 * follower"). The reference demo scatters raster PNG images sampled from
 * its own multi-hue asset set — recolored here to plain CSS-drawn dots in
 * the site's 2-color palette instead of hotlinking/importing the demo's own
 * art, keeping the same GSAP mechanic (elastic pop-in, random rotation,
 * fade-out). Trial basis per EFFECTS_PLAN.md — first to cut alongside
 * CanvasParticles if it clashes with the existing CustomCursor dot+ring
 * (see Task 13). Off under reduced motion / coarse pointers, same
 * convention as CustomCursor. */
export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (prefersReducedMotion || isCoarsePointer) return

    const container = containerRef.current
    if (!container) return

    const pool: HTMLDivElement[] = []
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const dot = document.createElement('div')
      dot.style.position = 'fixed'
      dot.style.top = '0'
      dot.style.left = '0'
      dot.style.width = '10px'
      dot.style.height = '10px'
      dot.style.borderRadius = '50%'
      dot.style.pointerEvents = 'none'
      dot.style.opacity = '0'
      dot.style.zIndex = '95'
      dot.style.background = COLORS[i % COLORS.length]
      container.appendChild(dot)
      pool.push(dot)
    }

    let nextIndex = 0
    let lastSpawn = 0
    function handleMove(e: PointerEvent) {
      const now = performance.now()
      if (now - lastSpawn < MIN_SPAWN_INTERVAL_MS) return
      lastSpawn = now

      const dot = pool[nextIndex]
      nextIndex = (nextIndex + 1) % pool.length

      gsap.killTweensOf(dot)
      gsap.set(dot, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 })
      gsap
        .timeline()
        .fromTo(
          dot,
          { opacity: 0, scale: 0 },
          { opacity: 0.85, scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' },
        )
        .to(dot, {
          opacity: 0,
          scale: 0.4,
          rotation: 'random(-180, 180)',
          duration: 0.5,
          ease: 'power2.in',
        })
    }

    window.addEventListener('pointermove', handleMove)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      pool.forEach((dot) => dot.remove())
    }
  }, [])

  return <div ref={containerRef} aria-hidden="true" />
}

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

// Two states for the footer panel's top edge — flat, and a gentle upward
// bulge — animated between via plain coordinate tweening (not MorphSVG,
// which Task 8 introduces for the text-morph beat) based on how fast the
// visitor was scrolling when the footer entered view (EFFECTS_PLAN.md, ref:
// "Footer Bounce Based on Scroll Speed").
const FLAT_Y = 40
// -10 (a 50-unit swing against a 120-unit viewBox) read as barely-there
// against the previous fix's low-contrast fill — bumped to a swing big
// enough to actually register as a bounce, not just a shimmer.
const BULGE_Y = -32

export function FooterWave() {
  const pathRef = useRef<SVGPathElement>(null)
  const rootRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const path = pathRef.current
      const root = rootRef.current
      if (!path || !root) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      const state = { y: FLAT_Y }
      function render() {
        path!.setAttribute(
          'd',
          `M0,${FLAT_Y} C 300,${state.y} 900,${state.y} 1200,${FLAT_Y} L1200,120 L0,120 Z`,
        )
      }
      render()

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        onEnter: (self) => {
          const velocity = Math.abs(self.getVelocity())
          const intensity = Math.min(1, velocity / 1200)
          gsap
            .timeline()
            .to(state, {
              y: BULGE_Y,
              duration: 0.3 + intensity * 0.2,
              ease: 'power2.out',
              onUpdate: render,
            })
            .to(state, {
              y: FLAT_Y,
              duration: 0.5,
              ease: 'elastic.out(1, 0.4)',
              onUpdate: render,
            })
        },
      })

      return () => trigger.kill()
    },
    { scope: rootRef },
  )

  return (
    <svg
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute -top-[1px] left-0 w-full"
      height="60"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      {/* --color-surface (#111) against the body's near-black vignette was
       * ~1.05:1 — invisible. A 22% accent mix only got to ~1.8:1, still too
       * close to the background to register. This goes most of the way to
       * the full accent color, with a matching glow, so the edge actually
       * reads as "lit" rather than a faint shimmer. */}
      <path
        ref={pathRef}
        fill="color-mix(in srgb, var(--color-accent-primary) 85%, var(--color-surface))"
        style={{
          filter:
            'drop-shadow(0 0 18px color-mix(in srgb, var(--color-accent-primary) 60%, transparent))',
        }}
      />
    </svg>
  )
}

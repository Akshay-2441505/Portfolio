import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

// Two states for the footer panel's top edge — flat, and a gentle upward
// bulge — animated between via plain coordinate tweening (not MorphSVG,
// which Task 8 introduces for the text-morph beat) based on how fast the
// visitor was scrolling when the footer entered view (EFFECTS_PLAN.md, ref:
// "Footer Bounce Based on Scroll Speed").
const FLAT_Y = 40
// Previous attempt made the whole element permanently taller (110px) to
// force a bigger bounce — that just reads as "there's a big thick bar
// sitting here," visible even at rest, not "something bounced." Reverted
// to a slim resting height and instead let the peak swing outside the
// SVG's own box (overflow: visible below) only while animating, so the
// bulge can be dramatic without the resting divider being thick.
const BULGE_Y = -70

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
          // Elastic on the way up too, not just the return — a linear/power
          // rise into an elastic settle reads as "snap then wobble," two
          // different physics in one motion. Elastic both ways is one
          // continuous spring, which is what an actual bounce looks like.
          gsap
            .timeline()
            .to(state, {
              y: BULGE_Y,
              duration: 0.4 + intensity * 0.2,
              ease: 'elastic.out(1, 0.65)',
              onUpdate: render,
            })
            .to(state, {
              y: FLAT_Y,
              duration: 0.6,
              ease: 'elastic.out(1, 0.5)',
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
      className="pointer-events-none absolute -top-[1px] left-0 w-full overflow-visible"
      height="40"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      {/* --color-surface (#111) against the body's near-black vignette was
       * ~1.05:1 — invisible. A 22% accent mix only got to ~1.8:1, still too
       * close to the background to register. This goes most of the way to
       * the full accent color, with a matching glow, so the edge actually
       * reads as "lit" rather than a faint shimmer.
       *
       * overflow-visible + a slim 40px resting height (not the box itself)
       * is what lets BULGE_Y swing well past the box during the animation
       * without clipping into a flat rectangle, while the divider still
       * reads as thin at rest. */}
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

import { useId, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

// Two states for the footer panel's top edge — flat, and a gentle upward
// bulge — animated between via plain coordinate tweening (not MorphSVG,
// which Task 8 introduces for the text-morph beat) based on how fast the
// visitor was scrolling when the footer entered view (EFFECTS_PLAN.md, ref:
// "Footer Bounce Based on Scroll Speed").
//
// The reference clip's own footer graphic is a full colored panel filling a
// large share of the bottom viewport (viewBox ~2278x683, roughly a 3:1
// width:height panel), not a thin decorative line — two earlier attempts at
// "make it stronger" kept the panel a thin strip and just tuned its color/
// amplitude, which could never read the same way regardless of tuning. This
// version matches the reference's actual scale: a tall gradient panel in the
// palette's deep beige tone, with the curve as its top edge.
const VIEWBOX_HEIGHT = 400
const FLAT_Y = 120
const BULGE_Y = 55

export function FooterWave() {
  const pathRef = useRef<SVGPathElement>(null)
  const rootRef = useRef<SVGSVGElement>(null)
  const gradientId = useId()

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
          `M0,${FLAT_Y} C 300,${state.y} 900,${state.y} 1200,${FLAT_Y} L1200,${VIEWBOX_HEIGHT} L0,${VIEWBOX_HEIGHT} Z`,
        )
      }
      render()

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        onEnter: (self) => {
          const velocity = Math.abs(self.getVelocity())
          const intensity = Math.min(1, velocity / 1200)
          // Elastic both ways — one continuous spring, not a snap up
          // followed by a different wobble down.
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
      className="pointer-events-none absolute -top-[1px] left-0 z-0 w-full"
      height="220"
      viewBox={`0 0 1200 ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {/* Gradient fill, not a flat color — the reference's panel is lit
       * brightest right at the curve and fades out beneath it, reading as a
       * glow spilling down rather than a solid block that would fight with
       * the section's own text sitting on top of it. */}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-deep)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-deep)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path ref={pathRef} fill={`url(#${gradientId})`} />
    </svg>
  )
}

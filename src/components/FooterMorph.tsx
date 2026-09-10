import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, MorphSVGPlugin, ScrollTrigger, SplitText } from '../lib/gsap'

// A one-time farewell beat (EFFECTS_PLAN.md, ref: MorphSVG convertToPath())
// — an abstract shape (never football-shaped: RESET.md reserves the ball
// silhouette for the single Hero object only) resolves from a circle into a
// soft blob, synced with a word reveal of "See Ya." The reference demo
// morphs between abstract shapes, not text — MorphSVG has no font-outline
// pipeline to derive glyph paths from a string, so the words arrive via the
// same SplitText mechanism already proven elsewhere on this site (Hero,
// WordReveal) instead of faking a text-morph MorphSVG can't actually do.
const BLOB_PATH =
  'M50,10 C75,10 90,35 85,55 C80,80 55,90 40,80 C20,68 10,45 20,25 C27,12 38,10 50,10 Z'

export function FooterMorph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const wordsRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const circle = circleRef.current
      const words = wordsRef.current
      if (!circle || !words) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      MorphSVGPlugin.convertToPath(circle)
      const split = new SplitText(words, { type: 'words' })
      gsap.set(split.words, { opacity: 0, yPercent: 40 })

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'bottom bottom',
        once: true,
        onEnter: () => {
          gsap
            .timeline()
            .to(circle, { morphSVG: { shape: BLOB_PATH }, duration: 1, ease: 'power2.inOut' })
            .to(
              split.words,
              { opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' },
              '-=0.5',
            )
        },
      })

      return () => {
        trigger.kill()
        split.revert()
      }
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="mt-16 flex flex-col items-center gap-4">
      <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r="40"
          fill="var(--color-accent-primary)"
          opacity="0.5"
        />
      </svg>
      <p
        ref={wordsRef}
        className="font-mono text-sm uppercase tracking-widest text-[var(--color-muted)]"
      >
        See Ya.
      </p>
    </div>
  )
}

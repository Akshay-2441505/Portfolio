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
  const svgRef = useRef<SVGSVGElement>(null)
  const wordsRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const svg = svgRef.current
      const words = wordsRef.current
      if (!svg || !words) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      // convertToPath REPLACES the <circle> with a brand-new <path> and
      // returns it, so the tween must target the return value — the original
      // node is detached from here on.
      //
      // Resolve that node from the live DOM rather than from a ref captured
      // at mount: this effect runs twice under StrictMode in dev (and again
      // on any HMR update), and by the second run a stored circle ref points
      // at the already-detached original. Converting *that* yields a path
      // that was never in the document, so the morph silently animates an
      // orphan — no console warning, no visible change. Re-reading the SVG
      // and only converting while it's still a circle makes this idempotent.
      const current = svg.querySelector('circle, path') as
        | SVGCircleElement
        | SVGPathElement
        | null
      if (!current) return
      const shape =
        current instanceof SVGCircleElement ? MorphSVGPlugin.convertToPath(current)[0] : current

      const split = new SplitText(words, { type: 'words' })
      gsap.set(split.words, { opacity: 0, yPercent: 40 })

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        // 'bottom bottom' required scrolling to the literal last pixel of
        // the page (past this block, past the copyright line) — in normal
        // use, most visitors never reach that exact point once they've seen
        // the contact info, so the beat almost never fired. 'top 85%' fires
        // as soon as this block starts entering from the bottom of the
        // viewport, which normal scrolling reliably passes through.
        start: 'top 85%',
        once: true,
        onEnter: () => {
          // A scale pulse on the whole SVG, synced with the shape morph —
          // insurance against the transformation being too subtle to
          // register even when it's working correctly: a size change is
          // much harder to miss than a shape change alone at this size.
          gsap
            .timeline()
            .to(svg, { scale: 1.25, duration: 0.5, ease: 'power2.out' }, 0)
            .to(svg, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, 0.5)
            .to(shape, { morphSVG: { shape: BLOB_PATH }, duration: 1.1, ease: 'power2.inOut' }, 0)
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
      <svg ref={svgRef} width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="var(--color-accent-primary)"
          opacity="0.85"
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

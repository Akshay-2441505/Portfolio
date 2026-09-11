import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, MorphSVGPlugin, ScrollTrigger, SplitText } from '../lib/gsap'

// A one-time farewell beat (EFFECTS_PLAN.md, ref: MorphSVG convertToPath())
// — the reference clip shows simple shapes (triangle/square/circle) each
// morphing into a single letter (A/B/C) built from pre-authored path data;
// MorphSVGPlugin has no font-outline pipeline of its own to derive glyph
// shapes from a string, so those letterforms are an asset GreenSock drew by
// hand, not something the plugin generates. Same approach here: simple
// straight-edged block letters (a stencil-font look, matching the site's
// geometric minimalism) authored as small bitmaps and turned into rect-
// union paths below, morphed through in sequence — S, E, Y, A — mirroring
// the reference's one-shape-becomes-one-letter pattern, just done as a
// sequence on a single shape instead of in parallel across three.
const BLOB_PATH =
  'M50,10 C75,10 90,35 85,55 C80,80 55,90 40,80 C20,68 10,45 20,25 C27,12 38,10 50,10 Z'

// 6x8 bitmaps, one row per string, '1' = filled cell. Simple enough to
// author and verify by eye, and a handful of rectangles per letter keeps
// each morph target far simpler than a real typographic outline would be —
// simple-to-simple is what morphs cleanly; a circle morphing into dozens of
// fine bezier points is where MorphSVG tends to look messy mid-transition.
const LETTER_BITMAPS: Record<string, string[]> = {
  S: ['011110', '100001', '100000', '011110', '000001', '000001', '100001', '011110'],
  E: ['111111', '100000', '100000', '111100', '100000', '100000', '100000', '111111'],
  Y: ['100001', '100001', '010010', '001100', '001100', '001100', '001100', '001100'],
  A: ['011110', '100001', '100001', '111111', '100001', '100001', '100001', '100001'],
}

const CELL = 10
const OFFSET_X = 20
const OFFSET_Y = 10

/** Converts a bitmap into a compound SVG path `d` string, merging
 * horizontally-adjacent filled cells in each row into one rect (fewer
 * subpaths, simpler morph target) rather than one rect per cell. */
function bitmapToPath(bitmap: string[]): string {
  const rects: string[] = []
  bitmap.forEach((row, r) => {
    let runStart = -1
    for (let c = 0; c <= row.length; c++) {
      const filled = c < row.length && row[c] === '1'
      if (filled && runStart === -1) runStart = c
      if (!filled && runStart !== -1) {
        const x = OFFSET_X + runStart * CELL
        const y = OFFSET_Y + r * CELL
        const w = (c - runStart) * CELL
        rects.push(`M${x},${y} h${w} v${CELL} h${-w} Z`)
        runStart = -1
      }
    }
  })
  return rects.join(' ')
}

const LETTER_SEQUENCE = ['S', 'E', 'Y', 'A'].map((letter) => bitmapToPath(LETTER_BITMAPS[letter]))

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
        start: 'top 85%',
        once: true,
        onEnter: () => {
          // A scale pulse on the whole SVG, synced with the first morph step
          // — insurance against the transformation being too subtle to
          // register even when it's working correctly.
          const tl = gsap
            .timeline()
            .to(svg, { scale: 1.25, duration: 0.5, ease: 'power2.out' }, 0)
            .to(svg, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, 0.5)

          // Circle -> S -> E -> Y -> A, holding briefly on each letter so it
          // actually reads before the next morph starts.
          LETTER_SEQUENCE.forEach((letterPath) => {
            tl.to(shape, { morphSVG: { shape: letterPath }, duration: 0.5, ease: 'power2.inOut' })
            tl.to({}, { duration: 0.25 }) // hold
          })
          // Settles back to a soft blob rather than ending on a hard-edged
          // letter — a gentler resting note for a farewell beat.
          tl.to(shape, { morphSVG: { shape: BLOB_PATH }, duration: 0.6, ease: 'power2.inOut' })

          tl.to(
            split.words,
            { opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' },
            '-=1.5',
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

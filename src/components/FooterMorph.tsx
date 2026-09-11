import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, MorphSVGPlugin, ScrollTrigger, SplitText } from '../lib/gsap'

// A farewell beat (EFFECTS_PLAN.md, ref: MorphSVG convertToPath()) — the
// reference clip morphs three SEPARATE shapes (triangle/square/circle),
// each into its own letter (A/B/C), looping back and forth continuously
// (repeat + yoyo) rather than running once and stopping. Earlier versions
// of this got both of those wrong: one shape cycling sequentially through
// every letter at a single spot, and a one-shot `once: true` trigger. This
// version uses one small circle per letter — S, E, E, Y, A — laid out side
// by side, each independently converting to its own path and looping
// between circle and letter forever once triggered.
//
// MorphSVGPlugin has no font-outline pipeline to derive glyph shapes from a
// string — those letterforms in the reference are an asset GreenSock drew
// by hand, not something the plugin generates. Same approach here: simple
// straight-edged block letters (a stencil-font look, matching the site's
// geometric minimalism), authored as small bitmaps and turned into rect-
// union paths below.
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

const WORD = ['S', 'E', 'E', 'Y', 'A']

export function FooterMorph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const wordsRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const svgs = svgRefs.current
      const words = wordsRef.current
      if (svgs.some((svg) => !svg) || !words) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      // Same idempotent convertToPath-from-the-live-DOM pattern as before,
      // just once per shape instead of once total — see the note on why a
      // ref captured at mount isn't safe under StrictMode/HMR double-runs.
      const shapes = svgs.map((svg) => {
        const current = svg!.querySelector('circle, path') as
          | SVGCircleElement
          | SVGPathElement
          | null
        if (!current) return null
        return current instanceof SVGCircleElement
          ? MorphSVGPlugin.convertToPath(current)[0]
          : current
      })
      if (shapes.some((shape) => !shape)) return

      const split = new SplitText(words, { type: 'words' })
      gsap.set(split.words, { opacity: 0, yPercent: 40 })

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          // Words reveal once, same as before — only the shapes loop.
          gsap.to(split.words, {
            opacity: 1,
            yPercent: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
          })

          // Each circle morphs into its own letter with a slight stagger
          // (a small "wave" across the row rather than all five snapping at
          // once), then the whole timeline yoyos back to circles and
          // repeats forever — repeatDelay pauses briefly on each fully-
          // settled state (all circles, all letters) so both read clearly
          // before the next transition starts.
          const loop = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.7 })
          shapes.forEach((shape, i) => {
            const letterPath = bitmapToPath(LETTER_BITMAPS[WORD[i]])
            loop.to(
              shape,
              { morphSVG: { shape: letterPath }, duration: 0.5, ease: 'power2.inOut' },
              i * 0.08,
            )
          })
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
      <div className="flex gap-2">
        {WORD.map((letter, i) => (
          <svg
            key={`${letter}-${i}`}
            ref={(el) => {
              svgRefs.current[i] = el
            }}
            width="44"
            height="52"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="38" fill="var(--color-accent-primary)" opacity="0.85" />
          </svg>
        ))}
      </div>
      <p
        ref={wordsRef}
        className="font-mono text-sm uppercase tracking-widest text-[var(--color-muted)]"
      >
        See Ya.
      </p>
    </div>
  )
}

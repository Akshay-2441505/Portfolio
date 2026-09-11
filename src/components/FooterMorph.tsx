import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, MorphSVGPlugin, ScrollTrigger } from '../lib/gsap'
import { fullTime } from '../data/content'

// Contact's headline (EFFECTS_PLAN.md, ref: MorphSVG convertToPath()) — was
// a small standalone "See Ya." beat near the footer; the user asked for the
// same shape-per-letter morph technique applied directly to the section's
// actual heading instead. One small circle per letter, laid out in word
// groups so the row wraps the same way the text itself would, each circle
// independently converting to a path and looping between circle and letter
// forever (repeat + yoyo) once scrolled into view.
//
// MorphSVGPlugin has no font-outline pipeline to derive glyph shapes from a
// string — these letterforms are hand-authored 6x8 bitmaps turned into
// rect-union paths (a stencil-font look, matching the site's geometric
// minimalism), same approach as the previous "See Ya." version. N and W are
// the two hardest letters to render cleanly on a 6-wide grid — both are
// approximations, not as clean as the others.
const LETTER_BITMAPS: Record<string, string[]> = {
  O: ['011110', '100001', '100001', '100001', '100001', '100001', '100001', '011110'],
  P: ['111110', '100001', '100001', '111110', '100000', '100000', '100000', '100000'],
  E: ['111111', '100000', '100000', '111100', '100000', '100000', '100000', '111111'],
  N: ['100001', '110001', '110001', '101001', '100101', '100011', '100011', '100001'],
  T: ['111111', '001100', '001100', '001100', '001100', '001100', '001100', '001100'],
  R: ['111110', '100001', '100001', '111110', '101000', '100100', '100010', '100001'],
  D: ['111100', '100010', '100001', '100001', '100001', '100001', '100010', '111100'],
  U: ['100001', '100001', '100001', '100001', '100001', '100001', '100001', '011110'],
  C: ['011111', '100000', '100000', '100000', '100000', '100000', '100000', '011111'],
  G: ['011110', '100001', '100000', '100000', '100111', '100001', '100001', '011110'],
  W: ['100001', '100001', '101101', '101101', '101101', '110011', '110011', '100001'],
  H: ['100001', '100001', '100001', '111111', '100001', '100001', '100001', '100001'],
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

// "&" has no clean straight-edge representation on this grid — rendered as
// plain text between word groups rather than risking an unrecognizable
// hand-plotted glyph.
const WORD_GROUPS: string[][] = [
  ['O', 'P', 'E', 'N'],
  ['T', 'O'],
  ['P', 'R', 'O', 'D', 'U', 'C', 'T'],
  ['&'],
  ['G', 'R', 'O', 'W', 'T', 'H'],
]
const LETTERS = WORD_GROUPS.flat().filter((token) => token !== '&')

// Precomputed once at module scope (not during render) so each letter's
// position in LETTERS/refs is a plain value, not a variable mutated while
// mapping over JSX — oxlint flags render-time mutation as unreliable under
// React's double-render passes.
type Token = { char: string; letterIndex: number | null }
const TOKEN_GROUPS: Token[][] = (() => {
  let next = 0
  return WORD_GROUPS.map((group) =>
    group.map((char) => {
      if (char === '&') return { char, letterIndex: null }
      const letterIndex = next
      next += 1
      return { char, letterIndex }
    }),
  )
})()

export function FooterMorph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({})

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      const svgs = LETTERS.map((letter, i) => svgRefs.current[`${letter}-${i}`])
      if (svgs.some((svg) => !svg)) return

      // Same idempotent convertToPath-from-the-live-DOM pattern as before,
      // once per shape — see the note on why a ref captured at mount isn't
      // safe under StrictMode/HMR double-runs.
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

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          // Each circle morphs into its own letter with a slight stagger (a
          // small "wave" across the row), then the whole timeline yoyos
          // back to circles and repeats forever — repeatDelay pauses
          // briefly on each fully-settled state so both read clearly
          // before the next transition starts.
          const loop = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.9 })
          shapes.forEach((shape, i) => {
            const letterPath = bitmapToPath(LETTER_BITMAPS[LETTERS[i]])
            loop.to(
              shape,
              { morphSVG: { shape: letterPath }, duration: 0.45, ease: 'power2.inOut' },
              i * 0.035,
            )
          })
        },
      })

      return () => trigger.kill()
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      {TOKEN_GROUPS.map((group, groupI) => (
        <div key={groupI} className="flex items-center gap-1.5 sm:gap-2">
          {group.map(({ char, letterIndex }) => {
            if (letterIndex === null) {
              return (
                <span
                  key="amp"
                  aria-hidden="true"
                  className="px-1 text-2xl text-[var(--color-muted)] sm:text-3xl"
                >
                  &amp;
                </span>
              )
            }
            const refKey = `${char}-${letterIndex}`
            return (
              <svg
                key={refKey}
                ref={(el) => {
                  svgRefs.current[refKey] = el
                }}
                width="34"
                height="40"
                viewBox="0 0 100 100"
                aria-hidden="true"
                className="sm:h-12 sm:w-10"
              >
                <circle cx="50" cy="50" r="38" fill="var(--color-accent-primary)" opacity="0.85" />
              </svg>
            )
          })}
        </div>
      ))}
      {/* Kept as real accessible text (screen readers, page search,
       * view-source) since the visual heading above is entirely circles/SVG,
       * not text nodes. Sourced from the same content.ts field the WORD_GROUPS
       * above are a hand-authored letter-for-letter match of — if that copy
       * ever changes, WORD_GROUPS needs updating too, same coupling the
       * previous "See Ya." version had. */}
      <span className="sr-only">{fullTime.heading}</span>
    </div>
  )
}

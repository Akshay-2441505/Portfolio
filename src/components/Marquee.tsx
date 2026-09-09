import { useEffect, useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { marqueeItems } from '../data/content'

const half = Math.ceil(marqueeItems.length / 2)
const rowA = [...marqueeItems.slice(0, half), ...marqueeItems.slice(0, half), ...marqueeItems.slice(0, half)]
const rowB = [...marqueeItems.slice(half), ...marqueeItems.slice(half), ...marqueeItems.slice(half)]

// Items glow briefly crossing center-screen (VISUAL_CRAFT.md, "build it all,
// trim later" list) — within this many px of viewport-center on either side.
const GLOW_RADIUS = 90

function Row({
  items,
  rowRef,
  itemRefs,
}: {
  items: string[]
  rowRef: (el: HTMLDivElement | null) => void
  itemRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>
}) {
  return (
    <div ref={rowRef} className="flex w-max gap-12 will-change-transform">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          ref={(el) => {
            itemRefs.current[i] = el
          }}
          className="font-mono text-sm uppercase tracking-widest text-[var(--color-muted)] transition-[text-shadow,color] duration-300"
        >
          {item} <span className="text-[var(--color-accent-primary)]">/</span>
        </span>
      ))}
    </div>
  )
}

/** Matchday Ticker — two rows drifting in opposite directions, speed tied to
 * scroll offset rather than a fixed-duration CSS loop (TECH_SPEC.md §5). */
export function Marquee() {
  const { ref: sectionRef, inView } = useInView<HTMLDivElement>()
  const rowA_Ref = useRef<HTMLDivElement | null>(null)
  const rowB_Ref = useRef<HTMLDivElement | null>(null)
  const rowA_ItemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rowB_ItemRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion || !inView) return

    function applyCenterGlow(items: (HTMLSpanElement | null)[]) {
      const viewportCenter = window.innerWidth / 2
      for (const el of items) {
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.left + rect.width / 2 - viewportCenter)
        if (dist < GLOW_RADIUS) {
          const t = 1 - dist / GLOW_RADIUS
          el.style.textShadow = `var(--glow-primary)`
          el.style.opacity = String(0.6 + t * 0.4)
        } else {
          el.style.textShadow = 'none'
          el.style.opacity = '1'
        }
      }
    }

    let raf = 0
    function tick() {
      const section = sectionRef.current
      if (section) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3
        if (rowA_Ref.current) rowA_Ref.current.style.transform = `translateX(${offset}px)`
        if (rowB_Ref.current) rowB_Ref.current.style.transform = `translateX(${-offset}px)`
        applyCenterGlow(rowA_ItemRefs.current)
        applyCenterGlow(rowB_ItemRefs.current)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, sectionRef])

  return (
    <div
      ref={sectionRef}
      className="space-y-3 overflow-hidden border-y border-[var(--color-border)] py-6"
    >
      <Row items={rowA} rowRef={(el) => { rowA_Ref.current = el }} itemRefs={rowA_ItemRefs} />
      <Row items={rowB} rowRef={(el) => { rowB_Ref.current = el }} itemRefs={rowB_ItemRefs} />
    </div>
  )
}

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'

/** Below this many px of overflow there's nothing worth pinning the page for
 * — the tween would animate ~0px while ScrollTrigger still ate a full
 * viewport of scroll. */
const MIN_SCROLL_DISTANCE = 20

/** Pinned horizontal-scroll line (EFFECTS_PLAN.md, ref: "ContainerAnimation
 * SplitText"). Its own home, not the site's wow moment — that's the Hero
 * football per RESET.md. Text tracks leftward as the visitor scrolls
 * vertically past this section, pinned for the scroll distance it needs to
 * fully pass. */
export function HorizontalText({ text }: { text: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const el = textRef.current
      if (!wrapper || !el) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      // Recomputed on every ScrollTrigger refresh (incl. resize) rather than
      // captured once at mount, so a window resize can't leave the pin
      // distance and the tween disagreeing.
      const distance = () => Math.max(0, el.scrollWidth - wrapper.clientWidth)

      // At desktop widths the tagline fits, so there's no horizontal distance
      // to cover. Pinning anyway would freeze the page for a viewport-height
      // of scroll with zero visible motion — so just leave it in static flow.
      if (distance() < MIN_SCROLL_DISTANCE) return

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          // 'top top' pinned as soon as the wrapper's edge touched the very
          // top of the viewport — while the visitor was still arriving,
          // before the section felt "reached." Triggering once it's
          // comfortably centered reads as intentional instead of early.
          start: 'center center',
          // Previously scaled to the text's own width plus a full viewport
          // height — at the larger type size that's 1000px+ of required
          // scroll, well beyond a single scroll gesture. Most visitors
          // pause partway through and land on a half-revealed, cut-off
          // sentence. A short, fixed range is very likely to be covered by
          // one continuous scroll motion, so the reveal actually completes
          // before a natural pause.
          end: '+=450',
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { scope: wrapperRef },
  )

  return (
    <div ref={wrapperRef} className="overflow-hidden py-12">
      <h3
        ref={textRef}
        className="w-max whitespace-nowrap pl-6 text-5xl font-medium tracking-tight md:pl-10 md:text-7xl lg:pl-24 lg:text-8xl xl:pl-32"
      >
        {text}
      </h3>
    </div>
  )
}

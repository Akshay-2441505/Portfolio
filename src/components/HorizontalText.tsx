import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '../lib/gsap'

/** Below this many px of overflow there's nothing worth pinning the page for
 * — the tween would animate ~0px while ScrollTrigger still ate a full
 * viewport of scroll. */
const MIN_SCROLL_DISTANCE = 20

// Each character starts scattered above the baseline at a random height and
// tilt, then drops flat as it scrolls into the reading position — the
// reference clip shows individual letters settling one at a time (a real
// per-character animation), not the whole line sliding in as one rigid
// block. Kept modest so scattered characters stay inside the wrapper's own
// padding instead of clipping against overflow-hidden.
const CHAR_Y_RANGE: [number, number] = [-55, -20]
const CHAR_ROTATION_RANGE: [number, number] = [-18, 18]
const CHAR_SETTLE_DURATION = 0.4
const CHAR_STAGGER = 0.03

/** Pinned horizontal-scroll line (EFFECTS_PLAN.md, ref: "ContainerAnimation
 * SplitText"). Its own home, not the site's wow moment — that's the Hero
 * football per RESET.md. Text tracks leftward as the visitor scrolls
 * vertically past this section, pinned for the scroll distance it needs to
 * fully pass, while each character individually settles from a scattered
 * tilt into the flat reading line as it arrives. */
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

      const split = new SplitText(el, { type: 'chars' })
      gsap.set(split.chars, {
        yPercent: () => gsap.utils.random(CHAR_Y_RANGE[0], CHAR_Y_RANGE[1]),
        rotation: () => gsap.utils.random(CHAR_ROTATION_RANGE[0], CHAR_ROTATION_RANGE[1]),
      })

      // The line's own horizontal travel and the per-character settle need
      // to finish together — matching the x-tween's duration to the
      // stagger's own total span (rather than two unrelated fixed numbers)
      // keeps them in sync regardless of how many characters the tagline
      // happens to have.
      const totalCharSpan = (split.chars.length - 1) * CHAR_STAGGER + CHAR_SETTLE_DURATION

      const tl = gsap.timeline({
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
      tl.to(el, { x: () => -distance(), ease: 'none', duration: totalCharSpan }, 0)
      tl.to(
        split.chars,
        {
          yPercent: 0,
          rotation: 0,
          ease: 'none',
          duration: CHAR_SETTLE_DURATION,
          stagger: { each: CHAR_STAGGER, from: 'start' },
        },
        0,
      )

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        split.revert()
      }
    },
    { scope: wrapperRef },
  )

  return (
    <div ref={wrapperRef} className="overflow-hidden py-16">
      <h3
        ref={textRef}
        // A fixed Tailwind size (even text-8xl) is a fixed pixel value — it
        // stops overflowing once the viewport grows past it, which is
        // exactly what happened at 1920px (a very common desktop width):
        // distance() hit 0 and the whole effect silently disabled. Sizing
        // by viewport width instead (same technique Hero.tsx already uses
        // for its own headline) keeps the text wider than the viewport by
        // roughly the same proportion at any screen size, so there's always
        // real distance to scroll through.
        className="w-max whitespace-nowrap pl-6 text-[clamp(2.75rem,8vw,11rem)] font-medium tracking-tight md:pl-10"
      >
        {text}
      </h3>
    </div>
  )
}

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'

/** Scroll-pinned reveal for the About photo (EFFECTS_PLAN.md, ref: "Image
 * comparison on scroll" — that demo wipes between two images; this site has
 * no before/after pair, so it's adapted to a single-image reveal: a solid
 * panel wipes away as the visitor scrolls past, using the same
 * scroll-scrubbed mechanic rather than the two-image comparison itself). */
export function ImageReveal({ src, alt }: { src: string; alt: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const panel = panelRef.current
      if (!section || !panel) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) {
        gsap.set(panel, { scaleX: 0 })
        return
      }

      const tween = gsap.fromTo(
        panel,
        { scaleX: 1 },
        {
          scaleX: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 25%',
            scrub: true,
          },
        },
      )

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { scope: sectionRef },
  )

  return (
    <div
      ref={sectionRef}
      className="relative mt-16 overflow-hidden rounded-2xl border border-[var(--color-border)]"
    >
      {/* Intrinsic size of /akshay-photo.jpg — reserves the aspect ratio so
       * the box doesn't collapse and reflow when the image lands. Below the
       * fold, so it loads lazily. */}
      <img
        src={src}
        alt={alt}
        width={490}
        height={580}
        loading="lazy"
        className="block h-auto w-full object-cover"
      />
      <div
        ref={panelRef}
        style={{ transformOrigin: 'right center' }}
        className="absolute inset-0 bg-[var(--color-surface)]"
      />
    </div>
  )
}

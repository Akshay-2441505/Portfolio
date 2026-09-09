import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap'
import { motionTokens } from '../lib/motion'

/** Word-by-word scroll-triggered reveal — the same SplitText mechanism
 * already used for the Preloader/Hero name (char-based, load-triggered),
 * reused here word-based and scroll-triggered (VISUAL_CRAFT.md: "extend the
 * word-by-word scroll-reveal technique already built for the Preloader
 * name"). One-shot, not scrubbed — plays once when scrolled into view. */
export function WordReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const split = new SplitText(el, { type: 'words' })
    gsap.set(split.words, { opacity: 0, yPercent: 40 })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(split.words, {
          opacity: 1,
          yPercent: 0,
          duration: motionTokens.duration.base,
          stagger: motionTokens.stagger,
          ease: 'expo.out', // native GSAP equivalent of ease.patient
        })
      },
    })

    return () => {
      trigger.kill()
      split.revert()
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

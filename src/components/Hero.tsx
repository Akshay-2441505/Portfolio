import { Download } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'
import { NetworkGraph } from './NetworkGraph'
import { gsap, SplitText } from '../lib/gsap'
import { heroCopy, profile } from '../data/content'

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)

  // No preloader gating this anymore — the char reveal plays immediately on
  // mount and doubles as the page's entrance moment.
  useEffect(() => {
    if (!nameRef.current) return
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const split = new SplitText(nameRef.current, { type: 'chars' })
    gsap.set(split.chars, { yPercent: 120, opacity: 0 })
    const tween = gsap.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.03,
      ease: 'expo.out',
    })

    return () => {
      tween.kill()
      split.revert()
    }
  }, [])

  return (
    <section
      id="top"
      className="relative flex h-screen flex-col justify-between overflow-hidden px-6 pt-24 pb-10 md:px-10"
    >
      {/* A quiet node network standing in for the hero's old 3D showpiece
       * (football → metaball face → sculpted head → raymarched chrome blob
       * — none of it landed). Plain SVG/GSAP, no WebGL, no progressive-
       * enhancement fallback needed. Boxed rather than full-bleed so it
       * doesn't sit behind the headline. Hidden below md for the same
       * reason the old headshot photo was — the headline already claims
       * most of the width on narrow viewports. */}
      <div className="pointer-events-none absolute right-6 bottom-10 hidden h-80 w-80 md:block lg:right-10 lg:h-[28rem] lg:w-[28rem]">
        <NetworkGraph />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6">
        <h1
          ref={nameRef}
          className="font-serif text-[13vw] leading-[0.95] font-medium tracking-tight sm:text-[10vw] md:text-[7.5vw]"
        >
          {heroCopy.headline}
        </h1>
        <FadeIn delay={0.35}>
          <p className="max-w-md text-lg text-[var(--color-muted)] md:text-xl">
            {heroCopy.subLine}
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-fg)]">
            {heroCopy.positionTag}
          </p>
        </FadeIn>
        <FadeIn delay={0.45}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
            {heroCopy.metaLine}
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={0.5}>
        <div className="flex flex-wrap items-center justify-start gap-6">
          <Magnetic>
            <a
              href={profile.resumeUrl}
              download
              className="flex items-center gap-2 rounded-full bg-[var(--color-fg)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[var(--color-bg)] transition-opacity hover:opacity-80"
            >
              <Download size={14} />
              Resume
            </a>
          </Magnetic>
        </div>
      </FadeIn>
    </section>
  )
}

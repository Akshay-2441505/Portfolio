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
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="relative">
          <h1
            ref={nameRef}
            className="font-serif text-[13vw] leading-[0.95] font-medium tracking-tight sm:text-[10vw] md:text-[7.5vw]"
          >
            {heroCopy.headline}
          </h1>
          {/* A quiet node network standing in for the hero's old 3D showpiece
           * (football → metaball face → sculpted head → raymarched chrome
           * blob — none of it landed). Plain SVG/GSAP, no WebGL. Absolutely
           * positioned and centered on the headline's own box rather than a
           * flex sibling — a flex sibling's height (320px at lg) dwarfs the
           * headline's (~110px), and `items-center` split that difference
           * as dead space below the name before the next line. Hidden below
           * md for the same reason the old headshot photo was — the
           * headline already claims most of the width on narrow viewports. */}
          <div className="absolute top-1/2 right-0 hidden h-64 w-64 -translate-y-1/2 md:block lg:h-80 lg:w-80">
            <NetworkGraph />
          </div>
        </div>
        <FadeIn delay={0.35}>
          <p className="max-w-md text-lg text-[var(--color-muted)] md:text-xl">
            {heroCopy.subLine}
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

import { Download } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { FadeIn } from './FadeIn'
import { FrameSequence } from './FrameSequence'
import { Magnetic } from './Magnetic'
import { gsap, SplitText } from '../lib/gsap'
import { hasWebGL } from '../lib/webgl'
import { heroCopy, profile } from '../data/content'

const HeroScene = lazy(() => import('./HeroScene').then((m) => ({ default: m.HeroScene })))

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  // Checked once, before any <Canvas> would mount — the whole progressive-
  // enhancement contract (WEBGL_UPGRADE.md) is that detection happens first
  // so there's never a flash between the WebGL and Canvas-2D paths.
  const webglSupported = useMemo(() => hasWebGL(), [])

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
      {/* The chrome metaball face (gionatannese.com/about reference) —
       * replaces both the old full-bleed football-behind-text layer and the
       * headshot photo that used to sit here (the photo still appears in
       * About, so nothing is lost). Boxed rather than full-bleed: it no
       * longer needs to sit behind the headline, which also sidesteps the
       * legibility problem a large object behind text caused before.
       * Hidden below md for the same reason the photo was — the headline
       * already claims most of the width on narrow viewports. */}
      <div className="pointer-events-none absolute right-6 bottom-16 hidden h-64 w-64 md:block lg:right-10 lg:h-80 lg:w-80">
        {webglSupported ? (
          <Suspense fallback={<FrameSequence />}>
            <HeroScene />
          </Suspense>
        ) : (
          <FrameSequence />
        )}
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

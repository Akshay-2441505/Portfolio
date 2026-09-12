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
    /* `isolate` is load-bearing, not decoration: the WebGL layer below sits at
     * -z-10, and without a stacking context on this section that layer
     * resolves against the ROOT one — painting underneath body's opaque
     * radial-gradient background, so the football renders but is invisible. */
    <section
      id="top"
      className="relative isolate flex h-screen flex-col justify-between overflow-hidden px-6 pt-24 pb-10 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        {webglSupported ? (
          <Suspense fallback={<FrameSequence />}>
            <HeroScene />
          </Suspense>
        ) : (
          <FrameSequence />
        )}
      </div>

      {/* Magnet-hover hero portrait (TECH_SPEC.md §2, confirmed to build in
       * WEBGL_UPGRADE.md) — a real photo, not a purchased/generic 3D avatar.
       * Hidden below md: the headline already claims most of the width on
       * narrow viewports and there's no room to add it without crowding. */}
      <div className="pointer-events-none absolute right-6 bottom-28 hidden md:block lg:right-10">
        <Magnetic strength={26} className="pointer-events-auto">
          <img
            src="/akshay-photo.jpg"
            alt=""
            className="w-40 rounded-2xl border border-[var(--color-border)] object-cover shadow-lg lg:w-52"
          />
        </Magnetic>
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

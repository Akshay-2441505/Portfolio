import { Download } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { FadeIn } from './FadeIn'
import { FrameSequence } from './FrameSequence'
import { Magnetic } from './Magnetic'
import { gsap, SplitText } from '../lib/gsap'
import { hasWebGL } from '../lib/webgl'
import { heroCopy, profile } from '../data/content'

const HeroScene = lazy(() => import('./HeroScene').then((m) => ({ default: m.HeroScene })))

export function Hero({ revealReady }: { revealReady: boolean }) {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)
  // Checked once, before any <Canvas> would mount — the whole progressive-
  // enhancement contract (WEBGL_UPGRADE.md) is that detection happens first
  // so there's never a flash between the WebGL and Canvas-2D paths.
  const webglSupported = useMemo(() => hasWebGL(), [])

  // Hide the chars immediately on mount — this runs while the preloader is
  // still covering the screen, so there's no flash of plain text before the
  // reveal tween below gets a chance to run.
  useEffect(() => {
    if (!nameRef.current) return
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const split = new SplitText(nameRef.current, { type: 'chars' })
    gsap.set(split.chars, { yPercent: 120, opacity: 0 })
    splitRef.current = split

    return () => split.revert()
  }, [])

  // The actual reveal only plays once the preloader has cleared.
  useEffect(() => {
    if (!revealReady || !splitRef.current) return
    const tween = gsap.to(splitRef.current.chars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.03,
      ease: 'expo.out',
    })
    return () => {
      tween.kill()
    }
  }, [revealReady])

  return (
    <section
      id="top"
      className="relative flex h-screen flex-col justify-between overflow-hidden px-6 pt-24 pb-10 md:px-10"
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
            className="w-40 rounded-2xl border border-[var(--color-border)] object-cover shadow-[var(--glow-primary)] lg:w-52"
          />
        </Magnetic>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6">
        <h1
          ref={nameRef}
          className="text-[13vw] leading-[0.95] font-bold tracking-tight uppercase sm:text-[10vw] md:text-[7.5vw]"
        >
          {heroCopy.headline}
        </h1>
        <FadeIn delay={0.35}>
          <p className="max-w-md text-lg text-[var(--color-muted)] md:text-xl">
            {heroCopy.subLine}
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
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

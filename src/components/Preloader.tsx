import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText } from '../lib/gsap'
import { profile } from '../data/content'

/** A one-time boot sequence — plays once per browser session, then gets out
 * of the way. Name-reveal only: the kickoff-video phase (RESET.md retires
 * kickoff-reveal.mp4/webm) is gone — this is back to the original mechanic
 * CONTENT.md specifies ("Kickoff (Preloader) — Name reveal only, unchanged
 * mechanic"). The per-char stagger below is the EFFECTS_PLAN.md "Preloader
 * — staggered name reveal" technique (ref: GSAP 101 - Staggers) applied to
 * this same reveal. */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [hidden, setHidden] = useState(false)
  const runExitRef = useRef<() => void>(() => {})

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      setHidden(true)
      onComplete()
      return
    }

    document.body.style.overflow = 'hidden'
    const split = nameRef.current
      ? new SplitText(nameRef.current, { type: 'chars' })
      : null
    if (split) gsap.set(split.chars, { yPercent: 120, opacity: 0 })

    let exitStarted = false
    function runExit() {
      if (exitStarted) return
      exitStarted = true
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          setHidden(true)
          onComplete()
        },
      })
      if (split) {
        tl.to(
          split.chars,
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'expo.out' },
          0,
        )
      }
      tl.to(rootRef.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.6')
    }
    runExitRef.current = runExit

    // Paces the boot sequence without a video to key off — long enough for
    // the stagger to read, short enough not to feel like a stall.
    const timer = window.setTimeout(runExit, 1800)

    return () => {
      split?.revert()
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (hidden) return null

  return (
    <div
      ref={rootRef}
      onClick={() => runExitRef.current()}
      className="fixed inset-0 z-200 flex cursor-pointer flex-col justify-between overflow-hidden bg-[var(--color-bg)] px-6 py-6 md:px-10 md:py-8"
    >
      <p className="relative font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
        Compiling portfolio<span className="text-[var(--color-accent-primary)]">_</span>
      </p>
      <h1
        ref={nameRef}
        className="relative text-[13vw] leading-none font-bold tracking-tight uppercase sm:text-[10vw]"
      >
        {profile.name}
      </h1>
      <div className="relative flex items-end justify-between font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
        <span>{profile.location}</span>
      </div>
      <p className="relative self-end font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        Skip →
      </p>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText } from '../lib/gsap'
import { profile } from '../data/content'

// The generated clip runs ~5.46s — longer than KICKOFF_VIDEO.md's 3-4s
// target, since it needs room for both the hidden build-up and the reveal.
// Kept at full length rather than trimmed down; flagged as a deviation in
// STATUS.md, not silently accepted as "close enough."
const REVEAL_LEAD = 1.2 // seconds before video end to start the name cross-fade
const FALLBACK_MS = 8000 // safety net if the video never fires an event (blocked autoplay, load failure)

/** A one-time boot sequence — plays once per browser session, then gets out
 * of the way. The kickoff video is atmosphere only: it ends on an abstract
 * glow, and the real name reveal is still the DOM SplitText tween,
 * cross-fading in on top as the video finishes. Skips straight through
 * under reduced motion, with no video at all. */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [hidden, setHidden] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
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
      // Fade-through-black, not a direct crossfade: the video fades out
      // first (revealing the root's own near-black background — no extra
      // overlay layer needed), holds briefly on black, then the name
      // reveals. Previously both rendered at full opacity simultaneously.
      if (video) {
        tl.to(video, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 0)
      }
      if (split) {
        tl.to(
          split.chars,
          { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.03, ease: 'expo.out' },
          0.5,
        )
      }
      tl.to(rootRef.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.5')
    }
    runExitRef.current = runExit

    const video = videoRef.current

    function handleTimeUpdate() {
      if (!video || exitStarted) return
      if (counterRef.current) {
        const pct = video.duration
          ? Math.min(100, Math.floor((video.currentTime / video.duration) * 100))
          : 0
        counterRef.current.textContent = String(pct).padStart(3, '0')
      }
      if (video.duration && video.currentTime >= video.duration - REVEAL_LEAD) {
        runExit()
      }
    }
    function handleCanPlay() {
      setVideoReady(true)
    }

    video?.addEventListener('timeupdate', handleTimeUpdate)
    video?.addEventListener('ended', runExit)
    video?.addEventListener('canplay', handleCanPlay)

    const fallback = window.setTimeout(runExit, FALLBACK_MS)

    return () => {
      split?.revert()
      video?.removeEventListener('timeupdate', handleTimeUpdate)
      video?.removeEventListener('ended', runExit)
      video?.removeEventListener('canplay', handleCanPlay)
      window.clearTimeout(fallback)
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
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: videoReady ? 0.85 : 0 }}
      >
        <source src="/kickoff-reveal.webm" type="video/webm" />
        <source src="/kickoff-reveal.mp4" type="video/mp4" />
      </video>

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
        <span ref={counterRef} className="text-2xl text-[var(--color-fg)]">
          000
        </span>
      </div>
      <p className="relative self-end font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        Skip →
      </p>
    </div>
  )
}

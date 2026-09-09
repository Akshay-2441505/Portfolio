import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { motionTokens } from '../lib/motion'

// Progress (0..1) at which the clock reads "90'" — the remaining ~8% of the
// document plays out as stoppage time, since Contact is always the last
// section. If a future section gets added after Contact and this drifts,
// swap to measuring #contact's own position instead of a fixed fraction.
const REGULAR_END = 0.92

function currentMinute(progress: number) {
  return Math.min(90, Math.floor((Math.min(progress, REGULAR_END) / REGULAR_END) * 90))
}

function formatClock(progress: number) {
  if (progress < REGULAR_END) {
    return { label: `${currentMinute(progress)}′`, stoppage: false }
  }
  const stoppageT = (progress - REGULAR_END) / (1 - REGULAR_END)
  const stoppageMinute = Math.max(1, Math.min(5, Math.ceil(stoppageT * 5)))
  return { label: `90+${stoppageMinute}′`, stoppage: true }
}

/** A fixed match-clock (0' -> 90'+) that ticks up with whole-document scroll
 * progress — the site's scroll-progress indicator, football-themed. */
export function MatchClock() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrapperEl = wrapperRef.current
    const numberEl = numberRef.current
    if (!wrapperEl || !numberEl) return

    function render(progress: number) {
      const { label, stoppage } = formatClock(progress)
      numberEl!.textContent = label
      wrapperEl!.classList.toggle('is-stoppage', stoppage)
      // Set inline, not just via the .is-stoppage class: Tailwind v4 emits its
      // own border-color utility into the same cascade layer as this file's
      // plain CSS, so the higher-specificity class selector alone doesn't
      // reliably win. Inline style always wins regardless of layer order.
      wrapperEl!.style.borderColor = stoppage
        ? 'var(--color-accent-live)'
        : 'var(--color-border)'
      wrapperEl!.style.boxShadow = stoppage ? 'var(--glow-live)' : 'none'
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      const onScroll = () => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        render(max > 0 ? window.scrollY / max : 0)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    let lastMinuteShown = -1
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        render(self.progress)
        const minute = currentMinute(self.progress)
        if (minute !== lastMinuteShown) {
          lastMinuteShown = minute
          gsap.fromTo(
            wrapperEl,
            { scale: 1 },
            {
              scale: 1.06,
              duration: motionTokens.duration.instant,
              ease: 'power2.out', // GSAP-native equivalent of ease.decisive
              yoyo: true,
              repeat: 1,
            },
          )
        }
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="match-clock pointer-events-none fixed bottom-5 left-5 z-30 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/70 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)] backdrop-blur-sm"
    >
      <span className="clock-dot h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" />
      <span ref={numberRef}>{'0′'}</span>
    </div>
  )
}

import type { ReactNode } from 'react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { FadeIn } from './FadeIn'
import { education, fifaCard } from '../data/content'
import { hasWebGL } from '../lib/webgl'
import { motionTokens } from '../lib/motion'

const FifaCardScene = lazy(() =>
  import('./FifaCardScene').then((m) => ({ default: m.FifaCardScene })),
)

const currentEducation = education[0]

type Side = 'left' | 'right'

function SidePanel({
  side,
  label,
  active,
  onActivate,
  onDeactivate,
  children,
}: {
  side: Side
  label: string
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
  children: ReactNode
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      onClick={onActivate}
      className={`hidden w-72 shrink-0 cursor-pointer flex-col justify-center outline-none xl:flex ${
        side === 'left' ? 'items-end text-right' : 'items-start text-left'
      }`}
    >
      <p
        className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)] transition-opacity"
        style={{ opacity: active ? 1 : 0.4 }}
      >
        {label}
      </p>
      <div
        className="mt-3 max-w-xs transition-opacity"
        style={{
          opacity: active ? 1 : 0,
          transitionDuration: `${motionTokens.duration.base}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** About + Skills merged into one FIFA card. On large screens the empty
 * space beside the card becomes two hover-reveal panels (story / the
 * numbers) instead of hiding that content behind a flip. Below xl,
 * both panels render stacked and always-visible instead — there's no
 * spare side space to hover into on a narrow screen. */
export function FifaCard() {
  const [active, setActive] = useState<Side | null>(null)
  const webglSupported = useMemo(() => hasWebGL(), [])

  const storyContent = (
    <>
      <p className="text-sm leading-relaxed text-[var(--color-fg)]">{fifaCard.bio}</p>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        {currentEducation.degree} · {currentEducation.school} · {currentEducation.period}
      </p>
    </>
  )

  const numbersContent = (
    <div className="space-y-3">
      {fifaCard.attributes.map((attr) => (
        <div key={attr.code}>
          <p className="text-sm leading-snug font-bold text-[var(--color-fg)]">
            {attr.skill}{' '}
            <span className="font-mono text-[10px] font-normal uppercase tracking-widest text-[var(--color-accent-primary)]">
              {attr.code} · {attr.rating}
            </span>
          </p>
          <p className="text-xs text-[var(--color-muted)]">{attr.descriptor}</p>
          <p className="mt-1 text-xs leading-snug text-[var(--color-muted)]">{attr.reasoning}</p>
        </div>
      ))}
    </div>
  )

  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn className="mx-auto flex max-w-6xl items-center justify-center gap-6">
        <SidePanel
          side="left"
          label="The Story"
          active={active === 'left'}
          onActivate={() => setActive('left')}
          onDeactivate={() => setActive((s) => (s === 'left' ? null : s))}
        >
          {storyContent}
        </SidePanel>

        <div className="w-[85vw] max-w-[380px] shrink-0">
          {/* Real 3D geometry (WEBGL_UPGRADE.md) with the same explicit
           * aspect-ratio box the old <img> used — the Canvas has non-content
           * -derived dimensions before it ever mounts. Falls back to the
           * static image on devices/browsers without WebGL. */}
          <div
            role="img"
            aria-label={`${fifaCard.name} — ${fifaCard.overall} overall ${fifaCard.position} player card, ${fifaCard.tier}`}
            className="aspect-[765/1095] w-full overflow-hidden rounded-2xl"
          >
            {webglSupported ? (
              <Suspense
                fallback={
                  <img
                    src="/fifa-card.jpg"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                }
              >
                <FifaCardScene />
              </Suspense>
            ) : (
              <img src="/fifa-card.jpg" alt="" className="h-full w-full object-cover" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
            <span>
              Club <span className="text-[var(--color-fg)]">{fifaCard.club}</span>
            </span>
            <span className="text-[var(--color-border)]">/</span>
            <span>
              Nation <span className="text-[var(--color-fg)]">{fifaCard.nation}</span>
            </span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="rounded-full border border-[var(--color-accent-primary)] px-2 py-0.5 text-[var(--color-accent-primary)] shadow-[var(--glow-primary)]">
              {fifaCard.tier}
            </span>
          </div>

          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent-live)]">
            {fifaCard.ribbon}
          </p>

          {/* Below xl there's no side space to hover into — show both
           * panels stacked and always-visible instead. */}
          <div className="mt-8 space-y-6 xl:hidden">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
                The Story
              </p>
              <div className="mt-3">{storyContent}</div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
                The Numbers
              </p>
              <div className="mt-3">{numbersContent}</div>
            </div>
          </div>
        </div>

        <SidePanel
          side="right"
          label="The Numbers"
          active={active === 'right'}
          onActivate={() => setActive('right')}
          onDeactivate={() => setActive((s) => (s === 'right' ? null : s))}
        >
          {numbersContent}
        </SidePanel>
      </FadeIn>
    </section>
  )
}

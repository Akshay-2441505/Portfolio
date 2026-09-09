import { ArrowUpRight } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'
import { ProjectCard } from './ProjectCard'
import { WordReveal } from './WordReveal'
import { Flip, gsap } from '../lib/gsap'
import { moreWork, projects } from '../data/content'

/** Highlights — a click-to-cycle card stack (EFFECTS_PLAN.md, ref: GSAP's
 * "Flip Cards" demo). Click (or press Enter/Space) anywhere on the deck to
 * send the front card to the back; Flip animates every card's position in
 * one pass, with the demo's own onEnter/onLeave treatment for the card
 * arriving at the front and the one leaving it. */
function CardStack() {
  const [order, setOrder] = useState(() => projects.map((p) => p.name))
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const pendingFlipState = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const isFirstRender = useRef(true)

  function cycle() {
    pendingFlipState.current = Flip.getState(Array.from(cardRefs.current.values()))
    setOrder((prev) => [...prev.slice(1), prev[0]])
  }

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const state = pendingFlipState.current
    if (!state) return
    pendingFlipState.current = null

    Flip.from(state, {
      targets: Array.from(cardRefs.current.values()),
      duration: 0.6,
      ease: 'sine.inOut',
      absolute: true,
      onEnter: (elements) =>
        gsap.from(elements, { duration: 0.4, yPercent: 8, opacity: 0, ease: 'expo.out' }),
      onLeave: (elements) =>
        gsap.to(elements, { duration: 0.4, opacity: 0, ease: 'expo.out' }),
    })
  }, [order])

  return (
    <div
      onClick={cycle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          cycle()
        }
      }}
      aria-label="Cycle through highlighted projects"
      className="relative mx-auto h-[75vh] max-h-[720px] w-full max-w-4xl cursor-pointer"
    >
      {order.map((name, depth) => {
        const project = projects.find((p) => p.name === name)!
        return (
          <div
            key={name}
            ref={(el) => {
              if (el) cardRefs.current.set(name, el)
              else cardRefs.current.delete(name)
            }}
            className="absolute inset-0"
            style={{
              zIndex: order.length - depth,
              transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.03})`,
            }}
          >
            <ProjectCard project={project} active={depth === 0} />
          </div>
        )
      })}
    </div>
  )
}

export function Projects() {
  return (
    <>
      <section id="highlights" className="px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">Highlights</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Click the stack to cycle →
          </p>
        </FadeIn>
      </section>

      <div id="projects" className="px-6 pb-24 md:px-10 md:pb-32">
        <CardStack />
      </div>

      <MoreWork />
    </>
  )
}

/** Not part of the stack above — a sibling section in normal flow right
 * after it ends. */
function MoreWork() {
  return (
    <div className="px-6 py-16 md:px-10 md:py-24">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
          More work
        </p>
      </FadeIn>
      <div className="mx-auto mt-6 max-w-4xl divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {moreWork.map((item, i) => {
          const ctaHref = item.live ?? item.github
          return (
            <FadeIn key={item.name} delay={i * 0.08}>
              <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold tracking-tight uppercase">{item.name}</h3>
                  <WordReveal className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
                    {item.description}
                  </WordReveal>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                {ctaHref && (
                  <Magnetic strength={14} className="shrink-0">
                    <a
                      href={ctaHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border-2 border-[var(--color-fg)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]"
                    >
                      {item.live ? 'View Live' : 'View Code'}
                      <ArrowUpRight size={14} />
                    </a>
                  </Magnetic>
                )}
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}

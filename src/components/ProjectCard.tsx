import { ArrowUpRight } from 'lucide-react'
import { useRef, type MouseEvent } from 'react'
import { useGSAP } from '@gsap/react'
import { GenerativeArt } from './GenerativeArt'
import { LoanFlowVisual } from './LoanFlowVisual'
import { Magnetic } from './Magnetic'
import { WireframeVisual } from './WireframeVisual'
import { WordReveal } from './WordReveal'
import { useInView } from '../hooks/useInView'
import { gsap, ScrollTrigger } from '../lib/gsap'
import type { Project } from '../data/content'

function handleSpotlight(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty(
    '--mx',
    `${((e.clientX - rect.left) / rect.width) * 100}%`,
  )
  e.currentTarget.style.setProperty(
    '--my',
    `${((e.clientY - rect.top) / rect.height) * 100}%`,
  )
}

function StatusPill({ status }: { status: Project['status'] }) {
  if (!status) return null
  const isLive = status === 'live'
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
        isLive
          ? 'border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]'
          : 'border-[var(--color-muted)] text-[var(--color-muted)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}

/** One block of the Highlights editorial spread (replacing the old GSAP Flip
 * card-stack) — visual on one side, details on the other, alternating per
 * `reverse`. Each block choreographs its own entrance: the visual slides in
 * from whichever side it sits on and the project number snaps into place,
 * both once, plus a continuous scroll-scrub parallax on the visual that
 * keeps running for as long as the block is on screen (the entrance and the
 * parallax are independent GSAP animations on the same element — no
 * conflict, since one is a one-shot and the other keys off `scrub`, but
 * they're set up in the same effect so both get cleaned up together). */
export function ProjectCard({ project, reverse = false }: { project: Project; reverse?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const ctaHref = project.live ?? project.github
  const ctaLabel = project.live ? 'View Live' : 'View Code'

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const visual = visualRef.current
      const number = numberRef.current
      if (!visual || prefersReducedMotion) return

      gsap.set(visual, { x: reverse ? 48 : -48, opacity: 0 })
      if (number) gsap.set(number, { scale: 0.7, opacity: 0 })

      const entrance = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(visual, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
          if (number) {
            gsap.to(number, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)', delay: 0.1 })
          }
        },
      })

      const parallax = gsap.fromTo(
        visual,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )

      return () => {
        entrance.kill()
        parallax.kill()
      }
    },
    { scope: rootRef, dependencies: [reverse] },
  )

  return (
    <div
      ref={(el) => {
        rootRef.current = el
        viewRef.current = el
      }}
      className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
    >
      <div
        ref={visualRef}
        onMouseMove={handleSpotlight}
        className={`project-spotlight relative aspect-[4/3] overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] md:rounded-[48px] ${reverse ? 'md:order-2' : ''}`}
      >
        {project.visual === 'generative-art' && (
          <GenerativeArt active={inView} className="h-full w-full" />
        )}
        {project.visual === 'wireframe' && (
          <WireframeVisual active={inView} className="h-full w-full" />
        )}
        {project.visual === 'loan-flow' && (
          <LoanFlowVisual active={inView} className="h-full w-full" />
        )}
        {!project.visual && <div className="project-card-bg h-full w-full" />}
      </div>

      <div>
        <div className="flex items-baseline gap-3 md:gap-4">
          <span
            ref={numberRef}
            className="font-mono text-2xl text-[var(--color-muted)] md:text-3xl"
          >
            {project.index}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-fg)]">
              {project.category}
            </p>
            <StatusPill status={project.status} />
          </div>
        </div>
        <h3 className="font-serif mt-3 text-2xl font-medium tracking-tight md:text-4xl">
          {project.name}
        </h3>
        <WordReveal className="mt-4 max-w-xl text-[var(--color-muted)] md:text-lg">
          {project.description}
        </WordReveal>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]"
            >
              {tech}
            </span>
          ))}
        </div>
        {ctaHref && (
          <Magnetic strength={14} className="mt-6 inline-block">
            <a
              href={ctaHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-[var(--color-fg)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]"
            >
              {ctaLabel}
              <ArrowUpRight size={14} />
            </a>
          </Magnetic>
        )}
      </div>
    </div>
  )
}

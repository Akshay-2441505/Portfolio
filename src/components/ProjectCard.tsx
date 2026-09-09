import { ArrowUpRight } from 'lucide-react'
import { motion, type MotionValue } from 'framer-motion'
import type { MouseEvent } from 'react'
import { GenerativeArt } from './GenerativeArt'
import { LoanFlowVisual } from './LoanFlowVisual'
import { Magnetic } from './Magnetic'
import { WireframeVisual } from './WireframeVisual'
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
          ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
          : 'border-[var(--color-muted)] text-[var(--color-muted)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}

export function ProjectCard({
  project,
  active,
  parallaxY,
}: {
  project: Project
  active: boolean
  /** Drifts the visual panel at a different rate than the card shell while
   * pinned (VISUAL_CRAFT.md bug #2) — omitted when the card isn't part of
   * a scroll-linked stack. */
  parallaxY?: MotionValue<number>
}) {
  const ctaHref = project.live ?? project.github
  const ctaLabel = project.live ? 'View Live' : 'View Code'

  return (
    <div
      onMouseMove={handleSpotlight}
      className="project-spotlight flex h-[75vh] max-h-[720px] w-full flex-col gap-6 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:rounded-[48px] md:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="font-mono text-2xl text-[var(--color-muted)] md:text-3xl">
            {project.index}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
                {project.category}
              </p>
              <StatusPill status={project.status} />
            </div>
            <h3 className="mt-1 text-xl font-bold uppercase tracking-tight md:text-2xl">
              {project.name}
            </h3>
          </div>
        </div>
        {ctaHref && (
          <Magnetic strength={14}>
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

      <div className="relative min-h-[140px] flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        {/* Scaled up so the y-parallax translation never reveals an edge gap
         * against the overflow-hidden panel around it. */}
        <motion.div style={{ y: parallaxY }} className="h-full w-full scale-[1.15]">
          {project.visual === 'generative-art' && (
            <GenerativeArt active={active} className="h-full w-full" />
          )}
          {project.visual === 'wireframe' && (
            <WireframeVisual active={active} className="h-full w-full" />
          )}
          {project.visual === 'loan-flow' && (
            <LoanFlowVisual active={active} className="h-full w-full" />
          )}
          {!project.visual && <div className="project-card-bg h-full w-full" />}
        </motion.div>
      </div>

      <p className="line-clamp-2 max-w-2xl text-[var(--color-muted)] md:text-lg">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

import { ArrowUpRight } from 'lucide-react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'
import { ProjectCard } from './ProjectCard'
import { WordReveal } from './WordReveal'
import { moreWork, projects, type Project } from '../data/content'

/** One card in the stack: pins via `position: sticky` and scales down as the
 * next card scrolls over it (TECH_SPEC.md §4). Native sticky, not GSAP
 * pin:true — no scroll-height math to fight, and it keeps this interaction
 * on Framer Motion instead of splitting it across two scroll libraries. */
function StackCard({
  project,
  index,
  total,
  progress,
  active,
}: {
  project: Project
  index: number
  total: number
  progress: MotionValue<number>
  active: boolean
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03
  const scale = useTransform(progress, [index / total, 1], [1, targetScale])
  // The scale delta above is only 3-6% spread across ~1.6 screen-heights of
  // scroll — real but imperceptible, which is why the pinned stack read as
  // "stuck" (VISUAL_CRAFT.md bug #2). This second transform gives the visual
  // panel its own continuous, more visible drift for the entire pin duration.
  const parallaxY = useTransform(progress, [index / total, 1], [0, -40])

  return (
    <div
      className="sticky flex h-screen items-center justify-center px-6 md:px-10"
      style={{ top: `${index * 16}px` }}
    >
      <motion.div style={{ scale }} className="w-full max-w-4xl">
        <ProjectCard project={project} active={active} parallaxY={parallaxY} />
      </motion.div>
    </div>
  )
}

/** Small fixed dot indicator confirming scroll is registering, independent
 * of the (subtle) parallax fix above — VISUAL_CRAFT.md bug #2, part 2. */
function StackProgress({ progress, total }: { progress: MotionValue<number>; total: number }) {
  const [active, setActive] = useState(0)
  useMotionValueEvent(progress, 'change', (v) => {
    const idx = Math.min(total - 1, Math.max(0, Math.floor(v * total)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <div className="pointer-events-none fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full border border-[var(--color-border)] transition-colors duration-300"
          style={{
            background: i === active ? 'var(--color-accent-primary)' : 'transparent',
            boxShadow: i === active ? 'var(--glow-primary)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

/** Highlights, reworked from the original horizontal-scroll-pin into
 * sticky-stacking cards (TECH_SPEC.md §4) — reads more like an actual
 * highlights reel, and keeps the site's scroll-linked interactions on one
 * library (Framer Motion) instead of GSAP ScrollTrigger. */
export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section id="highlights" className="px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">Highlights</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Scroll to keep going ↓
          </p>
        </FadeIn>
      </section>

      <div id="projects" ref={containerRef} className="relative">
        {inView && <StackProgress progress={scrollYProgress} total={projects.length} />}
        {projects.map((project, i) => (
          <div key={project.name} className="relative" style={{ height: '160vh' }}>
            <StackCard
              project={project}
              index={i}
              total={projects.length}
              progress={scrollYProgress}
              active={inView}
            />
          </div>
        ))}
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

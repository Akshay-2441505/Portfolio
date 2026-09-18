import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { GenerativeArt } from './GenerativeArt'
import { ImageStrip } from './ImageStrip'
import { LoanFlowVisual } from './LoanFlowVisual'
import { Magnetic } from './Magnetic'
import { WireframeVisual } from './WireframeVisual'
import { useInView } from '../hooks/useInView'
import { gsap, ScrollTrigger } from '../lib/gsap'
import type { Project } from '../data/content'

function StatusPill({ status }: { status: Project['status'] }) {
  if (!status) return null
  const isLive = status === 'live'
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
        isLive
          ? 'border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]'
          : 'border-[var(--color-muted)] text-[var(--color-muted)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}

/** Highlights, take five — GSAP's own "pinned panels" pattern (the
 * demos.gsap.com scroll-effects demo of that name): each project pins to
 * the viewport in turn, and the next one slides up over it. Skips that
 * demo's "overscroll" half (scrolling long content within a still-pinned
 * panel) since every project here already fits one screen — that part
 * would just be dead scroll distance with nothing to show for it.
 *
 * The rigidity risk with pin-and-stack effects is real: a raw `scrub:
 * true` ties the transform 1:1 to scroll delta with zero give, which
 * reads as mechanical. `scrub: 0.8` adds a short eased catch-up lag so
 * the incoming panel settles instead of snapping, and the outgoing panel
 * drifts up a little as it shrinks/fades rather than just shrinking in
 * place. */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 })

  // Pin start/end positions are measured from DOM layout — screenshots
  // loading in after that measurement shift panel heights and make every
  // pin position past this section stale until refreshed.
  useEffect(() => {
    const images = rootRef.current?.querySelectorAll('img') ?? []
    const pending = Array.from(images).filter((img) => !img.complete)
    if (pending.length === 0) return
    let remaining = pending.length
    const onLoad = () => {
      remaining -= 1
      if (remaining === 0) ScrollTrigger.refresh()
    }
    pending.forEach((img) => img.addEventListener('load', onLoad, { once: true }))
    return () => pending.forEach((img) => img.removeEventListener('load', onLoad))
  }, [])

  useGSAP(
    () => {
      const panels = panelRefs.current.filter((el): el is HTMLDivElement => el !== null)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || panels.length < 2) return

      const triggers: ScrollTrigger[] = []
      const tweens: gsap.core.Tween[] = []

      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return
        const pin = ScrollTrigger.create({
          trigger: panel,
          start: 'top top',
          endTrigger: panels[panels.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        })
        triggers.push(pin)

        const settle = gsap.to(panel, {
          scale: 0.94,
          opacity: 0.5,
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: panels[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: 0.8,
          },
        })
        tweens.push(settle)
      })

      return () => {
        tweens.forEach((t) => t.scrollTrigger?.kill())
        tweens.forEach((t) => t.kill())
        triggers.forEach((t) => t.kill())
      }
    },
    { scope: rootRef, dependencies: [projects.length] },
  )

  return (
    <div
      ref={(el) => {
        rootRef.current = el
        viewRef.current = el
      }}
      className="relative"
    >
      {projects.map((project, i) => {
        const ctaHref = project.live ?? project.github
        const ctaLabel = project.live ? 'View Live' : 'View Code'

        // Alternating projects get a slight tonal shift instead of a flat
        // repeated background — enough to feel like a new beat as you move
        // between projects, not a hard color change.
        const panelBg =
          i % 2 === 1 ? 'color-mix(in srgb, var(--color-deep) 55%, var(--color-bg))' : 'var(--color-bg)'

        return (
          <div
            key={project.name}
            ref={(el) => {
              panelRefs.current[i] = el
            }}
            style={{ zIndex: i + 1, background: panelBg }}
            className={`relative flex min-h-[100dvh] items-center px-6 md:px-10 ${
              i > 0 ? 'border-t border-[var(--color-border)]' : ''
            }`}
          >
            <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[var(--color-muted)]">{project.index}</span>
                  <h3 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">{project.name}</h3>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    {project.category}
                  </p>
                  <StatusPill status={project.status} />
                </div>

                <p className="mt-6 max-w-lg text-lg text-[var(--color-muted)]">{project.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
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
                  <Magnetic strength={14} className="mt-8 inline-block">
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

              <div>
                {project.images?.length ? (
                  <ImageStrip
                    images={project.images}
                    alt={project.name}
                    device={project.deviceFrame ?? 'browser'}
                    devices={project.imageDevices}
                  />
                ) : (
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl">
                    {project.visual === 'generative-art' && <GenerativeArt active={inView} className="h-full w-full" />}
                    {project.visual === 'wireframe' && <WireframeVisual active={inView} className="h-full w-full" />}
                    {project.visual === 'loan-flow' && <LoanFlowVisual active={inView} className="h-full w-full" />}
                    {!project.visual && <div className="project-card-bg h-full w-full" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

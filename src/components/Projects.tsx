import { ArrowUpRight } from 'lucide-react'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'
import { ProjectCard } from './ProjectCard'
import { WordReveal } from './WordReveal'
import { moreWork, projects } from '../data/content'

/** Highlights — an editorial spread, replacing an earlier GSAP Flip
 * click-to-cycle card stack. The stack was clever but had a real
 * discoverability problem: a visitor who never clicked it never saw
 * projects 2 and 3. This just shows all three, alternating visual/text
 * sides, each revealed via its own ScrollTrigger (see ProjectCard.tsx) —
 * simpler code too, no Flip state machine to keep correct. */
export function Projects() {
  return (
    <>
      <section id="highlights" className="px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <FadeIn>
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-6xl">Highlights</h2>
        </FadeIn>
      </section>

      <div id="projects" className="flex flex-col gap-20 px-6 pb-24 md:gap-32 md:px-10 md:pb-32">
        {projects.map((project, i) => (
          <ProjectCard key={project.name} project={project} reverse={i % 2 === 1} />
        ))}
      </div>

      <MoreWork />
    </>
  )
}

/** Not part of the spread above — a sibling section in normal flow right
 * after it ends. */
function MoreWork() {
  return (
    <div className="px-6 py-16 md:px-10 md:py-24">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-fg)]">
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
                  <h3 className="font-serif text-lg font-medium tracking-tight">{item.name}</h3>
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

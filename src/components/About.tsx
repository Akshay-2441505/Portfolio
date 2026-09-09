import { FadeIn } from './FadeIn'
import { Stats } from './Stats'
import { about, education } from '../data/content'

export function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            About
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-8 text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {about.paragraph}
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-8 border-t border-[var(--color-border)] pt-10 sm:grid-cols-2">
          {education.map((item, i) => (
            <FadeIn key={item.school} delay={0.1 * i}>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
                {item.period}
              </p>
              <p className="mt-2 font-medium">{item.degree}</p>
              <p className="text-sm text-[var(--color-muted)]">{item.school}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{item.detail}</p>
            </FadeIn>
          ))}
        </div>

        <div className="mt-16">
          <Stats />
        </div>
      </div>
    </section>
  )
}

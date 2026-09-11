import { FadeIn } from './FadeIn'
import { HorizontalText } from './HorizontalText'
import { ImageReveal } from './ImageReveal'
import { Stats } from './Stats'
import { about, certifications, education, profile } from '../data/content'

export function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            About
          </h2>
        </FadeIn>
      </div>

      <HorizontalText text={profile.tagline} />

      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <FadeIn delay={0.1}>
          <p className="text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {about.paragraph}
          </p>
        </FadeIn>

        <ImageReveal src="/akshay-photo.jpg" alt="Akshay Kurdekar" />

        <div className="mt-16 grid gap-8 border-t border-[var(--color-border)] pt-10 sm:grid-cols-2">
          {education.map((item, i) => (
            <FadeIn key={item.school} delay={0.1 * i}>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
                {item.period}
              </p>
              <p className="mt-2 font-medium">{item.degree}</p>
              <p className="text-sm text-[var(--color-muted)]">{item.school}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{item.detail}</p>
            </FadeIn>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6">
          {certifications.map((cert, i) => (
            <FadeIn key={cert.name} delay={0.1 * i}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm text-[var(--color-fg)]">{cert.name}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  {cert.org} · {cert.period}
                </p>
              </div>
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

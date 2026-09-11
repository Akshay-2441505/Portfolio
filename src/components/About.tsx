import { FadeIn } from './FadeIn'
import { HorizontalText } from './HorizontalText'
import { ImageReveal } from './ImageReveal'
import { about, education, profile } from '../data/content'

export function About() {
  return (
    <section id="about" className="py-24 md:py-32">
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
      </div>
    </section>
  )
}

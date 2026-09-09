import { FadeIn } from './FadeIn'
import { skills } from '../data/content'

export function Skills() {
  return (
    <section id="skills" className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
          Skills
        </h2>
      </FadeIn>

      <div className="mt-16 mx-auto max-w-4xl divide-y divide-[var(--color-border)]">
        {skills.map((skill, i) => (
          <FadeIn key={skill.number} delay={i * 0.08}>
            <div className="flex items-baseline gap-6 py-8 md:gap-10">
              <span className="font-mono text-3xl text-[var(--color-muted)] md:text-5xl">
                {skill.number}
              </span>
              <div>
                <h3 className="text-lg font-medium uppercase tracking-wide md:text-2xl">
                  {skill.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)] md:text-base">
                  {skill.detail}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

import { Fragment } from 'react'
import { FadeIn } from './FadeIn'
import { WordReveal } from './WordReveal'
import { experience } from '../data/content'

export function Experience() {
  return (
    <section className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
          Appearances
        </h2>
      </FadeIn>

      <div className="relative mx-auto mt-16 max-w-3xl overflow-x-auto">
        {/* Vertical timeline line connecting the two entries — visual
         * structure where there was previously just a table. */}
        <div
          aria-hidden="true"
          className="absolute top-8 bottom-8 left-0 hidden w-px bg-[var(--color-border)] sm:block"
        />
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="pb-4 pr-4 font-mono text-xs font-normal uppercase tracking-widest text-[var(--color-muted)]">
                Club
              </th>
              <th className="pb-4 pr-4 font-mono text-xs font-normal uppercase tracking-widest text-[var(--color-muted)]">
                Role
              </th>
              <th className="pb-4 font-mono text-xs font-normal uppercase tracking-widest text-[var(--color-muted)]">
                Period
              </th>
            </tr>
          </thead>
          <tbody>
            {experience.map((role, i) => {
              const [club, descriptor] = role.org.split(' — ')
              return (
                <Fragment key={role.org}>
                  <tr className="border-b border-[var(--color-border)]/50">
                    <td className="pt-6 pr-4 align-top">
                      <FadeIn delay={i * 0.1}>
                        <p className="font-bold uppercase tracking-tight">{club}</p>
                        {descriptor && (
                          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{descriptor}</p>
                        )}
                      </FadeIn>
                    </td>
                    <td className="pt-6 pr-4 align-top">
                      <FadeIn delay={i * 0.1}>{role.role}</FadeIn>
                    </td>
                    <td className="pt-6 align-top font-mono text-sm text-[var(--color-muted)]">
                      <FadeIn delay={i * 0.1}>{role.period}</FadeIn>
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]">
                    <td colSpan={3} className="pb-8">
                      <WordReveal>
                        <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                          {role.points.map((point) => (
                            <li key={point}>— {point}</li>
                          ))}
                        </ul>
                      </WordReveal>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

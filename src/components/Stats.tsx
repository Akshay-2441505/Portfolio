import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { stats } from '../data/content'

export function Stats() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const numbers = gsap.utils.toArray<HTMLElement>('[data-stat-value]')
      numbers.forEach((el) => {
        const target = Number(el.dataset.statValue)
        const counter = { value: 0 }
        gsap.to(counter, {
          value: target,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = Math.floor(counter.value).toString()
          },
        })
      })
    },
    { scope: rootRef },
  )

  return (
    <div
      ref={rootRef}
      className="mx-auto grid max-w-3xl grid-cols-1 gap-10 border-t border-[var(--color-border)] pt-10 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="font-mono text-4xl font-bold text-[var(--color-accent-primary)] md:text-5xl">
            <span data-stat-value={stat.value}>0</span>
            {stat.suffix}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

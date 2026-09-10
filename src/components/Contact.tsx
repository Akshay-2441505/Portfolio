import { Mail } from 'lucide-react'
import { useRef, type MouseEvent } from 'react'
import { FadeIn } from './FadeIn'
import { GithubMark, LinkedinMark } from './icons/BrandIcons'
import { Magnetic } from './Magnetic'
import { FooterWave } from './FooterWave'
import { gsap } from '../lib/gsap'
import { motionTokens } from '../lib/motion'
import { fullTime, profile } from '../data/content'

export function Contact() {
  const mailRef = useRef<HTMLAnchorElement>(null)

  // A confirm-pulse before mailto: opens — decisive interaction feedback
  // (motionTokens.duration.instant, the token documented for exactly this),
  // not just an instant navigation.
  function handleMailClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const href = e.currentTarget.href
    gsap.fromTo(
      mailRef.current,
      { scale: 1 },
      {
        scale: 1.08,
        duration: motionTokens.duration.instant,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          window.location.href = href
        },
      },
    )
  }

  return (
    <section id="contact" className="relative px-6 py-24 md:px-10 md:py-32">
      <FooterWave />
      <div className="relative mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            {fullTime.heading}
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-muted)]">
            {fullTime.body}
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Magnetic className="mt-10 inline-block" strength={12}>
            <a
              ref={mailRef}
              href={`mailto:${profile.email}`}
              onClick={handleMailClick}
              className="flex items-center gap-2 rounded-full bg-[var(--color-fg)] px-8 py-4 font-mono text-sm uppercase tracking-widest text-[var(--color-bg)] transition-opacity hover:opacity-80"
            >
              <Mail size={16} />
              {profile.email}
            </a>
          </Magnetic>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="mt-8 flex items-center justify-center gap-6">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              <GithubMark size={20} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              <LinkedinMark size={20} />
            </a>
          </div>
        </FadeIn>
      </div>

      <p className="mt-24 text-center font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
        © {new Date().getFullYear()} {profile.name} — Built with React, GSAP &amp; Canvas
      </p>
    </section>
  )
}

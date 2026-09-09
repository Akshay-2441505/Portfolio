import { useRef } from 'react'
import { gsap } from '../lib/gsap'
import { motionTokens } from '../lib/motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!<>-_/[]{}—+*^#'

/** On hover, decodes the text from scrambled characters into the real
 * string, left to right. A cheap, high-signature "this is a dev site"
 * micro-interaction — costs nothing to run, so it's fine to sprinkle on
 * nav links and labels. */
export function ScrambleText({
  text,
  className,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  as?: 'span' | 'div'
}) {
  const ref = useRef<HTMLSpanElement>(null)

  function handleEnter() {
    const el = ref.current
    if (!el) return
    const obj = { progress: 0 }
    gsap.killTweensOf(obj)
    gsap.to(obj, {
      progress: 1,
      duration: motionTokens.duration.base,
      ease: 'power1.inOut', // GSAP-native ease string — motionTokens.ease isn't GSAP-parseable, see lib/motion.ts
      onUpdate: () => {
        const revealCount = Math.floor(obj.progress * text.length)
        el.textContent = text
          .split('')
          .map((char, i) => {
            if (i < revealCount || char === ' ') return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      },
      onComplete: () => {
        el.textContent = text
      },
    })
  }

  return (
    <Tag ref={ref as never} onMouseEnter={handleEnter} className={className}>
      {text}
    </Tag>
  )
}

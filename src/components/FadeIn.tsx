import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { motionTokens } from '../lib/motion'

type FadeInProps = {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = motionTokens.duration.base,
  y = 24,
  className,
}: FadeInProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { delay, duration, ease: motionTokens.ease.patient } },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

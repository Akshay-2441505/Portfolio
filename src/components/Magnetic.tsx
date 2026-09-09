import { motion, useSpring } from 'framer-motion'
import { useRef, type MouseEvent, type ReactNode } from 'react'

/** Wraps a button/link so it drifts gently toward the cursor on hover. */
export function Magnetic({
  children,
  strength = 20,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 150, damping: 12, mass: 0.3 })
  const y = useSpring(0, { stiffness: 150, damping: 12, mass: 0.3 })

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) / strength)
    y.set((event.clientY - rect.top - rect.height / 2) / strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block will-change-transform ${className ?? ''}`}
    >
      {children}
    </motion.div>
  )
}

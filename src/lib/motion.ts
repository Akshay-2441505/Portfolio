// Shared motion tokens — named `motionTokens` rather than MOTION.md's literal
// `motion` to avoid colliding with `import { motion } from 'framer-motion'`,
// already imported by several components.
export const motionTokens = {
  duration: {
    instant: 0.15, // decisive interaction feedback (clicks, confirmations)
    base: 0.6, // standard scroll-reveal pacing
    slow: 0.9, // the one bold moment (FIFA card reveal/flip)
  },
  // Number-array form (not CSS `cubic-bezier()` strings) — this is the format
  // Framer Motion's `transition.ease` actually accepts. GSAP call sites should
  // use a native GSAP ease (e.g. 'power2.out') instead of these, since GSAP
  // doesn't parse either form without registering a CustomEase.
  ease: {
    patient: [0.16, 1, 0.3, 1], // expo-out — controlled, unhurried scroll reveals
    decisive: [0.4, 0, 0.2, 1], // snappier — click/interaction responses
  },
  stagger: 0.08,
} as const

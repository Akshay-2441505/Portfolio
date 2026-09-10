import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 60
const COLOR = '4, 246, 252' // --color-accent-primary as an rgb triplet, for canvas rgba()

/** Ambient particle field (EFFECTS_PLAN.md experimental trio, ref: "Canvas
 * particles"), recolored from the demo's rainbow defaults to the site's
 * single cyan accent at low opacity — a quiet atmosphere layer rather than
 * a competing visual. Trial basis per EFFECTS_PLAN.md — first to cut if a
 * trim pass finds it reads as excess (see Task 13). Off under reduced
 * motion. */
export function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let cw = (canvas.width = window.innerWidth)
    let ch = (canvas.height = window.innerHeight)

    type Particle = { x: number; y: number; vx: number; vy: number; r: number }
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 0.6 + Math.random() * 1.4,
    }))

    function handleResize() {
      cw = canvas!.width = window.innerWidth
      ch = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    let raf = 0
    function tick() {
      ctx!.clearRect(0, 0, cw, ch)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = cw
        if (p.x > cw) p.x = 0
        if (p.y < 0) p.y = ch
        if (p.y > ch) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${COLOR}, 0.35)`
        ctx!.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  )
}

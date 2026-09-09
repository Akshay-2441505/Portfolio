import { useEffect, useRef } from 'react'

type Particle = {
  from: number
  to: number
  t: number
  rejected: boolean
}

const NODE_LABELS = ['BORROWER', 'VALIDATION', 'APPROVER']
const NODE_X = [0.15, 0.5, 0.85]
const SPAWN_INTERVAL = 900

/** An animated flow diagram of loan applications moving from borrower to
 * approver through a validation gate — a real visualization of what the
 * MSME loan simulation project does, not decoration. Reuses
 * GenerativeArt.tsx's canvas sizing/gating skeleton. */
export function LoanFlowVisual({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []
    let lastSpawn = 0

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = canvas!.width = rect.width * dpr
      height = canvas!.height = rect.height * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const nodeY = () => height / 2

    function drawNodes() {
      ctx!.font = `${11 * dpr}px 'Space Mono', monospace`
      ctx!.textAlign = 'center'
      for (let i = 0; i < 3; i++) {
        const x = NODE_X[i] * width
        const y = nodeY()
        ctx!.strokeStyle = 'rgba(242, 240, 235, 0.35)'
        ctx!.lineWidth = 1.5
        ctx!.beginPath()
        ctx!.arc(x, y, 10 * dpr, 0, Math.PI * 2)
        ctx!.stroke()
        ctx!.fillStyle = 'rgba(242, 240, 235, 0.6)'
        ctx!.fillText(NODE_LABELS[i], x, y + 28 * dpr)
      }
      // guide lines
      ctx!.strokeStyle = 'rgba(242, 240, 235, 0.12)'
      ctx!.beginPath()
      ctx!.moveTo(NODE_X[0] * width, nodeY())
      ctx!.lineTo(NODE_X[2] * width, nodeY())
      ctx!.stroke()
    }

    function drawParticle(p: Particle) {
      const fromX = NODE_X[p.from] * width
      const toX = NODE_X[p.to] * width
      const x = fromX + (toX - fromX) * p.t
      const y = nodeY() - Math.sin(p.t * Math.PI) * 18 * dpr
      const alpha = p.rejected ? 0.4 : 0.95
      ctx!.fillStyle = `rgba(255, 92, 53, ${alpha})`
      ctx!.beginPath()
      ctx!.arc(x, y, 4 * dpr, 0, Math.PI * 2)
      ctx!.fill()
    }

    let raf = 0
    function tick(now: number) {
      ctx!.fillStyle = '#0a0a0a'
      ctx!.fillRect(0, 0, width, height)
      drawNodes()

      if (now - lastSpawn > SPAWN_INTERVAL) {
        lastSpawn = now
        particles.push({ from: 0, to: 1, t: 0, rejected: false })
      }

      particles = particles.filter((p) => p.t < 1)
      for (const p of particles) {
        p.t += 0.02
        if (p.t >= 1 && p.to === 1) {
          // reached validation — branch onward or back
          const approved = Math.random() < 0.75
          p.from = 1
          p.to = approved ? 2 : 0
          p.t = 0
          p.rejected = !approved
        }
        drawParticle(p)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active])

  return <canvas ref={canvasRef} className={`block ${className ?? ''}`} />
}

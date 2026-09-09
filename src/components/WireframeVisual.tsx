import { useEffect, useRef } from 'react'

type Point3 = { x: number; y: number; z: number }

function cubeVertices(size: number): Point3[] {
  const s = size
  const v: Point3[] = []
  for (const x of [-s, s]) {
    for (const y of [-s, s]) {
      for (const z of [-s, s]) {
        v.push({ x, y, z })
      }
    }
  }
  return v
}

const CUBE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3],
  [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7],
]

const cubeA = cubeVertices(1)
const cubeB = cubeVertices(0.55)

/** A rotating wireframe pair of cubes, standing in for "3D interaction" on
 * the Philips-inspired project card. Reuses GenerativeArt.tsx's canvas
 * sizing/gating skeleton — plain 2D projection math, no WebGL. */
export function WireframeVisual({
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

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = canvas!.width = rect.width * dpr
      height = canvas!.height = rect.height * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function project(p: Point3, angleX: number, angleY: number, scaleUnit: number) {
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const x1 = p.x * cosY - p.z * sinY
      const z1 = p.x * sinY + p.z * cosY

      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const y1 = p.y * cosX - z1 * sinX
      const z2 = p.y * sinX + z1 * cosX

      const scale = scaleUnit / (z2 + 4)
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y1 * scale,
        z: z2,
      }
    }

    function drawCube(vertices: Point3[], angleX: number, angleY: number, scaleUnit: number) {
      const projected = vertices.map((v) => project(v, angleX, angleY, scaleUnit))
      for (const [a, b] of CUBE_EDGES) {
        const pa = projected[a]
        const pb = projected[b]
        const depth = (pa.z + pb.z) / 2
        const alpha = Math.max(0.15, Math.min(0.9, 0.55 - depth * 0.08))
        ctx!.strokeStyle = `rgba(4, 246, 252, ${alpha})`
        ctx!.lineWidth = 1.5
        ctx!.beginPath()
        ctx!.moveTo(pa.x, pa.y)
        ctx!.lineTo(pb.x, pb.y)
        ctx!.stroke()
      }
    }

    let raf = 0
    const start = performance.now()
    function tick(now: number) {
      const t = (now - start) / 1000
      ctx!.fillStyle = '#0a0a0a'
      ctx!.fillRect(0, 0, width, height)

      const scaleUnit = Math.min(width, height) * 0.6
      drawCube(cubeA, t * 0.3, t * 0.4, scaleUnit)
      drawCube(cubeB, -t * 0.5, t * 0.25 + Math.PI / 4, scaleUnit)

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

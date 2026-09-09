import { useEffect, useRef } from 'react'

/** A lightweight, from-scratch recreation of the WeaveSilk-style light-trail
 * generator from github.com/Akshay-2441505/generative-art — embedded live
 * rather than just linked, so the card proves itself instead of describing
 * itself. Pauses its render loop whenever `active` is false. */
export function GenerativeArt({
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

    let raf = 0
    let width = 0
    let height = 0
    let hue = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const points: { x: number; y: number }[] = []
    const pointer = { x: 0, y: 0, active: false }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = canvas!.width = rect.width * dpr
      height = canvas!.height = rect.height * dpr
      ctx!.fillStyle = '#0a0a0a'
      ctx!.fillRect(0, 0, width, height)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function toLocal(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = (clientX - rect.left) * dpr
      pointer.y = (clientY - rect.top) * dpr
      pointer.active = true
    }
    function handleMove(e: PointerEvent) {
      toLocal(e.clientX, e.clientY)
    }
    function handleLeave() {
      pointer.active = false
    }
    canvas.addEventListener('pointermove', handleMove)
    canvas.addEventListener('pointerleave', handleLeave)

    function tick() {
      ctx!.fillStyle = 'rgba(10, 10, 10, 0.14)'
      ctx!.fillRect(0, 0, width, height)

      if (pointer.active) {
        points.push({ x: pointer.x, y: pointer.y })
        if (points.length > 36) points.shift()
      } else if (points.length) {
        points.shift()
      }

      hue = (hue + 0.4) % 40

      ctx!.lineCap = 'round'
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        const t = i / points.length
        ctx!.strokeStyle = `hsla(${14 + hue}, 90%, 60%, ${t})`
        ctx!.lineWidth = t * 5 * dpr
        ctx!.beginPath()
        ctx!.moveTo(p0.x, p0.y)
        ctx!.lineTo(p1.x, p1.y)
        ctx!.stroke()
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointermove', handleMove)
      canvas.removeEventListener('pointerleave', handleLeave)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ touchAction: 'none' }}
    />
  )
}

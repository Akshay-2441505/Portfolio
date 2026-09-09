import { useEffect, useRef } from 'react'
import { proceduralFrameSource, type FrameSource } from '../lib/frameSource'
import { useInView } from '../hooks/useInView'
import { useScrollScrub } from '../hooks/useScrollScrub'

/** Canvas-2D scroll-scrubbed visual for the hero. Sizes itself via a
 * ResizeObserver on the canvas element directly (the pattern proven in
 * GenerativeArt.tsx) rather than react-use-measure, and is never lazy/
 * Suspense-loaded — both choices sidestep the canvas-stuck-at-300x150 bug
 * class the previous React Three Fiber hero hit. */
export function FrameSequence({
  frameSource = proceduralFrameSource,
  className,
}: {
  frameSource?: FrameSource
  className?: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progress = useScrollScrub(wrapperRef)
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

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

    if (prefersReducedMotion) {
      frameSource.draw(ctx, 0.5, width, height, 0)
      return () => ro.disconnect()
    }

    let raf = 0
    const start = performance.now()
    function tick(now: number) {
      frameSource.draw(ctx!, progress.current, width, height, (now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    if (inView) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [frameSource, inView, progress])

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node
        viewRef.current = node
      }}
      className="h-full w-full"
    >
      <canvas ref={canvasRef} className={`block h-full w-full ${className ?? ''}`} />
    </div>
  )
}

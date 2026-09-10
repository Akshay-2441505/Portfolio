import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { Group } from 'three'
import { Football } from './Football'
import { useInView } from '../hooks/useInView'
import { useScrollScrub } from '../hooks/useScrollScrub'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Real WebGL scene replacing the old canvas-2D particle network
 * (WEBGL_UPGRADE.md). Holds the site's single 3D object — the procedural
 * faceted football (RESET.md) — cursor-reactive and scroll-driven, with a
 * bloom pass so its lit facet edges read as catching light. */

function HeroSceneContent({
  progress,
}: {
  progress: RefObject<number>
}) {
  const pointer = useRef({ x: 0, y: 0 })
  const groupRef = useRef<Group>(null)

  // Size the ball against the frustum, not a fixed world radius. A fixed 1.4
  // was wider than the ~2.15 world units visible at a 375px viewport, so it
  // bled off both edges; even at 1.0 it filled 93% of the width and washed
  // out the sub-line and meta-line sitting on top of it. Capping the diameter
  // at ~56% of the visible width keeps it clearly a ball on phones while
  // desktop still gets the full 1.0. r3f recomputes viewport on resize, so
  // this needs no listener of its own.
  const viewportWidth = useThree((state) => state.viewport.width)
  const radius = Math.min(1.0, viewportWidth * 0.28)

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const targetX = pointer.current.y * 0.25
    const targetY = pointer.current.x * 0.35 + progress.current * Math.PI * 0.4
    group.rotation.x += (targetX - group.rotation.x) * 0.05
    group.rotation.y += (targetY - group.rotation.y) * 0.05
    // Scroll-velocity-reactive intensity: a fast scroll flares the cluster
    // briefly before it settles back (VISUAL_CRAFT.md).
    const flare = Math.min(1, Math.abs(scrollVelocity.current) / 60)
    const targetScale = 1 + flare * 0.06
    group.scale.setScalar(group.scale.x + (targetScale - group.scale.x) * 0.1)
  })

  return (
    <group ref={groupRef}>
      <Football radius={radius} spin={0.12} />
    </group>
  )
}

export function HeroScene() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0 })
  const progress = useScrollScrub(wrapperRef)
  const [lowQuality, setLowQuality] = useState(false)

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node
        viewRef.current = node
      }}
      className="h-full w-full"
    >
      <Canvas
        dpr={lowQuality ? 1 : [1, 2]}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 5], fov: 50 }}
        // preserveDrawingBuffer: the canvas keeps its last rendered frame
        // around instead of the browser clearing it right after compositing
        // — needed for any external tool (or the user's own screenshot) to
        // reliably capture what's on screen; negligible cost for a scene
        // this size.
        gl={{ alpha: true, antialias: !lowQuality, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          if (import.meta.env.DEV) {
            const w = window as unknown as Record<string, unknown>
            w.__heroGL = gl
            w.__heroScene = scene
            w.__heroCamera = camera
          }
        }}
      >
        <PerformanceMonitor onDecline={() => setLowQuality(true)} />
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 3]} intensity={1.4} color="#04f6fc" />
        <pointLight position={[-2, -1, -2]} intensity={0.5} color="#f2f0eb" />
        <HeroSceneContent progress={progress} />
        {!lowQuality && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.6} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}

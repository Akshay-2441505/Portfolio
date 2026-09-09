import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { Group } from 'three'
import { CrystalShards } from './CrystalShards'
import { useInView } from '../hooks/useInView'
import { useScrollScrub } from '../hooks/useScrollScrub'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Real WebGL scene replacing the old canvas-2D particle network
 * (WEBGL_UPGRADE.md). Extends the crystal-shard language already
 * established on the FIFA Card, cursor-reactive, scroll-driven, with a
 * bloom pass so the shard edges actually read as emitting light. */

function HeroSceneContent({
  progress,
  lowQuality,
}: {
  progress: RefObject<number>
  lowQuality: boolean
}) {
  const pointer = useRef({ x: 0, y: 0 })
  const groupRef = useRef<Group>(null)

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
      <CrystalShards count={lowQuality ? 8 : 16} spread={3.6} scale={1.2} />
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
        <pointLight position={[-2, -1, -2]} intensity={0.5} color="#7f9bb3" />
        <HeroSceneContent progress={progress} lowQuality={lowQuality} />
        {!lowQuality && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.6} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}

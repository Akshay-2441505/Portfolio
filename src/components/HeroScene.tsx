import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import type { Group } from 'three'
import { HeadModel } from './HeadModel'
import { useInView } from '../hooks/useInView'
import { useScrollScrub } from '../hooks/useScrollScrub'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Real WebGL scene replacing the old canvas-2D particle network
 * (WEBGL_UPGRADE.md), the low-poly football (RESET.md), and a metaball
 * attempt at a face (BlobFace.tsx, abandoned — no amount of blob-tuning
 * produces real facial anatomy) — now a real sculpted head (HeadModel.tsx),
 * cursor-reactive and scroll-driven. Its MatCap material needs no
 * environment map or lights at all (the whole lit look is baked into the
 * matcap texture), so — unlike the PBR attempt this replaced — there's no
 * PMREMGenerator setup here. */

function HeroSceneContent({
  progress,
}: {
  progress: RefObject<number>
}) {
  const pointer = useRef({ x: 0, y: 0 })
  const groupRef = useRef<Group>(null)

  // Sized against the Canvas's own frustum (a boxed slot, not the full
  // hero background), not a fixed world radius, so it scales with whatever
  // box size the layout gives it. r3f recomputes viewport on resize, so
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
    // 0.05 (the football's original lerp factor) read as sluggish now that
    // this object is the hero's focal point rather than a background
    // decoration — snapped up so the turn-toward-cursor feels responsive.
    group.rotation.x += (targetX - group.rotation.x) * 0.14
    group.rotation.y += (targetY - group.rotation.y) * 0.14
    // Scroll-velocity-reactive intensity: a fast scroll flares the cluster
    // briefly before it settles back (VISUAL_CRAFT.md).
    const flare = Math.min(1, Math.abs(scrollVelocity.current) / 60)
    const targetScale = 1 + flare * 0.06
    group.scale.setScalar(group.scale.x + (targetScale - group.scale.x) * 0.1)
  })

  return (
    <group ref={groupRef}>
      <HeadModel radius={radius} />
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
        <HeroSceneContent progress={progress} />
      </Canvas>
    </div>
  )
}

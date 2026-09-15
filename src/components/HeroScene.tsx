import { useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { PMREMGenerator, type Group } from 'three'
import { RoomEnvironment } from 'three-stdlib'
import { BlobFace } from './BlobFace'
import { useInView } from '../hooks/useInView'
import { useScrollScrub } from '../hooks/useScrollScrub'
import { scrollVelocity } from '../lib/scrollVelocity'

/** Real WebGL scene replacing the old canvas-2D particle network
 * (WEBGL_UPGRADE.md), and later the low-poly football (RESET.md) — now a
 * chrome metaball "face" (gionatannese.com/about reference), cursor-
 * reactive and scroll-driven. A full-metal PBR material has no meaningful
 * diffuse response to point lights — its look IS the environment map's
 * reflections — so a studio environment map replaces the old tinted point
 * lights and bloom pass entirely rather than sitting alongside them.
 *
 * The environment is procedurally generated (RoomEnvironment, the same
 * technique Google's model-viewer uses for its default studio look), not
 * fetched — drei's <Environment preset="..."> pulls an HDR file from a
 * third-party CDN, which is one more thing that can go down and isn't
 * needed here. Built inside onCreated (fires once, when the GL context is
 * ready) rather than a useThree()-based effect elsewhere, so the scene
 * object being mutated is a plain callback argument, not a hook return
 * value. */

function HeroSceneContent({
  progress,
}: {
  progress: RefObject<number>
}) {
  const pointer = useRef({ x: 0, y: 0 })
  const groupRef = useRef<Group>(null)

  // Sized against the Canvas's own frustum (now a boxed slot, not the full
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
      <BlobFace radius={radius} />
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
          const pmrem = new PMREMGenerator(gl)
          scene.environment = pmrem.fromScene(RoomEnvironment(), 0.04).texture
          pmrem.dispose()
          // RoomEnvironment's default exposure reads as near-black through a
          // near-mirror material at normal exposure — a real chrome object
          // needs a bright, even light source, not just a couple of panels.
          gl.toneMappingExposure = 1.5

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

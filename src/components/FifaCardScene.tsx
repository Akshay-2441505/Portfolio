import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { PerformanceMonitor, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { Group, PointLight } from 'three'
import { CrystalShards } from './CrystalShards'

/** Real WebGL geometry replacing the flat card image + CSS tilt trick
 * (WEBGL_UPGRADE.md). The card face is a textured plane (still fifa-card.jpg
 * — the photo/stat layout itself isn't being redrawn in 3D, only how it's
 * lit and presented is); the crystal-shard corner becomes real geometry via
 * the shared CrystalShards component instead of being baked into the image;
 * cursor-follow tilt-and-gloss is real light/geometry movement, not CSS. */

const CARD_ASPECT = 765 / 1095
const CARD_HEIGHT = 3
const CARD_WIDTH = CARD_HEIGHT * CARD_ASPECT

function CardFace() {
  const texture = useTexture('/fifa-card.jpg')
  return (
    <mesh>
      <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.1} />
    </mesh>
  )
}

/** Owns the pointer position itself (both the write, via R3F pointer events
 * on this group, and the read, via useFrame) rather than threading a
 * mutable ref through as a prop across component boundaries. */
function Scene({ lowQuality }: { lowQuality: boolean }) {
  const { size } = useThree()
  const pointer = useRef({ x: 0, y: 0 })
  const groupRef = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    pointer.current.x = (e.nativeEvent.offsetX / size.width) * 2 - 1
    pointer.current.y = (e.nativeEvent.offsetY / size.height) * 2 - 1
  }
  function handlePointerLeave() {
    pointer.current.x = 0
    pointer.current.y = 0
  }

  useFrame(() => {
    const group = groupRef.current
    const light = lightRef.current
    if (!group || !light) return
    // Tilt: the card itself rotates toward the cursor — real geometry
    // rotation standing in for the old CSS 3D transform.
    const targetRotX = -pointer.current.y * 0.25
    const targetRotY = pointer.current.x * 0.3
    group.rotation.x += (targetRotX - group.rotation.x) * 0.12
    group.rotation.y += (targetRotY - group.rotation.y) * 0.12
    // Gloss: a point light sweeps across the card surface following the
    // cursor, standing in for the old CSS gloss-highlight trick.
    const targetLightX = pointer.current.x * 2
    const targetLightY = -pointer.current.y * 2
    light.position.x += (targetLightX - light.position.x) * 0.15
    light.position.y += (targetLightY - light.position.y) * 0.15
  })

  return (
    // The plane fills the frame, so listening on the whole group is
    // equivalent to listening on the card itself, and stays bounded to the
    // card's own box rather than the full window (unlike the Hero scene).
    <group ref={groupRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <Suspense fallback={null}>
        <CardFace />
      </Suspense>
      {/* A small accent tucked into the top-right corner, mostly beyond the
       * card's own edge — a subtle complement to the shard art already
       * printed on the card face, not a competing full-size cluster on top
       * of it (an earlier version was far too large and sat over the
       * photo — this is deliberately restrained). */}
      <CrystalShards
        count={5}
        spread={0.4}
        scale={0.18}
        seed={11}
        position={[CARD_WIDTH * 0.46, CARD_HEIGHT * 0.4, 0.2]}
      />
      <pointLight ref={lightRef} position={[0, 0, 2]} intensity={1.1} color="#04f6fc" />
      {!lowQuality && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.5} />
        </EffectComposer>
      )}
    </group>
  )
}

export function FifaCardScene() {
  const [lowQuality, setLowQuality] = useState(false)

  return (
    <Canvas
      dpr={lowQuality ? 1 : [1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ alpha: true, antialias: !lowQuality, preserveDrawingBuffer: true }}
      onCreated={({ gl, scene, camera }) => {
        if (import.meta.env.DEV) {
          const w = window as unknown as Record<string, unknown>
          w.__fifaGL = gl
          w.__fifaScene = scene
          w.__fifaCamera = camera
        }
      }}
    >
      <PerformanceMonitor onDecline={() => setLowQuality(true)} />
      <ambientLight intensity={0.7} />
      <Scene lowQuality={lowQuality} />
    </Canvas>
  )
}

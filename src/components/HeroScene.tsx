import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { ChromeBlobField } from './ChromeBlobField'
import { useInView } from '../hooks/useInView'

/** Real WebGL scene replacing the old canvas-2D particle network
 * (WEBGL_UPGRADE.md), the low-poly football (RESET.md), a metaball-mesh
 * attempt at a face (BlobFace.tsx), and a real sculpted head (HeadModel.tsx)
 * — now a raymarched SDF chrome blob (ChromeBlobField.tsx). The blob is a
 * single fullscreen quad; all its geometry, animation, and cursor reaction
 * live inside its own fragment shader, so there's no scene-level rotation
 * group or pointer-tracking here anymore — an orthographic camera is all
 * this Canvas needs to provide. */

export function HeroScene() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0 })
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
        orthographic
        dpr={lowQuality ? 1 : [1, 2]}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 1], zoom: 1 }}
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
        <ChromeBlobField />
      </Canvas>
    </div>
  )
}

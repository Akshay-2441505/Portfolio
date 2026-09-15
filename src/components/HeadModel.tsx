import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  Box3,
  CanvasTexture,
  Mesh,
  MeshMatcapMaterial,
  SRGBColorSpace,
  Vector3,
  type Group,
} from 'three'

/** The real replacement for the metaball attempt (BlobFace.tsx) — a real
 * sculpted head (male_head.glb, CC-BY, Alexander Antipov via Sketchfab:
 * https://sketchfab.com/3d-models/male-head-0247a25a04ba46b99629130277fe39b7),
 * not geometry generated from code. No amount of metaball tuning produces
 * actual facial anatomy; that has to be sculpted.
 *
 * Shaded with a MatCap (Material Capture) rather than real-time PBR +
 * environment reflections — the gionatannese.com/about reference itself
 * uses this technique (confirmed via its network requests: a model.glb
 * loaded alongside a MatCap.jpg). A matcap bakes the whole lit-chrome look
 * into a single texture sampled by view-space normal — one texture lookup
 * per pixel, no environment map, no PMREM generation step, no per-light
 * computation. Chosen partly for fidelity to the reference and partly
 * because the previous PBR + procedural-environment attempt was reported
 * as slow — this is a materially cheaper technique, not just a re-tune.
 *
 * The matcap texture itself is generated on a canvas rather than fetched,
 * for the same reason the environment map was made procedural before:
 * no external asset, nothing that can fail to load. */
function createChromeMatcap(): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#8f8674'
  ctx.fillRect(0, 0, size, size)

  // Fresnel-style dark rim — chrome reads as near-black at the silhouette
  // edge, where the surface normal points away from the viewer.
  const rim = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.5)
  rim.addColorStop(0, 'rgba(20,18,15,0)')
  rim.addColorStop(1, 'rgba(20,18,15,0.95)')
  ctx.fillStyle = rim
  ctx.fillRect(0, 0, size, size)

  // Primary key-light highlight, upper-left.
  const key = ctx.createRadialGradient(size * 0.32, size * 0.28, 0, size * 0.32, size * 0.28, size * 0.32)
  key.addColorStop(0, 'rgba(255,252,244,1)')
  key.addColorStop(0.5, 'rgba(255,252,244,0.55)')
  key.addColorStop(1, 'rgba(255,252,244,0)')
  ctx.fillStyle = key
  ctx.fillRect(0, 0, size, size)

  // Softer fill-light highlight, lower-right — keeps the far side of the
  // form readable instead of falling straight to the dark rim.
  const fill = ctx.createRadialGradient(size * 0.7, size * 0.72, 0, size * 0.7, size * 0.72, size * 0.3)
  fill.addColorStop(0, 'rgba(214,205,190,0.55)')
  fill.addColorStop(1, 'rgba(214,205,190,0)')
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function HeadModel({ radius = 1 }: { radius?: number }) {
  const { scene } = useGLTF('/male-head.glb')
  const matcap = useMemo(() => createChromeMatcap(), [])
  const scaleGroupRef = useRef<Group>(null)

  // Clone per-instance (useGLTF caches and reuses the loaded scene across
  // every consumer) and swap every mesh's material for the matcap one —
  // the source file's own materials/textures aren't wanted here.
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshMatcapMaterial({ matcap })
      }
    })
    return cloned
  }, [scene, matcap])

  // Downloaded models arrive at an arbitrary scale/pivot, not necessarily
  // centered at the origin or sized to the `radius` convention the rest of
  // the scene expects — auto-center and auto-fit rather than hand-tune
  // magic numbers for this one asset.
  useEffect(() => {
    const box = new Box3().setFromObject(model)
    const size = new Vector3()
    box.getSize(size)
    const center = new Vector3()
    box.getCenter(center)
    model.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (scaleGroupRef.current && maxDim > 0) {
      scaleGroupRef.current.scale.setScalar((radius * 2) / maxDim)
    }
  }, [model, radius])

  return (
    <group ref={scaleGroupRef}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/male-head.glb')

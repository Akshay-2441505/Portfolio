import { useMemo } from 'react'
import { BufferAttribute, BufferGeometry, MeshBasicMaterial } from 'three'
import { mergeVertices, MarchingCubes as MarchingCubesImpl } from 'three-stdlib'

/** Chrome metaball "face" replacing the old football as the hero's 3D
 * object (gionatannese.com/about reference) — a cluster of merged spheres
 * (a head, a "hair" cluster across the top, two ear bumps) sculpted with
 * two genuinely subtractive balls for the eye sockets, not a texture trick.
 * `MarchingCubes.addBall` takes a signed strength — a negative ball really
 * subtracts from the scalar field before the isosurface is extracted, so
 * the eyes are actual carved geometry.
 *
 * Built ONCE into a static BufferGeometry (not per-frame, unlike drei's
 * <MarchingCubes> which recomputes every frame for animated blobs we don't
 * need) — the parent scene rotates the whole result toward the cursor the
 * same way it did the football, so there's no per-frame marching-cubes
 * cost. Ball coordinates are the field's own 0..1 space (0.5 = center);
 * the generated geometry comes out centered near the origin with radius
 * ~1, same convention the football used, so a parent `scale` still maps to
 * a world-space radius. */

const RESOLUTION = 64
const MAX_POLY_COUNT = 65000

type Ball = { x: number; y: number; z: number; strength: number; subtract: number }

const HEAD: Ball = { x: 0.5, y: 0.42, z: 0.5, strength: 1.15, subtract: 9 }

const HAIR: Ball[] = [
  { x: 0.5, y: 0.74, z: 0.5, strength: 0.5, subtract: 10 },
  { x: 0.36, y: 0.7, z: 0.47, strength: 0.4, subtract: 10 },
  { x: 0.64, y: 0.7, z: 0.47, strength: 0.4, subtract: 10 },
  { x: 0.26, y: 0.6, z: 0.44, strength: 0.28, subtract: 11 },
  { x: 0.74, y: 0.6, z: 0.44, strength: 0.28, subtract: 11 },
]

const EARS: Ball[] = [
  { x: 0.19, y: 0.42, z: 0.5, strength: 0.2, subtract: 12 },
  { x: 0.81, y: 0.42, z: 0.5, strength: 0.2, subtract: 12 },
]

// Negative strength — genuinely subtracts, carving eye sockets rather than
// painting them on. A ball's influence radius is size*sqrt(strength/
// subtract); the first attempt at these (strength -0.55, subtract 6) had a
// radius nearly as large as the head ball itself, carving away most of the
// front face and flattening the whole head front-to-back instead of
// leaving two small dimples.
const EYES: Ball[] = [
  { x: 0.4, y: 0.46, z: 0.66, strength: -0.35, subtract: 28 },
  { x: 0.6, y: 0.46, z: 0.66, strength: -0.35, subtract: 28 },
]

function buildFaceGeometry(): BufferGeometry {
  const mc = new MarchingCubesImpl(RESOLUTION, new MeshBasicMaterial(), false, false, MAX_POLY_COUNT)
  // The isosurface only forms where the SUMMED field crosses `isolation`
  // (defaults to 80) — a much stricter cutoff than a single ball's loose
  // falloff radius. With balls spread mainly across X/Y (ears at the
  // extremes, hair across the top) and nothing reinforcing Z, the surface
  // only reached the head ball's own un-reinforced radius in that axis —
  // a visibly flattened, pancake-like head. Lowering isolation grows every
  // ball's effective radius uniformly, including the lone head ball in Z.
  mc.isolation = 24
  mc.reset()
  // Positive balls first, so the eyes' negative field has something to
  // carve into — order matters for the additive/subtractive accumulation.
  for (const ball of [HEAD, ...HAIR, ...EARS, ...EYES]) {
    mc.addBall(ball.x, ball.y, ball.z, ball.strength, ball.subtract)
  }
  // update() writes the polygonized surface straight into mc.geometry's
  // position/normal attributes and sets the draw range — that geometry IS
  // the finished result, no separate extraction method exists on this
  // build. Its own normals came out degenerate in practice (rendered flat
  // black — a metal material with a broken normal has nothing to reflect
  // toward the camera), and computeVertexNormals() on the raw non-indexed
  // output only gives flat per-face normals (every triangle owns 3 unique
  // vertices, so there's nothing to average across). Welding coincident
  // vertices first — marching cubes naturally produces exact-duplicate
  // positions at shared triangle edges — then computing normals on that
  // indexed topology gives real smooth shading.
  mc.update()

  // mc.geometry's attribute arrays are allocated at maxPolyCount size
  // regardless of how much surface actually got generated — only the first
  // mc.count vertices are real, the rest is unwritten zero data sitting
  // right at this blob's own center (field coordinate 0.5 maps to local
  // origin). Trim to the valid range before welding, or those leftover
  // zero-vertices weld into a mass of degenerate triangles at the origin.
  const validFloats = mc.count * 3
  const trimmed = new BufferGeometry()
  trimmed.setAttribute(
    'position',
    new BufferAttribute(mc.geometry.attributes.position.array.slice(0, validFloats), 3),
  )

  const welded = mergeVertices(trimmed)
  welded.computeVertexNormals()
  return welded
}

export function BlobFace({ radius = 1 }: { radius?: number }) {
  const geometry = useMemo(() => buildFaceGeometry(), [])

  return (
    <group scale={radius}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color="#f2ede0" metalness={1} roughness={0.24} envMapIntensity={2.6} />
      </mesh>
    </group>
  )
}

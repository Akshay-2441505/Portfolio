import { useMemo } from 'react'
import { BufferAttribute, BufferGeometry, MeshBasicMaterial } from 'three'
import { mergeVertices, MarchingCubes as MarchingCubesImpl } from 'three-stdlib'

/** Chrome metaball "face" replacing the old football as the hero's 3D
 * object (gionatannese.com/about reference) — one dominant round head
 * with a small cluster of clearly secondary "hair" bumps across the top,
 * sculpted with two genuinely subtractive balls for the eye sockets, not
 * a texture trick. `MarchingCubes.addBall` takes a signed strength — a
 * negative ball really subtracts from the scalar field before the
 * isosurface is extracted, so the eyes are actual carved geometry.
 *
 * First pass also added ear bumps that aren't in the reference at all —
 * they broke up the silhouette into something that read as "blob cluster"
 * rather than "head". Dropped them; the read comes from one strong round
 * mass plus a visibly smaller secondary cluster, not more bumps.
 *
 * Built ONCE into a static BufferGeometry (not per-frame, unlike drei's
 * <MarchingCubes> which recomputes every frame for animated blobs we don't
 * need) — the parent scene rotates the whole result toward the cursor the
 * same way it did the football, so there's no per-frame marching-cubes
 * cost. Ball coordinates are the field's own 0..1 space (0.5 = center);
 * the generated geometry comes out centered near the origin with radius
 * ~1, same convention the football used, so a parent `scale` still maps to
 * a world-space radius. Resolution is deliberately modest — this whole
 * geometry is generated synchronously on mount, and a higher-resolution
 * grid was a noticeable stall (the "slow" first-load complaint). */

const RESOLUTION = 42
const MAX_POLY_COUNT = 40000

type Ball = { x: number; y: number; z: number; strength: number; subtract: number }

// Strong enough on its own to form a properly round mass in every axis —
// the earlier version relied on a low global isolation threshold to grow
// the head large enough, which also let the isosurface reach much further
// in X/Y (where other balls reinforced it) than in Z (where nothing did),
// flattening the head front-to-back. A dominant head ball fixes both the
// roundness and the poly bloat that low isolation caused everywhere else.
const HEAD: Ball = { x: 0.5, y: 0.4, z: 0.5, strength: 6, subtract: 9 }

const HAIR: Ball[] = [
  { x: 0.5, y: 0.72, z: 0.48, strength: 0.9, subtract: 10 },
  { x: 0.38, y: 0.68, z: 0.46, strength: 0.75, subtract: 10 },
  { x: 0.62, y: 0.68, z: 0.46, strength: 0.75, subtract: 10 },
  { x: 0.29, y: 0.58, z: 0.44, strength: 0.55, subtract: 11 },
  { x: 0.71, y: 0.58, z: 0.44, strength: 0.55, subtract: 11 },
]

// Negative strength — genuinely subtracts, carving eye sockets rather than
// painting them on.
const EYES: Ball[] = [
  { x: 0.4, y: 0.43, z: 0.72, strength: -0.4, subtract: 15 },
  { x: 0.6, y: 0.43, z: 0.72, strength: -0.4, subtract: 15 },
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

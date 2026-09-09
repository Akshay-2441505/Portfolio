import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { BufferAttribute, IcosahedronGeometry } from 'three'

/** Procedural low-poly football — the site's single 3D wow object
 * (RESET.md), replacing the old crystal-shard cluster. A subdivided
 * icosahedron (no GLB/texture pipeline needed — consistent with STATUS4's
 * finding that no 3D-asset generation tool is available in this
 * environment) with per-face vertex colors alternating between the site's
 * own off-white and a dark tone derived from --color-accent-primary, so the
 * panel pattern is literally built from the site's 2-color palette instead
 * of an invented black/white. */

const PANEL_LIGHT: [number, number, number] = [0.949, 0.941, 0.922] // #f2f0eb — matches --color-fg
const PANEL_DARK: [number, number, number] = [0.02, 0.1, 0.11] // dark cyan-black, echoes --color-accent-primary

function buildPanelColors(geometry: IcosahedronGeometry) {
  const position = geometry.attributes.position
  const faceCount = position.count / 3
  const colors = new Float32Array(position.count * 3)

  // Deterministic PRNG so the panel pattern is stable across re-renders and
  // identical between runs — no seed-drift bugs.
  let seed = 11
  function rand() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  for (let face = 0; face < faceCount; face++) {
    const color = rand() > 0.6 ? PANEL_DARK : PANEL_LIGHT
    for (let vertex = 0; vertex < 3; vertex++) {
      const idx = (face * 3 + vertex) * 3
      colors[idx] = color[0]
      colors[idx + 1] = color[1]
      colors[idx + 2] = color[2]
    }
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3))
}

export function Football({
  radius = 1,
  spin = 0.15,
}: {
  radius?: number
  /** Ambient self-rotation speed (rad/s), independent of any cursor/scroll
   * rotation a parent scene applies on top of this component's group. */
  spin?: number
}) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<Group>(null)

  const geometry = useMemo(() => {
    // detail 1 subdivides each of the icosahedron's 20 faces into 4,
    // giving 80 flat-shaded triangles — enough to read as a faceted ball
    // without needing per-vertex smoothing or an external mesh.
    const geo = new IcosahedronGeometry(radius, 1)
    geo.toNonIndexed() // each triangle needs its own 3 vertices to color independently
    geo.computeVertexNormals()
    buildPanelColors(geo)
    return geo
  }, [radius])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * spin
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.35}
          metalness={0.1}
          emissive="#04f6fc"
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

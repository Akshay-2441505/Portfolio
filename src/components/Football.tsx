import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BufferAttribute, IcosahedronGeometry } from 'three'

/** Procedural low-poly football — the site's single 3D wow object
 * (RESET.md), replacing the old crystal-shard cluster. A subdivided
 * icosahedron (no GLB/texture pipeline needed — consistent with STATUS4's
 * finding that no 3D-asset generation tool is available in this
 * environment) with per-face vertex colors, so the panel pattern reads
 * against the site's beige background.
 *
 * PANEL_DARK is a purpose-built sandy tan, not --color-fg or --color-muted:
 * the sphere sits behind the hero headline and sub-line, and a panel that
 * matched either text color made overlapping letters unreadable (same
 * luminance, no contrast). Sitting clearly lighter than both text tones
 * keeps every overlap legible, at the cost of no longer literally reusing a
 * page token for this one shape. */

const PANEL_LIGHT: [number, number, number] = [0.937, 0.906, 0.847] // #efe7d8 — matches --color-bg
const PANEL_DARK: [number, number, number] = [0.722, 0.671, 0.561] // #b8ab8f — dedicated tan, lighter than --color-muted

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
  const groupRef = useRef<Group>(null)

  const geometry = useMemo(() => {
    // detail 2 subdivides each of the icosahedron's 20 faces into 16, giving
    // 320 flat-shaded triangles — fine enough that the panel pattern reads as
    // a football's panels rather than a rough polyhedron. IcosahedronGeometry
    // is already non-indexed, so each triangle owns its 3 vertices and can be
    // colored independently with no conversion step.
    const geo = new IcosahedronGeometry(radius, 2)
    geo.computeVertexNormals()
    buildPanelColors(geo)
    return geo
  }, [radius])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * spin
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        {/* No emissive: a self-glow would pull both panel colors toward the
         * same tone, flattening the two-tone contrast the pattern exists for.
         * The scene's pointLight still tints the ball, but as light on a
         * surface — the light/dark panels stay distinguishable. */}
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.35}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

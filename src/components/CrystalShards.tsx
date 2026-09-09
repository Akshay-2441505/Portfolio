import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import type { Group } from 'three'

/** Procedural crystal-shard geometry — hand-authored, not a generic pulled
 * model (WEBGL_UPGRADE.md calls for a Higgsfield-generated GLB here; no
 * Higgsfield credits were available, so this is the zero-cost, ship-now
 * substitute: an original cluster of faceted low-poly shapes tuned to match
 * the look already established in fifa-card.jpg/akshay-photo.jpg). Shared
 * between HeroScene (large, full-frame) and FifaCardScene (small, corner
 * accent) via the count/spread/scale props. */

type ShardDef = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  geometry: 'icosahedron' | 'tetrahedron'
}

// Tiny deterministic PRNG (not Math.random) so the cluster layout is stable
// across re-renders and identical between server/client — no seed-drift bugs.
function buildShards(count: number, spread: number, seed: number): ShardDef[] {
  let s = seed
  function rand() {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const shards: ShardDef[] = []
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1)
    shards.push({
      position: [
        (rand() - 0.5) * spread,
        (t - 0.5) * spread * 1.6,
        (rand() - 0.5) * spread * 0.6,
      ],
      rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      scale: [0.15 + rand() * 0.18, 0.5 + rand() * 0.9, 0.15 + rand() * 0.18],
      geometry: rand() > 0.5 ? 'icosahedron' : 'tetrahedron',
    })
  }
  return shards
}

export function CrystalShards({
  count = 10,
  spread = 2.2,
  position = [0, 0, 0],
  scale = 1,
  seed = 7,
  spin = 0.05,
}: {
  count?: number
  spread?: number
  position?: [number, number, number]
  scale?: number
  seed?: number
  /** Ambient self-rotation speed (rad/s) — very slow, "something's always
   * moving" baseline independent of any cursor/scroll-driven rotation a
   * parent scene applies on top. */
  spin?: number
}) {
  const groupRef = useRef<Group>(null)
  const shards = useMemo(() => buildShards(count, spread, seed), [count, spread, seed])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * spin
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {shards.map((shard, i) => (
        <mesh key={i} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          {shard.geometry === 'icosahedron' ? (
            <icosahedronGeometry args={[1, 0]} />
          ) : (
            <tetrahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color="#04f6fc"
            emissive="#04f6fc"
            emissiveIntensity={1.4}
            roughness={0.15}
            metalness={0.3}
            transparent
            opacity={0.82}
            toneMapped={false}
            flatShading
          />
        </mesh>
      ))}
      <Sparkles
        count={Math.round(count * 4)}
        scale={spread * 1.4}
        size={2}
        speed={0.2}
        color="#04f6fc"
        opacity={0.7}
      />
    </group>
  )
}

/** Synchronous, one-time WebGL support check — run before any <Canvas>
 * mounts so Hero/FifaCard can branch cleanly between the real 3D scene and
 * the existing Canvas-2D/static-image fallback with no flash between paths
 * (WEBGL_UPGRADE.md's progressive-enhancement requirement). */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector2, type ShaderMaterial } from 'three'

/** Chrome metaball blob — a real raymarched signed-distance-field, not a
 * mesh. Everything happens in the fragment shader of a single fullscreen
 * quad (PlaneGeometry(2,2) with an orthographic camera, vertex shader
 * bypasses the camera matrices entirely since the quad only ever needs to
 * exactly fill the viewport): map(p) unions several animated spheres with
 * a smooth minimum (smin) instead of a hard min, so they melt into each
 * other with soft seams — that continuous liquid-metal blend is the one
 * thing a mesh-based metaball (MarchingCubes, or plain spheres with a
 * metal material) can't cheaply give you, and it's what actually sells
 * "chrome blob" over "cluster of balls".
 *
 * Shading is near-pure reflection, no diffuse/lambertian term at all: the
 * view ray reflects off the surface normal (found via finite differences
 * on the SDF) and samples a simple sky gradient in the site's own ink/
 * beige tones, plus a couple of sharp fixed specular highlights and a
 * cursor-driven glint (dot(normal, directionToCursor) raised to a high
 * power). Misses are left fully transparent so the page's own beige shows
 * through — no environment map, no lights, no external texture. */

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  #define NUM_BALLS 6
  #define MAX_STEPS 80
  #define MAX_DIST 20.0
  #define SURF_DIST 0.0015

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  // Polynomial smooth minimum (Inigo Quilez) — blends two SDFs with a
  // soft seam of width k instead of a hard min() crease.
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float map(vec3 p) {
    // Central mass, gently breathing.
    float d = sdSphere(p, 0.85 + sin(uTime * 0.6) * 0.04);

    for (int i = 1; i < NUM_BALLS; i++) {
      float fi = float(i);
      float ang = fi * 2.4 + uTime * 0.3;
      float orbitR = 0.5 + 0.08 * sin(uTime * 0.4 + fi * 1.7);
      vec3 c = vec3(
        cos(ang) * orbitR,
        0.5 + sin(uTime * 0.5 + fi * 1.3) * 0.18,
        sin(ang) * orbitR * 0.6
      );
      float r = 0.26 + 0.05 * sin(uTime * 0.8 + fi * 2.1);
      d = smin(d, sdSphere(p - c, r), 0.35);
    }

    return d;
  }

  float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      float d = map(ro + rd * t);
      if (d < SURF_DIST) return t;
      t += d;
      if (t > MAX_DIST) break;
    }
    return -1.0;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.0015, 0.0);
    return normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)
    ));
  }

  // Simple vertical gradient standing in for an environment map — the
  // site's own ink and beige tones, not an invented "sky".
  vec3 skyColor(vec3 rd) {
    float t = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 beige = vec3(0.937, 0.906, 0.847);
    vec3 ink = vec3(0.114, 0.102, 0.090);
    vec3 col = mix(beige, ink, t);
    float band = smoothstep(0.35, 0.5, t) * (1.0 - smoothstep(0.5, 0.65, t));
    col += band * vec3(0.84, 0.80, 0.70) * 0.25;
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

    vec3 ro = vec3(0.0, 0.0, 3.2);
    vec3 rd = normalize(vec3(uv, -1.6));

    float t = raymarch(ro, rd);
    if (t < 0.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 refl = reflect(rd, n);

    vec3 col = skyColor(refl);

    // Two fixed, sharp specular highlights — not lights doing diffuse
    // work, just hard glints so the surface reads as polished.
    vec3 lightDirA = normalize(vec3(0.6, 0.7, 0.5));
    vec3 lightDirB = normalize(vec3(-0.5, 0.25, 0.6));
    col += vec3(1.0) * pow(max(dot(refl, lightDirA), 0.0), 300.0) * 0.9;
    col += vec3(0.95, 0.9, 0.8) * pow(max(dot(refl, lightDirB), 0.0), 140.0) * 0.5;

    // Cursor glint: the mouse acts as a virtual light direction, so the
    // highlight sweeps across the surface as the visitor moves the
    // pointer — wherever the normal points back at the cursor.
    vec3 mouseDir = normalize(vec3(uMouse * 1.3, 1.0));
    col += vec3(1.0, 0.97, 0.9) * pow(max(dot(n, mouseDir), 0.0), 36.0) * 0.7;

    // Fresnel-style rim darkening (view-angle based, not light-angle —
    // still no diffuse term) so the form reads as curved, not flat.
    float fres = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
    col = mix(col, col * 0.35, fres * 0.35);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function ChromeBlobField() {
  const materialRef = useRef<ShaderMaterial>(null)
  const { gl } = useThree()
  const mouse = useRef(new Vector2(0, 0))

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      )
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0, 0) },
    }),
    [],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uTime.value = state.clock.elapsedTime
    // gl_FragCoord is in physical pixels — the drawing buffer's actual
    // size, not the CSS size useThree().size reports.
    material.uniforms.uResolution.value.set(gl.domElement.width, gl.domElement.height)
    material.uniforms.uMouse.value.copy(mouse.current)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

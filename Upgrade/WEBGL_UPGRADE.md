# WebGL Upgrade — real 3D, both Hero and FIFA Card
Supersedes the Canvas 2D guardrail in `DESIGN_BRIEF.md` and `TECH_SPEC.md` (both updated to point here). This is a deliberate architecture reversal — read "why this time is different" before implementing, since the original failure mode is easy to repeat if the root cause isn't actually addressed rather than just avoided by being careful.

## Scope (confirmed)
Both Hero background and FIFA Card get real 3D geometry — not a CSS-3D trick, not a static image with a magnetic hover. Real WebGL scenes in both places.

## Why this time is different — the actual root-cause fix
"Suspense/sizing bugs" in R3F almost always trace to one thing: the `<Canvas>` doesn't have an explicit, pre-determined size before its content loads. It can't size itself to content the way a normal DOM element does — it needs its parent container sized first.

Concrete fixes, not just "be more careful this time":
- Every `<Canvas>`'s parent container gets explicit dimensions (fixed aspect-ratio box, or `ResizeObserver`-driven size) **before** the Canvas mounts — never inherited "auto" from content.
- Suspense fallback renders as a placeholder at the **final rendered size**, not a spinner in a collapsed box — this is what actually causes the layout-shift category of "sizing bug" in practice.
- Use `<Preload all>` from drei so assets are ready before first paint, instead of a bare `Suspense` popping content in mid-scroll.

## Stack additions
- `@react-three/fiber` + `@react-three/drei` (`OrbitControls`, `useGLTF`, `Preload`, `PerformanceMonitor`)
- `@react-three/postprocessing` — for real bloom, tied directly to the "glow instead of flat fills" work in `PALETTE.md`. Geometry that's actually emitting light, not CSS box-shadow faking it.

## Progressive enhancement — not a hedge, the structurally correct approach
Feature-detect WebGL support; fall back to the existing (still-functional) Canvas 2D version on devices/browsers without it or performing poorly. `PerformanceMonitor` from drei can auto-downgrade quality in real time rather than a hard binary fallback.

## Hero — real 3D scene
Replaces the canvas-2D scroll-scrubbed frame sequence. Scene extends the crystal-shard visual language already established on the FIFA Card — not a new, unrelated 3D language. Cursor-reactive.

## FIFA Card — real 3D geometry
Replaces the flat card image + CSS tilt trick from the earlier brainstorm (absorbed into this, not built separately):
- Cursor-follow tilt-and-gloss becomes actual camera/light movement responding to cursor position, not a CSS transform faking depth.
- The crystal-shard corner element becomes real geometry instead of baked into the card image; continuous particle sparkle becomes genuine 3D particles.

## Custom assets
Higgsfield's 3D tools are already connected (`generate_3d` / `scene_builder_3d`) — generate custom GLB assets matching the crystal-shard language rather than pulling generic models. Same "original assets, not borrowed" principle running through this entire build.

## Magnet-hover hero portrait — confirmed: build it
Reverses the deviation in `STATUS3.md`/`PUNCH_LIST.md` item 4, where Claude Code skipped this as redundant with the Kickoff video's reveal.

Worth being clear-eyed about the combination: your face now appears in three places in quick succession — the Kickoff video's reveal, this Magnet-hover portrait in Hero, and the FIFA Card (real 3D geometry, further down the page). Recorded here as a deliberate choice. Proceed exactly as specified in `TECH_SPEC.md` §2.

## Still open — do not resolve silently
Kickoff video duration (5.46s vs. the original 3–4s target) — explicitly not decided yet. Leave the video at its current length; revisit when there's an actual answer.

## Also still blocked, unrelated to this upgrade
Real screenshots for Dekho and Frontage Highlights cards — still needed, still not provided.

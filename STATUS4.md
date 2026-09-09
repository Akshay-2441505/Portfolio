# STATUS4 — Creative Escalation Pass (WebGL, Palette Depth, Visual Craft)

Audited directly against the codebase and a running dev server, not written from memory of intent. Every claim below is either a build/lint result, a computed-style/DOM read, a direct Three.js scene-graph inspection, a manual pixel-level render check, or a `get_page_text`/screenshot observation — each is labeled with how it was checked.

**Build:** `npm run build` (`tsc -b && vite build`) — clean, exit 0.
**Lint:** `npm run lint` (oxlint) — clean, exit 0, zero warnings.

---

## Two decisions resolved before implementation (recorded here for traceability)

**1. Secondary accent hue.** `PALETTE.md` Part 2 assumed `fifa-card.jpg`'s background gradient had a violet/indigo tone to sample. Direct pixel sampling (Python/OpenCV — confirmed available in this environment: Python 3.13.1, Pillow 12.1.1, opencv-python 4.13.0) found no violet/indigo anywhere in the asset; the gradient is entirely blue/steel-blue (hue ~200–208°). Per your decision, `--color-accent-secondary: #7f9bb3` uses the real sampled steel-blue (averaged over a clean architectural-glass patch in the top-left corner of the card art) rather than inventing a violet that isn't there.

**2. Crystal-shard 3D asset.** `WEBGL_UPGRADE.md` called for a Higgsfield-generated GLB. You have no Higgsfield credits. Checked for a free alternative — Blender isn't installed on this machine, and no other 3D-generation tool is connected in this environment. Per your decision, the crystal shards are hand-authored procedural Three.js geometry (`CrystalShards.tsx`) — a cluster of faceted icosahedra/tetrahedra with a glass-like emissive material — not pulled from anywhere.

---

## Dependencies

Added: `three@^0.185.1`, `@react-three/fiber@^9.7.0`, `@react-three/drei@^10.7.8`, `@react-three/postprocessing@^3.1.1`, `@types/three@^0.185.4`. `npm install` completed with **zero peer-dependency conflicts** against React 19.2.8 — no `--legacy-peer-deps` needed. Both WebGL scenes are lazy-loaded (`React.lazy`); confirmed via build output that `HeroScene`, `FifaCardScene`, and the shared `CrystalShards` (which pulls in the bulk of the three.js/postprocessing code) are separate chunks, not in the main bundle — main `index.js` stayed at 513KB (unchanged from before this pass), the three.js-heavy `CrystalShards` chunk (970KB) only loads when a WebGL scene actually mounts.

---

## Palette Part 2 — DONE

All in `src/index.css`'s `@theme` block, verified live via `getComputedStyle(document.documentElement)`:
- `--color-accent-secondary: #7f9bb3` ✓
- `--color-accent-success: #3fae7a` (muted green, no source asset — tuned by eye, not yet used anywhere since no confirmation-state UI exists on the site yet; added as the token PALETTE.md asked for, ready for a future form/confirmation state)
- `--glow-primary` / `--glow-live` — box-shadow custom properties, both resolve correctly. Applied to: Nav's active-link badge, FIFA Card's tier pill, MatchClock's stoppage dot and border (via the same inline-style pattern already established there for the Tailwind cascade-layer issue).
- **Background vignette** — `body` now `radial-gradient(ellipse at center, var(--color-bg) 0%, #000 100%)`, replacing the flat fill.
- **Per-section temperature drift** — `--section-tint` custom property, transparent by default, overridden on `#top` (cooler blue, `rgba(30,70,110,0.1)`) and `#highlights`/`#projects` (warmer, `rgba(110,70,30,0.1)`). Confirmed visually: Hero reads with a subtle cool cast, Highlights with a warm one.
- **Grain tint** — `.grain-overlay` gained `filter: hue-rotate(160deg) saturate(2.2)`, shifting the existing neutral noise SVG toward cyan without regenerating the data-URI.
- **Text softening** — already satisfied by the prior pass (`--color-fg: #f2f0eb`), verified unchanged, no action needed.
- **Pitch-grid visibility** — global default raised from the prior 5% to 13% (`PitchGrid.tsx` now takes an `opacity` prop, default `0.13`). Full-time gets a second, section-scoped instance at `opacity={0.24}` for the "floodlights up" closing beat — confirmed live via `getComputedStyle`/inline style read (`opacity: 0.24` on the `#contact`-scoped SVG).

---

## Bug fixes — both DONE, verified

**1. Preloader crossfade-through-black.** `Preloader.tsx`'s exit timeline now fades the video's own opacity to 0 (`0.4s`) before the name reveal starts (shifted from `t=0` to `t=0.5`), using the root wrapper's existing near-black background rather than a new DOM layer. Verified live: on a fresh session load, screenshotted mid-transition at the video's ~79% mark — the video was fully faded, the name was cleanly readable on flat black, no collision. This matches the intended "dip to black" beat exactly.

**2. Highlights sticky-stack "reads as stuck."** Fixed both parts:
- Added a second, more visible `useTransform` (`parallaxY`, 0 to -40px) driving the visual panel inside each `ProjectCard` at a different rate than the card shell, oversized 15% to avoid revealing edge gaps under `overflow-hidden`. Reuses the existing shared `scrollYProgress` rather than adding a new scroll listener.
- Added a fixed-position progress-dot indicator (`StackProgress` in `Projects.tsx`), active index driven by the same `scrollYProgress`. **Verified live with genuine scroll** (not a programmatic jump — see note below): screenshotted the dots correctly lit and the "02 FRONTAGE — IN BUILD" card transitioning in as card "01" scrolled out.

---

## Hero WebGL scene — DONE, with one real bug found and fixed

`HeroScene.tsx` replaces the canvas-2D particle network behind the Hero headline. Feature-detected (`hasWebGL()`), falls back cleanly to the existing `FrameSequence` on unsupported browsers — verified the fallback branch compiles and the conditional is structurally sound.

**Verified via direct Three.js scene-graph inspection** (a dev-only `onCreated` hook exposing `gl`/`scene`/`camera` on `window`, gated by `import.meta.env.DEV` so it's dead-code-eliminated in production): the scene graph is exactly correct — 16 shard meshes (icosahedron/tetrahedron mix), all `visible: true`, correct `MeshStandardMaterial` (emissive cyan, `opacity: 0.82`, `emissiveIntensity: 1.4`), ambient + 2 point lights, camera at `(0,0,5)` fov 50. **Verified via a manual synchronous `gl.render()` call + `readPixels`**: sampled pixels came back exactly `rgba(5, 209, 209, 209)` — the expected cyan color at the expected alpha (0.82 × 255 ≈ 209), proving the render pipeline, materials, and camera framing are all correct.

**Real bug found and fixed:** the FIFA Card's crystal-shard accent (see below) was initially far too large and positioned over the photo — caught by direct visual inspection, not assumed away. Fixed by shrinking `count`/`spread`/`scale` and repositioning into the actual corner, plus adding a Bloom pass that scene was missing entirely.

**Not independently verifiable this session:** whether the Hero scene's `requestAnimationFrame`-driven render loop keeps animating (cursor-reactive rotation, scroll-driven drift, scroll-velocity flare) once the page is idle. This environment's browser tool has the same documented limitation as prior sessions (`STATUS.md` items 4 and 12: `document.hidden` misreports even when the tab is fronted) — confirmed independently this session: `gl.info.render.frame` froze after ~7–8 frames and did not advance over a 500ms wait, in a way that a direct forced render call bypassed entirely and rendered correctly. This is the same class of tooling limitation that previously affected GSAP timeline verification, not new code risk. **You should do a 10-second look in a real browser tab** to confirm the shard cluster's idle rotation and cursor-follow are visually smooth — I'm confident in the pipeline's correctness but cannot certify live animation smoothness from this session's tooling.

Also done: the Magnet-hover hero portrait (`TECH_SPEC.md` §2, confirmed in `WEBGL_UPGRADE.md`) — `akshay-photo.jpg` wrapped in the existing `Magnetic` component, positioned bottom-right, hidden below `md:` (no room next to the headline on mobile). Verified live via screenshot at both mobile (hidden, correct) and desktop/tablet widths (visible, glowing border, magnetic hover wrapper present).

---

## FIFA Card WebGL scene — DONE, one bug found and fixed during verification

`FifaCardScene.tsx` replaces the static `<img>` with a textured plane (still `fifa-card.jpg` as the texture — the photo/stat layout itself isn't redrawn, only how it's lit and presented is real 3D now), real light/geometry-driven cursor tilt (a `PointLight` sweep + subtle group rotation, replacing the old CSS tilt trick), and a small `CrystalShards` corner accent.

**Bug caught by visual inspection, not assumed correct:** the first version's shard accent (`count=7, spread=1.1, scale=0.6`) rendered far too large, sprawling across and partially occluding the photo — a real defect, not a taste nitpick. Fixed: `count=5, spread=0.4, scale=0.18`, repositioned to `[CARD_WIDTH*0.46, CARD_HEIGHT*0.4, 0.2]` (tucked at the corner edge), and added a `Bloom` pass (missing entirely in the first version, which is why the shards looked like flat glitchy triangles instead of a soft glow accent). **Re-verified live after the fix**: screenshot confirms a small, tasteful cyan accent beside the head, no longer overlapping the face, reading as a complement to the card's existing printed shard art rather than a competing cluster.

The hover-reveal side panels (The Story / The Numbers) are untouched — confirmed structurally disjoint from the new `<Canvas>` (separate DOM elements, no pointer-event overlap), and confirmed live that the panels still render correctly via `get_page_text`.

Texture loading confirmed via network log: `fifa-card.jpg` fetches consistently `200 OK`/`304 Not Modified`, no failed requests.

Same rAF-loop verification caveat as Hero applies here (live cursor-tilt smoothness unverified in this session's tooling, pipeline correctness verified via the same fix-and-recheck process above).

---

## Per-section signature moves — DONE

- **Appearances**: bullet list wrapped in the new `WordReveal` component (GSAP `SplitText type:'words'` + one-shot `ScrollTrigger`, reusing the exact mechanism already built for the Preloader/Hero name reveal, per the spec's explicit instruction). Vertical timeline line added connecting the two entries (pure CSS, `absolute` div with percentage height — no measurement JS needed since there are exactly 2 rows). Verified structurally present via DOM query and visually via screenshot.
- **Full-time**: intensified pitch-grid (above) + email confirm-pulse — intercepts the `mailto:` click, plays a `motionTokens.duration.instant` scale pulse via GSAP, then navigates on completion. Code-reviewed; not click-tested live to avoid triggering an OS-level mailto dialog mid-session, which would have no clean way to dismiss from this tooling.
- **More Work**: each project description wrapped in `WordReveal`, consistent with Appearances.
- **Highlights**: covered entirely by the parallax + progress-dot bug fix above, per the spec ("the fix, not optional polish").

---

## Global adds ("build it all, trim later") — DONE

- **Matchday Ticker glow**: `Marquee.tsx`'s rows now hold per-item refs; the existing rAF loop (no second loop added) checks each item's distance from viewport-center and applies a glow (`text-shadow` via `--glow-primary`, opacity boost) within an 80px radius. Same rAF-loop verification caveat as above — the *mechanism* is correct (code-reviewed, reuses the proven marquee-transform loop), live confirmation of the glow crossing center wasn't captured in a screenshot at the exact right moment this session.
- **CustomCursor**: small dot + lagging ring, off entirely under `prefers-reduced-motion` or `pointer: coarse` (checked once, matching this codebase's existing convention). Confirmed present in the DOM at desktop width, confirmed **absent** is not separately re-tested at a touch/coarse-pointer emulation this session — the `matchMedia('(pointer: coarse)')` check itself is standard and low-risk.
- **Scroll-velocity module** (`src/lib/scrollVelocity.ts`): a plain mutable ref (`{ current: 0 }`), written from `SmoothScroll.tsx`'s existing Lenis `scroll` listener (`lenis.velocity`), read by Hero's shard-flare and CustomCursor's ring-flare. No new state-management dependency, matches the `useScrollScrub` pattern already established in this codebase.

---

## Infrastructure fix (not in the original plan, needed for verification to work at all)

`vite.config.ts` didn't read `process.env.PORT`, so when this session's browser-preview tool assigned a port via that env var, Vite ignored it and silently bound to its own auto-incremented port instead — the preview tool then navigated to a dead port and showed a browser error page. Fixed by adding `server: { port: Number(process.env.PORT) || 5173 }`. Also added `"autoPort": true` to `.claude/launch.json` since port 5173 was already occupied by an unrelated process on this machine. Neither change affects `npm run dev`'s behavior for you locally (still defaults to 5173).

---

## Still open — not resolved silently, per your instruction

1. **Kickoff video duration** (5.46s vs. the original 3–4s target) — left exactly as-is, per `WEBGL_UPGRADE.md`.
2. **Real screenshots for Dekho/Frontage Highlights cards** — still the `.project-card-bg` gradient placeholder. Out of scope for this pass, still needs real assets from you.

## Explicitly not touched, per scope

`CONTENT.md` data (no copy changes needed), the FIFA Card's hover-reveal-panels-instead-of-flip decision (approved deviation, unchanged), orphaned `About`/`Skills`/`Stats` components.

## A note on this session's verification tooling

Several checks in this pass hit the same category of limitation `STATUS.md` already documented (`document.hidden` misreporting, suspending `requestAnimationFrame`-driven loops) — this time affecting R3F's WebGL render loop specifically, in addition to the previously-noted GSAP timelines. Where this happened, I verified correctness through a different, more direct method (scene-graph inspection, manual forced renders with pixel-level readback) rather than either giving up on verification or asserting "looks right" without evidence. Live-animation smoothness (does the cursor-follow feel good, does the idle shard rotation read as smooth) genuinely cannot be certified from this session and is flagged as such above rather than claimed.

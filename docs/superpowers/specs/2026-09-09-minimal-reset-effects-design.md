# Minimal Reset + GSAP Effects — Design Spec

Supersedes the football/FIFA-Card build documented in `STATUS4.md` and
`PUNCH_LIST.md`. Source docs: `Upgrade2/RESET.md` (structural direction),
`Upgrade2/EFFECTS_PLAN.md` (motion techniques, extends RESET), `Upgrade2/CONTENT.md`
(copy, mostly already reflected in `src/data/content.ts`). Reference GSAP demos
supplied by the user (2026-09-09), used as literal implementation references
where noted.

## 1. Retirement

Delete outright (no longer referenced anywhere):
- `src/components/FifaCard.tsx`
- `src/components/FifaCardScene.tsx`
- `src/components/MatchClock.tsx`
- `src/components/PitchGrid.tsx`
- `src/components/CrystalShards.tsx` (superseded by the football mesh in §4; nothing else imports it once `FifaCardScene` is gone)

Unmount from `src/App.tsx`: `<PitchGrid />`, `<MatchClock />`, `<FifaCard />`.
Mount `<About />` and `<Skills />` in the FIFA Card's old position — both
components already exist, already render plain (non-football) content, and
were simply orphaned when the FIFA Card took over. No rewrite needed, just
wiring.

Remove the "Open to Work" `profile.status` badge — contradicts the
founder/product positioning (PUNCH_LIST P1), never specified by any design doc.

Preloader: drop the `kickoff-reveal.mp4/webm` phase per RESET's retirement
list. Reverts to the original name-reveal-only mechanic CONTENT.md specifies
("Kickoff (Preloader) — Name reveal only, unchanged mechanic"). The video
files stay on disk (history), just unreferenced from `Preloader.tsx`.

Also fix while touching `About.tsx`: it references `var(--color-accent)`,
which doesn't exist in `index.css`'s token set (dead reference, pre-existing
bug) — correct to `var(--color-accent-primary)`.

## 2. Palette

Collapse `src/index.css`'s `@theme` block to 2 colors + neutrals:

- Keep `--color-bg` (#0a0a0a), `--color-fg` (#f2f0eb), `--color-surface`,
  `--color-muted`, `--color-border` — the near-monochrome base, unchanged.
- Keep `--color-accent-primary` (#04f6fc cyan) as the single accent. It
  remains a real, previously-sampled color (not invented) even though its
  source asset (`fifa-card.jpg`) is retiring as a rendered element — reused
  rather than resampled to avoid unnecessary churn, since it's already wired
  through nav, links, selection, scrollbar, glow tokens.
- Delete `--color-accent-secondary` (#7f9bb3) and `--color-accent-success`
  (#3fae7a) — no real job once the FIFA card and confirmation-state UI are
  gone.
- Delete `--color-accent-live` (#ff5c35) and `--glow-live` — its only two
  jobs (MatchClock stoppage state, FIFA Card ribbon) are both retired.
  Frontage's "in build" status becomes an outlined/muted tag using the
  existing cyan system instead of a third hue, keeping the palette strictly
  at 2 colors per RESET ("2-3 colors max... pick colors that earn their
  place").
- Keep the background vignette, per-section temperature drift, and grain
  tint as-is — real depth/atmosphere, not semantic color additions, RESET's
  "What's kept" doesn't ask to remove these.

## 3. Content (`src/data/content.ts`)

- Delete the `fifaCard` export and its `FifaAttribute` type entirely —
  position/tier/club/nation/ribbon/attributes/football-framed bio all retired
  per RESET (no football vocabulary anywhere in copy).
- `heroCopy.positionTag`: drop the literal word "Position:" — render just
  "Product & Build" (fold into the existing tag styling, no new field).
- Remove `profile.status` ("Open to work") or stop rendering it — confirm
  which by checking `Nav.tsx`/wherever it renders, then remove at the source.
- Everything else (`about`, `education`, `experience`, `skills`,
  `marqueeItems`, `projects`, `moreWork`, `fullTime`, `stats`,
  `certifications`) stays as-is — already football-vocabulary-free, per
  RESET's "carry forward all real content."

## 4. Hero — football 3D object

In `src/components/HeroScene.tsx`, replace the `CrystalShards` mesh with a
new low-poly procedural football: an icosphere (or truncated-icosahedron-style
facet pattern) with flat-shaded alternating light/dark faces to read as a
football's panel pattern, built from primitive Three.js geometry — no GLB or
external asset needed, consistent with STATUS4's finding that no 3D-asset
generation pipeline is available in this environment. Reuse the existing
rig unchanged: cursor-follow rotation, scroll-drift, ambient + point lights,
Bloom pass, camera at `(0,0,5)` fov 50, `hasWebGL()` feature-detection with
`FrameSequence` fallback. Only the mesh/geometry changes.

`FifaCardScene`'s corner shard accent goes away entirely with the file (§1) —
it has no home once the FIFA Card is gone.

## 5. Effects (`Upgrade2/EFFECTS_PLAN.md`, mapped to reference pens)

Build order, each tied to a real reference demo (not an abstract description):

1. **Preloader stagger** — ref: [GSAP 101 - Staggers](https://codepen.io/GreenSock/pen/LYdzaoz).
   `Hero.tsx` already runs a per-char `SplitText` reveal with
   `stagger: 0.03`; confirm timing/easing reads as an intentional staggered
   reveal (the demo's `stagger`/`ease: "sine.out"` pattern), tune numbers if
   needed — same mechanic, not a rebuild.
2. **Matchday ticker glow** — already implemented in `Marquee.tsx`
   (`applyCenterGlow`, `GLOW_RADIUS`). No ref pen supplied for this one;
   verify live, no rebuild.
3. **Projects card stack** — ref: [Flip Cards](https://codepen.io/GreenSock/pen/Yzdzxem).
   Click-to-cycle (confirmed by the actual demo code, not scroll-scrubbed):
   click anywhere on the stack → `Flip.getState()` → move back card to
   front → `Flip.from()` with `onEnter` (new top card slides/fades in) and
   `onLeave` (old top card slides out bottom-left, removed from DOM). Applies
   to the 3 `projects` entries in `Projects.tsx`/`ProjectCard.tsx`, replacing
   the current sticky-stack implementation.
4. **Footer velocity-bounce** — ref: [Footer Bounce Based on Scroll Speed](https://codepen.io/GreenSock/pen/bGeZvpO).
   `ScrollTrigger.create` on Contact's footer, `onEnter` reading
   `self.getVelocity()`, driving an SVG path morph (`MorphSVGPlugin`) or
   equivalent transform scaled to scroll speed. Reuses the existing
   `src/lib/scrollVelocity.ts` module (Lenis `scroll` listener) already
   written from a prior pass instead of adding a second velocity source.
5. **Footer text morph "See Ya"** — ref: [MorphSVG convertToPath()](https://codepen.io/GreenSock/pen/gagNeR).
   `MorphSVGPlugin.convertToPath()` on an abstract shape (circle/blob —
   explicitly NOT football-shaped, RESET reserves the football silhouette
   for the single Hero object only) morphing into "See Ya" text as a
   one-time farewell beat when the visitor reaches Contact.
6. **Horizontal Text** — ref: [ContainerAnimation SplitText](https://codepen.io/GreenSock/pen/MYyBrZw).
   Not the site's wow moment (that's the Hero football per RESET) — gets its
   own home as a pinned horizontal-scroll treatment of the About section's
   opening line, using `containerAnimation` + `SplitText` exactly as the
   reference demo structures it.
7. **Experimental trio** — build all three, trial, keep only what earns its
   place (EFFECTS_PLAN's own framing):
   - **Cursor Trail** — ref: [flair cursor follower](https://codepen.io/GreenSock/pen/WbbEGmp).
     Recolor the flair assets to the site's 2-color palette (cyan/off-white)
     before judging — the demo's own multi-hue assets were never meant to
     ship.
   - **Canvas Particles** — ref: [Canvas particles](https://codepen.io/GreenSock/pen/NWZRRNb).
     Same recolor requirement.
   - **Image Mask on Scroll** — ref: [Image comparison on scroll](https://codepen.io/GreenSock/pen/oNjgEjm).
     Adapted, not copied verbatim: the reference is a two-image before/after
     wipe; this site has no before/after pair, so it becomes a single-image
     scroll-reveal (a panel wipes away to reveal the About-section photo),
     keeping the same pin + scrub mechanic (`ScrollTrigger` with
     `start/end` tied to `section.offsetWidth`, `pin: true`) applied to one
     image instead of two.
   - Trim order if a pass happens later (per EFFECTS_PLAN, unchanged):
     Canvas Particles and Cursor Trail first, Image Mask on Scroll last.

## 6. Assets still needed from the user

Not blocking — build proceeds with placeholders, swap in when supplied:
- Real screenshots for the Dekho and Frontage Highlights cards (currently a
  gradient placeholder `.project-card-bg`) — flagged as outstanding since
  `STATUS4.md`, still true.
- Nothing else new: the football 3D object is procedural geometry (§4), no
  GLB/texture needed; the footer morph's source shape is a simple
  vector/abstract shape built inline, no image asset needed.

## 7. Explicitly out of scope this pass

- Full palette/token audit beyond §2 (e.g., regenerating the grain SVG's own
  color channel — stays as a `filter: hue-rotate` on the existing asset).
- Any new project or content beyond what's already in `content.ts`.
- Sound (RESET marks it optional/opt-in, not requested this pass).

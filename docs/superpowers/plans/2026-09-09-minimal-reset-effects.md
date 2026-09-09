# Minimal Reset + GSAP Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the football/FIFA-Card theme in favor of RESET.md's minimal 2-color direction with a single 3D football moment, then build the EFFECTS_PLAN.md GSAP techniques against the reference CodePen demos supplied by the user.

**Architecture:** No new libraries or build-system changes — everything is React 19 + Tailwind v4 + GSAP 3.15 (SplitText/ScrollTrigger already registered; Flip and MorphSVGPlugin get registered as new tasks introduce their first consumer) + React Three Fiber, following patterns already established in this codebase (`useGSAP` scoping, `prefers-reduced-motion` gates on every animation, plain mutable refs for anything read inside a rAF loop). Work proceeds in dependency order: retire the old system first (so nothing references soon-to-be-deleted tokens/components mid-plan), then layer the new content/palette, then the Hero 3D object, then each GSAP effect.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (`@theme` tokens in `src/index.css`), GSAP 3.15 (`ScrollTrigger`, `SplitText`, `Flip`, `MorphSVGPlugin`), `@gsap/react`'s `useGSAP`, React Three Fiber + `@react-three/postprocessing` (Hero scene only), Framer Motion (unrelated UI, e.g. `Nav`'s mobile menu — untouched), Lenis (smooth scroll, untouched).

**Spec:** `docs/superpowers/specs/2026-09-09-minimal-reset-effects-design.md`

## Global Constraints

- Final palette tokens, exactly: `--color-bg` (#0a0a0a), `--color-surface` (#111111), `--color-fg` (#f2f0eb), `--color-muted` (#8a8a86), `--color-border`, `--color-accent-primary` (#04f6fc), `--glow-primary`. No other color tokens — `--color-accent-live`, `--color-accent-secondary`, `--color-accent-success`, `--glow-live` are all deleted.
- No football vocabulary anywhere in copy — no "Position," no "Midfield," no bio sentence naming football explicitly. The only football reference on the whole site is the visual 3D object in Hero.
- No new npm dependencies. `Flip` and `MorphSVGPlugin` ship inside the already-installed `gsap` package (`^3.15.0` — all plugins are free/bundled as of GSAP's 2025 licensing change, same reason `SplitText` already works in this repo without a Club GSAP key).
- **This repo has no test framework** (no vitest/jest in `package.json`). Every task verifies with `npm run build` (`tsc -b && vite build`) + `npm run lint` (`oxlint`) + a live check in the browser preview tool, matching this project's own established verification convention (`STATUS4.md`). "Write the failing test" steps are replaced with "write the code, then verify build + lint + live behavior."
- Every new animation must check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and no-op or jump-to-end-state when true — every existing component in this codebase does this; no exceptions.
- Commit after every task (small, working diffs — the repo was only just initialized this session, so history should read as a clean sequence of reviewable steps).

---

### Task 1: Retire the FIFA Card system

**Files:**
- Delete: `src/components/FifaCard.tsx`
- Delete: `src/components/FifaCardScene.tsx`
- Delete: `src/components/MatchClock.tsx`
- Delete: `src/components/PitchGrid.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Contact.tsx`

**Interfaces:**
- Consumes: `About` (from `src/components/About.tsx`, no props, already exists) and `Skills` (from `src/components/Skills.tsx`, no props, already exists) — both already render correctly, just weren't mounted.
- Produces: `App.tsx`'s render tree with `PitchGrid`/`MatchClock`/`FifaCard` gone and `About`/`Skills` mounted between `Marquee` and `Experience`. Later tasks (palette, Hero) assume these four files no longer exist.

- [ ] **Step 1: Delete the four retired component files**

```bash
rm "src/components/FifaCard.tsx" "src/components/FifaCardScene.tsx" "src/components/MatchClock.tsx" "src/components/PitchGrid.tsx"
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

```tsx
import { useState } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { CustomCursor } from './components/CustomCursor'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { SmoothScroll } from './components/SmoothScroll'
import { ScrollTrigger } from './lib/gsap'

const VISITED_KEY = 'portfolio-visited'

function hasVisitedThisSession() {
  try {
    return sessionStorage.getItem(VISITED_KEY) === '1'
  } catch {
    return false
  }
}

function App() {
  const [loading, setLoading] = useState(() => !hasVisitedThisSession())

  return (
    <SmoothScroll>
      {loading && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem(VISITED_KEY, '1')
            } catch {
              // ignore — worst case the preloader replays next load
            }
            setLoading(false)
            requestAnimationFrame(() => ScrollTrigger.refresh())
          }}
        />
      )}
      <div className="grain-overlay" />
      <CustomCursor />
      <div className="relative">
        <Nav />
        <Hero revealReady={!loading} />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </SmoothScroll>
  )
}

export default App
```

- [ ] **Step 3: Remove `PitchGrid` from `src/components/Contact.tsx`**

Remove the import line `import { PitchGrid } from './PitchGrid'`, remove the `<PitchGrid opacity={0.24} absolute />` line and its preceding "Floodlights up" comment block, and drop the now-unnecessary `relative` wrapper comment (the `<section>` itself can keep `className="relative px-6 py-24 md:px-10 md:py-32"` — `relative` is still needed for the footer effects added in later tasks).

- [ ] **Step 4: Verify — build, lint, browser**

Run: `npm run build`
Expected: exit 0, no TypeScript errors (confirms nothing still imports the four deleted files).

Run: `npm run lint`
Expected: exit 0.

Browser check (via the preview tool): load the site, scroll top to bottom. Confirm: no pitch-grid or match-clock UI anywhere, no console errors, an "About" section renders with the existing bio/education/stats content where the FIFA Card used to sit, a "Skills" section renders below it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Retire FIFA Card system, mount About/Skills

Deletes FifaCard, FifaCardScene, MatchClock, PitchGrid per RESET.md.
About and Skills already existed with clean, football-free content —
just wires them into the render tree in the FIFA Card's old spot.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Content strip-down

**Files:**
- Modify: `src/data/content.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing new.
- Produces: `content.ts` with no `fifaCard` export and no `FifaAttribute` type (later tasks never reference them — Task 1 already deleted the only consumer). `heroCopy.positionTag` becomes `'Product & Build'` (no "Position:" prefix). `profile` has no `status` field.

- [ ] **Step 1: Edit `src/data/content.ts` — drop `profile.status`**

Change:
```ts
export const profile = {
  name: 'Akshay Kurdekar',
  initials: 'AK',
  role: 'BCA Student — Interactive & Web Development',
  tagline: 'I build things that move on scroll.',
  location: 'Bengaluru, India',
  status: 'Open to work',
  email: 'akshay.kurdekar@bcah.christuniversity.in',
```
to:
```ts
export const profile = {
  name: 'Akshay Kurdekar',
  initials: 'AK',
  role: 'BCA Student — Interactive & Web Development',
  tagline: 'I build things that move on scroll.',
  location: 'Bengaluru, India',
  email: 'akshay.kurdekar@bcah.christuniversity.in',
```

- [ ] **Step 2: Edit `src/data/content.ts` — drop "Position:" wording**

Change:
```ts
export const heroCopy = {
  headline: 'Akshay Kurdekar',
  subLine: 'Building AI-native products from the problem up.',
  positionTag: 'Position: Product & Build',
  metaLine: 'Co-founding Dekho · BCA, Christ University',
}
```
to:
```ts
export const heroCopy = {
  headline: 'Akshay Kurdekar',
  subLine: 'Building AI-native products from the problem up.',
  positionTag: 'Product & Build',
  metaLine: 'Co-founding Dekho · BCA, Christ University',
}
```

- [ ] **Step 3: Edit `src/data/content.ts` — delete the `fifaCard` export and `FifaAttribute` type**

Delete the entire block from `export type FifaAttribute = {` through the closing `}` of `export const fifaCard = { ... }` (currently lines 179–248 — the type declaration, then the `fifaCard` object with `name`/`position`/`positionFull`/`overall`/`tier`/`club`/`nation`/`ribbon`/`attributes`/`bio`). Nothing after it (the `stats` and `certifications` exports) changes — leave those as-is.

- [ ] **Step 4: Edit `index.html` meta description**

Change:
```html
    <meta
      name="description"
      content="Akshay Kurdekar — BCA student building interactive web experiences, 3D interfaces, and generative art. Open to work."
    />
```
to:
```html
    <meta
      name="description"
      content="Akshay Kurdekar — BCA student building interactive web experiences, 3D interfaces, and generative art."
    />
```

- [ ] **Step 5: Verify — build, lint, grep**

Run: `npm run build`
Expected: exit 0 — confirms nothing else imports `fifaCard` or `FifaAttribute`.

Run: `npm run lint`
Expected: exit 0.

Run (grep, should return nothing):
```bash
grep -rn "fifaCard\|FifaAttribute\|Position:" src/
```
Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Strip football vocabulary and dead fields from content

Removes fifaCard/FifaAttribute (only consumer was the now-deleted
FifaCard component), drops the literal word 'Position:' from the Hero
tag, and removes the unused/contradictory 'Open to work' status field
per RESET.md's no-football-vocabulary rule.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Palette collapse

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/About.tsx`
- Modify: `src/components/Stats.tsx`
- Modify: `src/components/ProjectCard.tsx`

**Interfaces:**
- Consumes: nothing new (Task 1 already removed the only consumer of `--glow-live`/`.match-clock`).
- Produces: the final palette token set (see Global Constraints) that every subsequent task's Tailwind classes and inline styles reference.

- [ ] **Step 1: Rewrite the `@theme` block and remove `.match-clock` in `src/index.css`**

Replace:
```css
@theme {
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, monospace;

  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-fg: #f2f0eb;
  --color-muted: #8a8a86;
  --color-border: rgba(242, 240, 235, 0.12);
  /* Site identity/structure — sampled from the FIFA card's neon edge-glow
   * (fifa-card.jpg), confirmed against the kickoff video's own glow. */
  --color-accent-primary: #04f6fc;
  /* "Happening right now" only — match clock stoppage time, IN BUILD tags,
   * the FIFA card's build-status ribbon. Never used as general chrome. */
  --color-accent-live: #ff5c35;
  /* Presence-layer secondary hue — sampled from fifa-card.jpg's own
   * background gradient (clean architectural-glass patch, top-left corner,
   * averaged over ~1.4k px, hue ~205°). The card's gradient has no
   * violet/indigo despite PALETTE.md's assumption — confirmed via direct
   * pixel sampling (OpenCV) rather than guessed. This is the real value. */
  --color-accent-secondary: #7f9bb3;
  /* Confirmation states only (email sent, form submitted) — muted green,
   * no source asset to sample, tuned by eye against the dark palette. */
  --color-accent-success: #3fae7a;
  /* Glow — soft falloff for accent-primary/accent-live chrome, replacing
   * flat-color borders/fills wherever they're meant to read as emitting
   * light rather than painted on. */
  --glow-primary: 0 0 24px color-mix(in srgb, var(--color-accent-primary) 55%, transparent);
  --glow-live: 0 0 20px color-mix(in srgb, var(--color-accent-live) 55%, transparent);
}
```
with:
```css
@theme {
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, monospace;

  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-fg: #f2f0eb;
  --color-muted: #8a8a86;
  --color-border: rgba(242, 240, 235, 0.12);
  /* The site's one accent — a real color sampled from the FIFA card art
   * back when that asset was live UI; kept as the single accent post-reset
   * (RESET.md: 2-3 colors max, near-monochrome) since it's already wired
   * through nav/links/selection/scrollbar rather than being resampled from
   * scratch for no reason. */
  --color-accent-primary: #04f6fc;
  /* Glow — soft falloff for accent-primary chrome, replacing flat-color
   * borders/fills wherever they're meant to read as emitting light rather
   * than painted on. */
  --glow-primary: 0 0 24px color-mix(in srgb, var(--color-accent-primary) 55%, transparent);
}
```

Then delete the `.match-clock` rule block entirely:
```css
/* Match clock */
.match-clock {
  transition: border-color 0.3s ease, color 0.3s ease;
}
.match-clock.is-stoppage {
  border-color: var(--color-accent-live);
  color: var(--color-fg);
}
.match-clock.is-stoppage .clock-dot {
  background: var(--color-accent-live);
  box-shadow: var(--glow-live);
}
```

- [ ] **Step 2: Fix the dead `var(--color-accent)` reference in `src/components/About.tsx`**

Change:
```tsx
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
```
to:
```tsx
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
```

- [ ] **Step 3: Fix the same dead reference in `src/components/Stats.tsx`**

Change:
```tsx
          <p className="font-mono text-4xl font-bold text-[var(--color-accent)] md:text-5xl">
```
to:
```tsx
          <p className="font-mono text-4xl font-bold text-[var(--color-accent-primary)] md:text-5xl">
```

- [ ] **Step 4: Recolor `ProjectCard.tsx`'s "In Build" status pill off the retired orange**

Change:
```tsx
function StatusPill({ status }: { status: Project['status'] }) {
  if (!status) return null
  const isLive = status === 'live'
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
        isLive
          ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
          : 'border-[var(--color-accent-live)] text-[var(--color-accent-live)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}
```
to:
```tsx
function StatusPill({ status }: { status: Project['status'] }) {
  if (!status) return null
  const isLive = status === 'live'
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
        isLive
          ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
          : 'border-[var(--color-muted)] text-[var(--color-muted)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}
```

- [ ] **Step 5: Verify — grep, build, lint, browser**

Run (should return nothing):
```bash
grep -rn "color-accent-live\|color-accent-secondary\|color-accent-success\|glow-live\|var(--color-accent)\b" src/
```
Expected: no matches (note: `var(--color-accent-primary)` should NOT match this grep — the pattern requires the exact `--color-accent)` closing, not `-primary)`).

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: Nav's active-link badge and underline still glow cyan. `About`'s education dates and `Stats`' numbers render in cyan (not the previous unstyled/inherited color — this was a live bug before this task). The Frontage project card's "In Build" pill renders in a muted gray outline, not orange. No orange/steel-blue/green anywhere on the site.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Collapse palette to 2 colors + neutrals

Removes --color-accent-live/secondary/success and --glow-live — their
only jobs (MatchClock, FIFA Card ribbon, unused confirmation states)
are all gone. Also fixes two pre-existing dead var(--color-accent)
references in About.tsx/Stats.tsx (should have been -primary all
along) and recolors ProjectCard's 'In Build' pill off the retired
orange onto the muted neutral.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Preloader — drop the kickoff-video phase

**Files:**
- Modify: `src/components/Preloader.tsx`

**Interfaces:**
- Consumes: `profile.name`, `profile.location` from `content.ts` (unchanged).
- Produces: no behavioral change to `Preloader`'s public interface (`{ onComplete: () => void }` prop stays identical) — `App.tsx` needs no changes.

- [ ] **Step 1: Rewrite `src/components/Preloader.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText } from '../lib/gsap'
import { profile } from '../data/content'

/** A one-time boot sequence — plays once per browser session, then gets out
 * of the way. Name-reveal only: the kickoff-video phase (RESET.md retires
 * kickoff-reveal.mp4/webm) is gone — this is back to the original mechanic
 * CONTENT.md specifies ("Kickoff (Preloader) — Name reveal only, unchanged
 * mechanic"). The per-char stagger below is the EFFECTS_PLAN.md "Preloader
 * — staggered name reveal" technique (ref: GSAP 101 - Staggers) applied to
 * this same reveal. */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [hidden, setHidden] = useState(false)
  const runExitRef = useRef<() => void>(() => {})

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      setHidden(true)
      onComplete()
      return
    }

    document.body.style.overflow = 'hidden'
    const split = nameRef.current
      ? new SplitText(nameRef.current, { type: 'chars' })
      : null
    if (split) gsap.set(split.chars, { yPercent: 120, opacity: 0 })

    let exitStarted = false
    function runExit() {
      if (exitStarted) return
      exitStarted = true
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          setHidden(true)
          onComplete()
        },
      })
      if (split) {
        tl.to(
          split.chars,
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'expo.out' },
          0,
        )
      }
      tl.to(rootRef.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.6')
    }
    runExitRef.current = runExit

    // Paces the boot sequence without a video to key off — long enough for
    // the stagger to read, short enough not to feel like a stall.
    const timer = window.setTimeout(runExit, 1800)

    return () => {
      split?.revert()
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (hidden) return null

  return (
    <div
      ref={rootRef}
      onClick={() => runExitRef.current()}
      className="fixed inset-0 z-200 flex cursor-pointer flex-col justify-between overflow-hidden bg-[var(--color-bg)] px-6 py-6 md:px-10 md:py-8"
    >
      <p className="relative font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
        Compiling portfolio<span className="text-[var(--color-accent-primary)]">_</span>
      </p>
      <h1
        ref={nameRef}
        className="relative text-[13vw] leading-none font-bold tracking-tight uppercase sm:text-[10vw]"
      >
        {profile.name}
      </h1>
      <div className="relative flex items-end justify-between font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
        <span>{profile.location}</span>
      </div>
      <p className="relative self-end font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        Skip →
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: hard-reload (clears `sessionStorage`'s `portfolio-visited` key, or clear it manually via devtools) — confirm the preloader shows only the compiling line, the name revealing letter-by-letter with a visible stagger, the location, and "Skip →", with no video element and no network request for `kickoff-reveal.mp4/webm`. Confirm clicking anywhere skips immediately, and it auto-advances after ~1.8s if not clicked. Confirm `prefers-reduced-motion` (emulate via the browser tool's `resize_window` colorScheme is unrelated — instead emulate via `javascript_tool` setting `matchMedia` is not directly settable; instead verify code path by reading the reduced-motion branch — the existing pattern is already proven elsewhere on this site, low risk) skips straight to the site.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Preloader: drop kickoff-video phase, back to name-reveal only

RESET.md retires kickoff-reveal.mp4/webm. Reverts to the original
mechanic CONTENT.md specifies, with a slightly slower/wider stagger so
the per-letter reveal reads as intentional (EFFECTS_PLAN.md item 1,
ref: GSAP 101 - Staggers).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Hero — procedural football replaces CrystalShards

**Files:**
- Create: `src/components/Football.tsx`
- Delete: `src/components/CrystalShards.tsx`
- Modify: `src/components/HeroScene.tsx`

**Interfaces:**
- Produces: `Football({ radius?: number, spin?: number })` — a self-contained R3F component (imports its own `useFrame`, manages its own rotation), no external state needed. Mounts as a plain `<Football />` inside any `<Canvas>`.

- [ ] **Step 1: Create `src/components/Football.tsx`**

```tsx
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
```

- [ ] **Step 2: Delete `src/components/CrystalShards.tsx`**

```bash
rm "src/components/CrystalShards.tsx"
```

- [ ] **Step 3: Wire `Football` into `src/components/HeroScene.tsx`**

Change the import:
```tsx
import { CrystalShards } from './CrystalShards'
```
to:
```tsx
import { Football } from './Football'
```

Change the render:
```tsx
  return (
    <group ref={groupRef}>
      <CrystalShards count={lowQuality ? 8 : 16} spread={3.6} scale={1.2} />
    </group>
  )
```
to:
```tsx
  return (
    <group ref={groupRef}>
      <Football radius={1.4} spin={0.12} />
    </group>
  )
```

Also update the second point light's color off the retired secondary-accent hex, to keep the scene strictly on the 2-color palette:
```tsx
        <pointLight position={[-2, -1, -2]} intensity={0.5} color="#7f9bb3" />
```
to:
```tsx
        <pointLight position={[-2, -1, -2]} intensity={0.5} color="#f2f0eb" />
```

- [ ] **Step 4: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0 (confirms nothing else imports `CrystalShards`).
Run: `npm run lint` — expected exit 0.

Browser check: load the Hero section, confirm a faceted light/dark football renders behind the headline, rotates slowly on its own, tilts toward the cursor, and doesn't clip through the headline text or the Magnet-hover portrait photo. Zoom in (via the `zoom` action) to confirm the panel pattern reads as alternating light/dark triangular facets, not a flat single-color sphere. Confirm no console errors and the WebGL feature-detection fallback (`FrameSequence`) path is untouched (code review only — not independently re-verifiable without disabling WebGL).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Hero: replace crystal shards with a procedural football

RESET.md's single 3D wow moment — 'a ball, a boot, or something
similarly recognizable.' Built as a subdivided icosahedron with vertex
colors drawn from the site's own 2-color palette, no GLB/texture
pipeline needed. Also recolors HeroScene's second point light off the
retired steel-blue secondary accent.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Projects — click-to-cycle card stack (Flip)

**Files:**
- Modify: `src/lib/gsap.ts`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/Projects.tsx`

**Interfaces:**
- Consumes: `projects` array from `content.ts` (3 entries, unchanged), existing `ProjectCard({ project, active })`.
- Produces: `Flip` re-exported from `src/lib/gsap.ts` — every later task that needs a GSAP plugin (Task 7 onward) imports from this same module.
- `ProjectCard`'s prop signature narrows from `{ project, active, parallaxY? }` to `{ project, active }` — the old sticky-stack parallax mechanism is gone with the sticky stack itself.

- [ ] **Step 1: Register `Flip` in `src/lib/gsap.ts`**

Change:
```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }
```
to:
```ts
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)

export { Flip, gsap, ScrollTrigger, SplitText }
```

- [ ] **Step 2: Simplify `src/components/ProjectCard.tsx`** — drop the dead `parallaxY` parallax mechanism (only used by the sticky stack this task removes)

Replace the whole file:
```tsx
import { ArrowUpRight } from 'lucide-react'
import type { MouseEvent } from 'react'
import { GenerativeArt } from './GenerativeArt'
import { LoanFlowVisual } from './LoanFlowVisual'
import { Magnetic } from './Magnetic'
import { WireframeVisual } from './WireframeVisual'
import type { Project } from '../data/content'

function handleSpotlight(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty(
    '--mx',
    `${((e.clientX - rect.left) / rect.width) * 100}%`,
  )
  e.currentTarget.style.setProperty(
    '--my',
    `${((e.clientY - rect.top) / rect.height) * 100}%`,
  )
}

function StatusPill({ status }: { status: Project['status'] }) {
  if (!status) return null
  const isLive = status === 'live'
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
        isLive
          ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
          : 'border-[var(--color-muted)] text-[var(--color-muted)]'
      }`}
    >
      {isLive ? 'Live' : 'In Build'}
    </span>
  )
}

export function ProjectCard({
  project,
  active,
}: {
  project: Project
  active: boolean
}) {
  const ctaHref = project.live ?? project.github
  const ctaLabel = project.live ? 'View Live' : 'View Code'

  return (
    <div
      onMouseMove={handleSpotlight}
      className="project-spotlight flex h-[75vh] max-h-[720px] w-full flex-col gap-6 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:rounded-[48px] md:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="font-mono text-2xl text-[var(--color-muted)] md:text-3xl">
            {project.index}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
                {project.category}
              </p>
              <StatusPill status={project.status} />
            </div>
            <h3 className="mt-1 text-xl font-bold uppercase tracking-tight md:text-2xl">
              {project.name}
            </h3>
          </div>
        </div>
        {ctaHref && (
          <Magnetic strength={14}>
            <a
              href={ctaHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-[var(--color-fg)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]"
            >
              {ctaLabel}
              <ArrowUpRight size={14} />
            </a>
          </Magnetic>
        )}
      </div>

      <div className="relative min-h-[140px] flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        {project.visual === 'generative-art' && (
          <GenerativeArt active={active} className="h-full w-full" />
        )}
        {project.visual === 'wireframe' && (
          <WireframeVisual active={active} className="h-full w-full" />
        )}
        {project.visual === 'loan-flow' && (
          <LoanFlowVisual active={active} className="h-full w-full" />
        )}
        {!project.visual && <div className="project-card-bg h-full w-full" />}
      </div>

      <p className="line-clamp-2 max-w-2xl text-[var(--color-muted)] md:text-lg">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `src/components/Projects.tsx`** — replace the sticky-stack with a Flip-based click-to-cycle deck (ref: [Flip Cards](https://codepen.io/GreenSock/pen/Yzdzxem))

```tsx
import { ArrowUpRight } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'
import { ProjectCard } from './ProjectCard'
import { WordReveal } from './WordReveal'
import { Flip, gsap } from '../lib/gsap'
import { moreWork, projects } from '../data/content'

/** Highlights — a click-to-cycle card stack (EFFECTS_PLAN.md, ref: GSAP's
 * "Flip Cards" demo). Click (or press Enter/Space) anywhere on the deck to
 * send the front card to the back; Flip animates every card's position in
 * one pass, with the demo's own onEnter/onLeave treatment for the card
 * arriving at the front and the one leaving it. */
function CardStack() {
  const [order, setOrder] = useState(() => projects.map((p) => p.name))
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const pendingFlipState = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const isFirstRender = useRef(true)

  function cycle() {
    pendingFlipState.current = Flip.getState(Array.from(cardRefs.current.values()))
    setOrder((prev) => [...prev.slice(1), prev[0]])
  }

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const state = pendingFlipState.current
    if (!state) return
    pendingFlipState.current = null

    Flip.from(state, {
      targets: Array.from(cardRefs.current.values()),
      duration: 0.6,
      ease: 'sine.inOut',
      absolute: true,
      onEnter: (elements) =>
        gsap.from(elements, { duration: 0.4, yPercent: 8, opacity: 0, ease: 'expo.out' }),
      onLeave: (elements) =>
        gsap.to(elements, { duration: 0.4, opacity: 0, ease: 'expo.out' }),
    })
  }, [order])

  return (
    <div
      onClick={cycle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          cycle()
        }
      }}
      aria-label="Cycle through highlighted projects"
      className="relative mx-auto h-[75vh] max-h-[720px] w-full max-w-4xl cursor-pointer"
    >
      {order.map((name, depth) => {
        const project = projects.find((p) => p.name === name)!
        return (
          <div
            key={name}
            ref={(el) => {
              if (el) cardRefs.current.set(name, el)
              else cardRefs.current.delete(name)
            }}
            className="absolute inset-0"
            style={{
              zIndex: order.length - depth,
              transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.03})`,
            }}
          >
            <ProjectCard project={project} active={depth === 0} />
          </div>
        )
      })}
    </div>
  )
}

export function Projects() {
  return (
    <>
      <section id="highlights" className="px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">Highlights</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Click the stack to cycle →
          </p>
        </FadeIn>
      </section>

      <div id="projects" className="px-6 pb-24 md:px-10 md:pb-32">
        <CardStack />
      </div>

      <MoreWork />
    </>
  )
}

/** Not part of the stack above — a sibling section in normal flow right
 * after it ends. */
function MoreWork() {
  return (
    <div className="px-6 py-16 md:px-10 md:py-24">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)]">
          More work
        </p>
      </FadeIn>
      <div className="mx-auto mt-6 max-w-4xl divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {moreWork.map((item, i) => {
          const ctaHref = item.live ?? item.github
          return (
            <FadeIn key={item.name} delay={i * 0.08}>
              <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold tracking-tight uppercase">{item.name}</h3>
                  <WordReveal className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
                    {item.description}
                  </WordReveal>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                {ctaHref && (
                  <Magnetic strength={14} className="shrink-0">
                    <a
                      href={ctaHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border-2 border-[var(--color-fg)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]"
                    >
                      {item.live ? 'View Live' : 'View Code'}
                      <ArrowUpRight size={14} />
                    </a>
                  </Magnetic>
                )}
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: scroll to Highlights. Confirm 3 cards visible in a slightly offset stack (peeking edges behind the front card). Click the stack: confirm the front card animates out (fades/slides) while the next card animates to the front position, and the stack visually re-orders (via `computer` click + screenshot before/after). Confirm the front card's "View Live"/"View Code" link is clickable without triggering the cycle (note: the link is nested inside the click handler's bounding box — if clicking the link also triggers `cycle()`, that's an acceptable known behavior given the demo's own "click anywhere" mechanic, not a bug to fix in this task). Press Tab to focus the deck, press Enter — confirm it cycles the same way. Confirm no console errors from `Flip`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Projects: click-to-cycle card stack via GSAP Flip

Replaces the Framer Motion sticky-stack with the technique from the
actual reference demo (ref: Flip Cards) — click anywhere to send the
front card to the back, Flip animates the whole deck's reposition in
one pass. Simplifies ProjectCard by dropping the now-dead parallaxY
prop that only the old sticky stack used.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Footer velocity-bounce

**Files:**
- Create: `src/components/FooterWave.tsx`
- Modify: `src/components/Contact.tsx`

**Interfaces:**
- Consumes: `ScrollTrigger`, `gsap` from `src/lib/gsap.ts` (no new plugin registration needed — velocity comes from `ScrollTrigger`'s own `self.getVelocity()`, and the wave is animated via plain `gsap.to`, not `MorphSVGPlugin`, to keep this task's plugin surface minimal; MorphSVGPlugin gets registered in Task 8, its first real consumer).
- Produces: `FooterWave()` — a self-contained component, no props, renders an absolutely-positioned `<svg>` meant to sit at the top edge of a `position: relative` ancestor.

- [ ] **Step 1: Create `src/components/FooterWave.tsx`**

```tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

// Two states for the footer panel's top edge — flat, and a gentle upward
// bulge — animated between via plain coordinate tweening (not MorphSVG,
// which Task 8 introduces for the text-morph beat) based on how fast the
// visitor was scrolling when the footer entered view (EFFECTS_PLAN.md, ref:
// "Footer Bounce Based on Scroll Speed").
const FLAT_Y = 40
const BULGE_Y = -10

export function FooterWave() {
  const pathRef = useRef<SVGPathElement>(null)
  const rootRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const path = pathRef.current
      const root = rootRef.current
      if (!path || !root) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      const state = { y: FLAT_Y }
      function render() {
        path!.setAttribute(
          'd',
          `M0,${FLAT_Y} C 300,${state.y} 900,${state.y} 1200,${FLAT_Y} L1200,120 L0,120 Z`,
        )
      }
      render()

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        onEnter: (self) => {
          const velocity = Math.abs(self.getVelocity())
          const intensity = Math.min(1, velocity / 1200)
          gsap
            .timeline()
            .to(state, {
              y: BULGE_Y,
              duration: 0.3 + intensity * 0.2,
              ease: 'power2.out',
              onUpdate: render,
            })
            .to(state, {
              y: FLAT_Y,
              duration: 0.5,
              ease: 'elastic.out(1, 0.4)',
              onUpdate: render,
            })
        },
      })

      return () => trigger.kill()
    },
    { scope: rootRef },
  )

  return (
    <svg
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute -top-[1px] left-0 w-full"
      height="40"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path ref={pathRef} fill="var(--color-surface)" />
    </svg>
  )
}
```

- [ ] **Step 2: Wire it into `src/components/Contact.tsx`**

Add the import:
```tsx
import { FooterWave } from './FooterWave'
```

Add `<FooterWave />` as the first child inside `<section id="contact" className="relative px-6 py-24 md:px-10 md:py-32">`, right before the existing `<div className="relative mx-auto max-w-3xl text-center">`.

- [ ] **Step 3: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: scroll toward Contact at a fast, deliberate pace — confirm the SVG wave at the top edge of the section bulges upward briefly then settles back flat (screenshot before/during/after). Scroll to it slowly — confirm a subtler bulge. Confirm it fires once per entry into the section (re-scrolling past it re-triggers `onEnter`, which is the intended repeatable behavior — not a one-shot).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Contact: footer velocity-reactive bounce

EFFECTS_PLAN.md, ref: Footer Bounce Based on Scroll Speed — the
footer's top edge bulges on entry, intensity scaled to
ScrollTrigger's own getVelocity() reading at that moment.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Footer text morph — "See Ya."

**Files:**
- Modify: `src/lib/gsap.ts`
- Create: `src/components/FooterMorph.tsx`
- Modify: `src/components/Contact.tsx`

**Interfaces:**
- Produces: `MorphSVGPlugin` re-exported from `src/lib/gsap.ts` (registered here, its first consumer). `FooterMorph()` — self-contained, no props.

- [ ] **Step 1: Register `MorphSVGPlugin` in `src/lib/gsap.ts`**

Change:
```ts
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)

export { Flip, gsap, ScrollTrigger, SplitText }
```
to:
```ts
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MorphSVGPlugin)

export { Flip, gsap, MorphSVGPlugin, ScrollTrigger, SplitText }
```

- [ ] **Step 2: Create `src/components/FooterMorph.tsx`**

```tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, MorphSVGPlugin, ScrollTrigger, SplitText } from '../lib/gsap'

// A one-time farewell beat (EFFECTS_PLAN.md, ref: MorphSVG convertToPath())
// — an abstract shape (never football-shaped: RESET.md reserves the ball
// silhouette for the single Hero object only) resolves from a circle into a
// soft blob, synced with a word reveal of "See Ya." The reference demo
// morphs between abstract shapes, not text — MorphSVG has no font-outline
// pipeline to derive glyph paths from a string, so the words arrive via the
// same SplitText mechanism already proven elsewhere on this site (Hero,
// WordReveal) instead of faking a text-morph MorphSVG can't actually do.
const BLOB_PATH =
  'M50,10 C75,10 90,35 85,55 C80,80 55,90 40,80 C20,68 10,45 20,25 C27,12 38,10 50,10 Z'

export function FooterMorph() {
  const rootRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const wordsRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const circle = circleRef.current
      const words = wordsRef.current
      if (!circle || !words) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      MorphSVGPlugin.convertToPath(circle)
      const split = new SplitText(words, { type: 'words' })
      gsap.set(split.words, { opacity: 0, yPercent: 40 })

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'bottom bottom',
        once: true,
        onEnter: () => {
          gsap
            .timeline()
            .to(circle, { morphSVG: { shape: BLOB_PATH }, duration: 1, ease: 'power2.inOut' })
            .to(
              split.words,
              { opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' },
              '-=0.5',
            )
        },
      })

      return () => {
        trigger.kill()
        split.revert()
      }
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="mt-16 flex flex-col items-center gap-4">
      <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r="40"
          fill="var(--color-accent-primary)"
          opacity="0.5"
        />
      </svg>
      <p
        ref={wordsRef}
        className="font-mono text-sm uppercase tracking-widest text-[var(--color-muted)]"
      >
        See Ya.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Wire it into `src/components/Contact.tsx`**

Add the import:
```tsx
import { FooterMorph } from './FooterMorph'
```

Add `<FooterMorph />` right after the closing `</div>` of the GitHub/LinkedIn icon row (i.e. after the `<div className="mt-8 flex items-center justify-center gap-6">...</div>` block), before the closing `</div>` of the `max-w-3xl` wrapper.

- [ ] **Step 4: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: scroll all the way to the bottom of the page. Confirm the small circle morphs into an irregular blob shape and "See Ya." fades in word-by-word (screenshot before/after crossing the trigger point). Scroll back up and down again past the same point — confirm it does NOT replay (`once: true`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Contact: one-time farewell shape-morph + 'See Ya.'

EFFECTS_PLAN.md, ref: MorphSVG convertToPath(). Registers
MorphSVGPlugin (first real consumer). Circle morphs into an abstract
blob (never football-shaped, per RESET.md) synced with a SplitText
word reveal, once per visit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Horizontal Text for About's opening line

**Files:**
- Create: `src/components/HorizontalText.tsx`
- Modify: `src/components/About.tsx`

**Interfaces:**
- Produces: `HorizontalText({ text: string })`.
- Consumes: `profile.tagline` ("I build things that move on scroll.") from `content.ts` — already exists, currently unused anywhere in the render tree.

- [ ] **Step 1: Create `src/components/HorizontalText.tsx`**

```tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap'

/** Pinned horizontal-scroll line (EFFECTS_PLAN.md, ref: "ContainerAnimation
 * SplitText"). Its own home, not the site's wow moment — that's the Hero
 * football per RESET.md. Text tracks leftward as the visitor scrolls
 * vertically past this section, pinned for the scroll distance it needs to
 * fully pass. */
export function HorizontalText({ text }: { text: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const el = textRef.current
      if (!wrapper || !el) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return

      SplitText.create(el, { type: 'chars, words' })

      const scrollDistance = Math.max(0, el.scrollWidth - wrapper.clientWidth)
      const tween = gsap.to(el, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${scrollDistance + window.innerHeight}`,
          scrub: true,
          pin: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { scope: wrapperRef },
  )

  return (
    <div ref={wrapperRef} className="overflow-hidden py-12">
      <h3
        ref={textRef}
        className="flex w-max items-center whitespace-nowrap pl-6 text-3xl font-medium tracking-tight md:pl-10 md:text-5xl"
      >
        {text}
      </h3>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `src/components/About.tsx`**

Replace:
```tsx
import { FadeIn } from './FadeIn'
import { Stats } from './Stats'
import { about, education } from '../data/content'

export function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            About
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-8 text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {about.paragraph}
          </p>
        </FadeIn>
```
with:
```tsx
import { FadeIn } from './FadeIn'
import { HorizontalText } from './HorizontalText'
import { Stats } from './Stats'
import { about, education, profile } from '../data/content'

export function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <FadeIn>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            About
          </h2>
        </FadeIn>
      </div>

      <HorizontalText text={profile.tagline} />

      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <FadeIn delay={0.1}>
          <p className="text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {about.paragraph}
          </p>
        </FadeIn>
```

(The section's own `px-6 py-24 md:px-10 md:py-32` padding moves onto the two inner `max-w-3xl` wrappers, and `HorizontalText` sits between them full-width, so its pinned scroll track isn't constrained by the section's horizontal padding.)

The rest of `About.tsx` (education grid, `<Stats />`, closing tags) stays exactly as it was — only the opening `<FadeIn>` block and its wrapping `<div>` change, per the diff above.

- [ ] **Step 3: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: scroll to the About section. Confirm the page pins briefly while "I build things that move on scroll." tracks leftward across the viewport as you scroll, then releases and the bio paragraph/education/stats continue in normal flow below it. Confirm it doesn't pin for an excessively long scroll distance (the `end` is `scrollDistance + one viewport height` — should feel proportionate to a single short line of text, not multiple screens).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "About: pinned horizontal-scroll line for the tagline

EFFECTS_PLAN.md, ref: ContainerAnimation SplitText. Surfaces
profile.tagline ('I build things that move on scroll.'), previously
defined in content.ts but never rendered anywhere.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Image reveal on scroll for the About photo

**Files:**
- Create: `src/components/ImageReveal.tsx`
- Modify: `src/components/About.tsx`

**Interfaces:**
- Produces: `ImageReveal({ src: string, alt: string })`.
- Consumes: `/akshay-photo.jpg` (already in `public/`, already used by `Hero.tsx`'s Magnet-hover portrait — reused here, not a new asset).

- [ ] **Step 1: Create `src/components/ImageReveal.tsx`**

```tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/** Scroll-pinned reveal for the About photo (EFFECTS_PLAN.md, ref: "Image
 * comparison on scroll" — that demo wipes between two images; this site has
 * no before/after pair, so it's adapted to a single-image reveal: a solid
 * panel wipes away as the visitor scrolls past, using the same
 * scroll-scrubbed mechanic rather than the two-image comparison itself). */
export function ImageReveal({ src, alt }: { src: string; alt: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const panel = panelRef.current
      if (!section || !panel) return
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) {
        gsap.set(panel, { scaleX: 0 })
        return
      }

      const tween = gsap.fromTo(
        panel,
        { scaleX: 1 },
        {
          scaleX: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 25%',
            scrub: true,
          },
        },
      )

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { scope: sectionRef },
  )

  return (
    <div
      ref={sectionRef}
      className="relative mt-16 overflow-hidden rounded-2xl border border-[var(--color-border)]"
    >
      <img src={src} alt={alt} className="block w-full object-cover" />
      <div
        ref={panelRef}
        style={{ transformOrigin: 'right center' }}
        className="absolute inset-0 bg-[var(--color-surface)]"
      />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `src/components/About.tsx`**

Add the import:
```tsx
import { ImageReveal } from './ImageReveal'
```

Add `<ImageReveal src="/akshay-photo.jpg" alt="Akshay Kurdekar" />` immediately after the closing `</FadeIn>` of the bio paragraph (the one wrapping `{about.paragraph}`), before the education grid `<div className="mt-16 grid gap-8 ...">`.

- [ ] **Step 3: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: scroll to the About section's photo. Confirm a solid panel covers the image, and wipes away right-to-left as you scroll past it, ending fully revealed (screenshot at start/mid/end of the scroll range). Scroll back up — confirm it wipes back closed (it's `scrub: true`, not `once`, so it tracks scroll position both directions — intended, matches the reference demo's own pin+scrub behavior).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "About: scroll-scrubbed image reveal for the photo

EFFECTS_PLAN.md, ref: Image comparison on scroll — adapted from a
two-image before/after wipe (no such pair exists on this site) to a
single-image reveal using the same pin+scrub mechanic. Reuses the
existing akshay-photo.jpg, no new asset.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Experimental — Canvas Particles

**Files:**
- Create: `src/components/CanvasParticles.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `CanvasParticles()` — self-contained, no props, renders a fixed full-viewport `<canvas>`.

- [ ] **Step 1: Create `src/components/CanvasParticles.tsx`**

```tsx
import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 60
const COLOR = '4, 246, 252' // --color-accent-primary as an rgb triplet, for canvas rgba()

/** Ambient particle field (EFFECTS_PLAN.md experimental trio, ref: "Canvas
 * particles"), recolored from the demo's rainbow defaults to the site's
 * single cyan accent at low opacity — a quiet atmosphere layer rather than
 * a competing visual. Trial basis per EFFECTS_PLAN.md — first to cut if a
 * trim pass finds it reads as excess (see Task 13). Off under reduced
 * motion. */
export function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let cw = (canvas.width = window.innerWidth)
    let ch = (canvas.height = window.innerHeight)

    type Particle = { x: number; y: number; vx: number; vy: number; r: number }
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 0.6 + Math.random() * 1.4,
    }))

    function handleResize() {
      cw = canvas!.width = window.innerWidth
      ch = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    let raf = 0
    function tick() {
      ctx!.clearRect(0, 0, cw, ch)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = cw
        if (p.x > cw) p.x = 0
        if (p.y < 0) p.y = ch
        if (p.y > ch) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${COLOR}, 0.35)`
        ctx!.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  )
}
```

- [ ] **Step 2: Mount it in `src/App.tsx`**

Add the import:
```tsx
import { CanvasParticles } from './components/CanvasParticles'
```

Add `<CanvasParticles />` right after `<div className="grain-overlay" />`.

- [ ] **Step 3: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: confirm faint cyan dots drift slowly across the whole page, visible but subtle (not competing with Hero's football or any section's text — take a full-page screenshot and judge legibility). Resize the browser window — confirm the canvas resizes without stretching/distorting existing particles' apparent density. Confirm `z-0` keeps it behind all real content (nothing clickable is obscured).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add experimental canvas particle field

EFFECTS_PLAN.md experimental trio, ref: Canvas particles — recolored
to the site's single cyan accent instead of the demo's rainbow
defaults. Trial basis; Task 13 judges whether it earns its place.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Experimental — Cursor Trail

**Files:**
- Create: `src/components/CursorTrail.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `CursorTrail()` — self-contained, no props.
- Consumes: `gsap` from `src/lib/gsap.ts`.

- [ ] **Step 1: Create `src/components/CursorTrail.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

const COLORS = ['var(--color-accent-primary)', 'var(--color-fg)']
const TRAIL_LENGTH = 8
const MIN_SPAWN_INTERVAL_MS = 40

/** Cursor trail (EFFECTS_PLAN.md experimental trio, ref: "flair cursor
 * follower"). The reference demo scatters raster PNG images sampled from
 * its own multi-hue asset set — recolored here to plain CSS-drawn dots in
 * the site's 2-color palette instead of hotlinking/importing the demo's own
 * art, keeping the same GSAP mechanic (elastic pop-in, random rotation,
 * fade-out). Trial basis per EFFECTS_PLAN.md — first to cut alongside
 * CanvasParticles if it clashes with the existing CustomCursor dot+ring
 * (see Task 13). Off under reduced motion / coarse pointers, same
 * convention as CustomCursor. */
export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (prefersReducedMotion || isCoarsePointer) return

    const container = containerRef.current
    if (!container) return

    const pool: HTMLDivElement[] = []
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const dot = document.createElement('div')
      dot.style.position = 'fixed'
      dot.style.top = '0'
      dot.style.left = '0'
      dot.style.width = '10px'
      dot.style.height = '10px'
      dot.style.borderRadius = '50%'
      dot.style.pointerEvents = 'none'
      dot.style.opacity = '0'
      dot.style.zIndex = '95'
      dot.style.background = COLORS[i % COLORS.length]
      container.appendChild(dot)
      pool.push(dot)
    }

    let nextIndex = 0
    let lastSpawn = 0
    function handleMove(e: PointerEvent) {
      const now = performance.now()
      if (now - lastSpawn < MIN_SPAWN_INTERVAL_MS) return
      lastSpawn = now

      const dot = pool[nextIndex]
      nextIndex = (nextIndex + 1) % pool.length

      gsap.killTweensOf(dot)
      gsap.set(dot, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 })
      gsap
        .timeline()
        .fromTo(
          dot,
          { opacity: 0, scale: 0 },
          { opacity: 0.85, scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' },
        )
        .to(dot, {
          opacity: 0,
          scale: 0.4,
          rotation: 'random(-180, 180)',
          duration: 0.5,
          ease: 'power2.in',
        })
    }

    window.addEventListener('pointermove', handleMove)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      pool.forEach((dot) => dot.remove())
    }
  }, [])

  return <div ref={containerRef} aria-hidden="true" />
}
```

- [ ] **Step 2: Mount it in `src/App.tsx`**, next to `CustomCursor`

Add the import:
```tsx
import { CursorTrail } from './components/CursorTrail'
```

Add `<CursorTrail />` immediately after `<CustomCursor />`.

- [ ] **Step 3: Verify — build, lint, browser**

Run: `npm run build` — expected exit 0.
Run: `npm run lint` — expected exit 0.

Browser check: move the pointer across the page (via repeated `computer` mouse moves) — confirm small cyan/off-white dots spawn along the path, pop in, rotate, and fade out, without a full-page screenshot flagged as cluttered. Specifically judge whether this reads as visually redundant with `CustomCursor`'s existing dot+ring (both are cursor-reactive at once) — this judgment call is finalized in Task 13, not here; this task only needs the component working correctly in isolation.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add experimental cursor trail

EFFECTS_PLAN.md experimental trio, ref: flair cursor follower —
recolored to plain CSS dots in the site's 2-color palette instead of
the demo's own raster art. Trial basis; Task 13 judges whether it
clashes with the existing CustomCursor dot+ring.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Full visual QA pass — trim experimental effects, final check

**Files:**
- Modify: `src/App.tsx` (only if Step 1's judgment calls remove an experimental mount)

**Interfaces:**
- Consumes: everything built in Tasks 1–12.
- Produces: a fully verified, working site — the deliverable this whole plan builds toward.

- [ ] **Step 1: Judge the experimental trio against EFFECTS_PLAN.md's own trim order**

Load the site fresh in the browser preview tool. With `CursorTrail`, `CanvasParticles`, and `ImageReveal` all live simultaneously:
- Does `CursorTrail` read as redundant/cluttered layered on top of `CustomCursor`'s existing dot+ring? If yes, remove the `<CursorTrail />` mount line (and its import) from `App.tsx` — leave `CursorTrail.tsx` on disk (matches this codebase's established convention of leaving superseded code in place, per `PUNCH_LIST.md`'s note on orphaned `About`/`Skills`/`Stats`).
- Does `CanvasParticles` compete visually with the Hero football or any section's readability? If yes, remove its mount line the same way.
- `ImageReveal` (Task 10) is explicitly last to cut per EFFECTS_PLAN.md's stated trim order ("doing actual work rather than just adding motion") — keep it regardless of the other two's outcome.

This is a real visual judgment call, not a mechanical check — screenshot the site with and without each experimental effect (toggle the mount line, rebuild, screenshot, compare) before deciding.

- [ ] **Step 2: Full build + lint**

Run: `npm run build`
Expected: exit 0, no TypeScript errors, no unused-import errors from anything removed in Step 1.

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Full section-by-section browser walkthrough, desktop**

Using the browser preview tool at default desktop size, scroll top to bottom. For each section confirm:
- **Preloader** (clear `sessionStorage` first): name-only reveal, staggers in, no video, auto-advances, click-to-skip works.
- **Hero**: football renders, rotates, tilts with cursor; headline/sub-line/tag/meta-line render with no "Position:" wording; Magnet-hover photo still works.
- **Marquee**: two rows drift, items glow crossing viewport-center (already-built effect, first live confirmation this pass).
- **About**: horizontal-scroll tagline pins and tracks, bio paragraph renders, image reveal wipes on scroll, education grid and animated stat counters render correctly, no `--color-accent` (undefined-token) visual glitches.
- **Skills**: renders as before (untouched this plan, verify no regression from being newly mounted).
- **Experience**: renders as before (untouched this plan).
- **Highlights/Projects**: card stack cycles on click and on Enter/Space, "In Build" pill reads muted gray not orange.
- **More work**: unaffected, still renders both items with word-reveal.
- **Contact**: footer wave bounces on fast scroll-in, mailto confirm-pulse still works, "See Ya." morph+reveal fires once at the bottom.

- [ ] **Step 4: Reduced-motion check**

Emulate `prefers-reduced-motion: reduce` (via `resize_window`'s `colorScheme` param does NOT cover this — instead, use `javascript_tool` to read `matchMedia('(prefers-reduced-motion: reduce)').matches` is read-only in a real browser; verify by code review that every new component from Tasks 4–12 has the guard clause, since browser-level emulation of this specific media feature isn't available through this session's tooling — cross-reference each file against the Global Constraints rule).

- [ ] **Step 5: Mobile check**

`resize_window` to the `mobile` preset. Confirm: Hero's football scene still renders (or falls back cleanly), the horizontal-scroll tagline in About doesn't produce broken/overflowing layout, the card stack remains tappable, nothing overflows horizontally (no unexpected `overflow-x` scrollbar on `body`).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "Final QA pass: trim experimental effects, verify full site

Judges CursorTrail and CanvasParticles against EFFECTS_PLAN.md's own
trim order after seeing them live alongside everything else; keeps or
removes each based on that visual check. Full desktop/mobile/
reduced-motion walkthrough of every section.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Still open after this plan (not resolved silently)

- **Real screenshots for Dekho/Frontage Highlights cards** — still the `.project-card-bg` gradient placeholder. The user is sourcing these separately; swap into `content.ts`'s `projects` entries (`visual` field) once supplied.

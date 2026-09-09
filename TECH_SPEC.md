# Technical Implementation Spec — adapted from reference video/prompt
This translates the mechanics from the "Jack — 3D Creator" reference into your actual content system (DESIGN_BRIEF.md / CONTENT.md / MOTION.md). Do not hand the original prompt to Claude Code as-is — see "What not to carry over" below.

**Key finding:** the reference hero is a static image + mouse-tracking transform, not real-time 3D rendering. No WebGL/Three.js/R3F anywhere in the actual spec. This is fully compatible with your existing Canvas 2D–only stack — no need to revisit the R3F decision you already made once.

---

## Component-by-component translation

### 1. FadeIn wrapper — keep as-is
Generic Framer Motion viewport-triggered entrance wrapper (configurable delay/x/y/duration, easing `[0.25, 0.1, 0.25, 1]`). This is a standard utility pattern, not tied to the reference's content — reuse the implementation approach directly.

### 2. Magnet (magnetic hover) → Starting XI hero portrait
Mouse-tracking transform: element translates toward the cursor when the cursor is within a padding radius of it, smooth ease-out while active, ease-in-out on release.

**Apply to:** your actual photo, positioned centered in the Hero, replacing the generic 3D cartoon head. A real photo with this hover treatment is more distinctive for your case than a stock 3D avatar would be anyway — it's unmistakably you, not a purchased asset.

**Asset needed:** a real, high-res photo of yourself — plain or dark background preferred so it isolates cleanly against a dark hero section.

Optional: apply a lighter version of the same effect to the FIFA Card on hover (a subtle pull-toward-cursor before the flip triggers).

### 3. AnimatedText (char/word scroll-reveal) → FIFA Card bio / Highlights copy
Opacity per character/word increases as the user scrolls past that point in the text (Framer Motion `useScroll` targeting the paragraph, offset `['start 0.8', 'end 0.2']`).

This is the literal implementation of the "patient" pacing rule already defined in `MOTION.md` — use `ease.patient` / `duration.base` from your motion tokens here rather than the reference's raw values.

**Apply to:** the FIFA Card bio text, and/or each Highlights project description.

### 4. StackingCards (sticky + scale-down via `useScroll`/`useTransform`) → Highlights
Cards pin in place and scale down slightly (`1 - (totalCards - 1 - index) * 0.03`) as the next card scrolls over them, each offset by a small top increment so the stack fans out.

**Recommendation:** use this instead of the horizontal-scroll-pin originally planned for Highlights — it reads more like an actual highlights reel (clips stacking one after another) and keeps you on one animation library (Framer Motion) for this interaction instead of introducing GSAP ScrollTrigger pinning for the same job.

**Card content per your existing Highlights copy:**
- Number badge (01/02/03) + status pill ("LIVE" for Dekho, "IN BUILD" for Frontage, plain for the 3D site) instead of "LIVE PROJECT" for all three
- Project name + one-line category (Co-founder / Buildathon / Prototype)
- Image grid — see assets needed below

**Assets needed:** real screenshots — Dekho (Wealth section, Monthly Wrap, or whatever's most presentable), Frontage (even mid-build UI is fine and honest, given the card already says "in build"), and the Philips-inspired 3D site. Not stock photography.

### 5. Marquee (dual-row, scroll-linked horizontal drift) → Matchday Ticker
Two rows of tiles drifting in opposite directions, speed tied to scroll offset (`(scrollY - sectionTop + innerHeight) * 0.3`), tripled content for seamless looping.

**Keep it text/wordmark-based** (`React · FastAPI · TypeScript · GSAP · Python · PostgreSQL · Claude Agent SDK` from CONTENT.md) rather than image tiles — this sidesteps the third-party-asset problem entirely and matches what's already speced. The scroll-linked-drift *mechanic* is worth keeping; the GIF-grid *content* is not.

### 6. Alternating black/white full-bleed rounded panels — page rhythm
Suggested section → color assignment:

| Section | Panel color | Note |
|---|---|---|
| Kickoff / Starting XI | Black | |
| FIFA Card | Black | Your "spend the boldness" moment — dark card face reads strongest here |
| Playing Style (prose elaboration of the 6 stats) | White | See #7 below |
| Appearances | White or black | Either works; pick whichever creates better contrast against Playing Style |
| Highlights | Black | |
| Full-time | Black | |

### 7. Numbered list-with-dividers (reference's "Services" section) → Playing Style
Big numeral (01→06) on the left, name + description stacked on the right, thin dividers between rows, staggered FadeIn per item (`delay: i * 0.1`).

**Apply to:** a prose elaboration of your six FIFA Card attributes on a white panel — e.g. "01 — Passing: JTBD interviews, cross-functional work at Dekho." This reuses the mechanic with entirely different content, so there's no overlap with the reference's actual copy.

---

## What NOT to carry over
- Any of the reference's image URLs (`figma.site`, `motionsites.ai`, `higgs.ai`/CloudFront links) — third-party hosted, not yours to use, and fragile even setting that aside.
- Any of its copy — "Hi, I'm Jack," the five service descriptions, "Nextlevel Studio" / "Aura Brand Identity" / "Solaris Digital" — all real content belonging to that build. Your copy lives in `CONTENT.md`.
- Kanit as an unexamined default. It's an open Google Font, fine to use — but choose it because it suits your headline treatment, not because it's what the reference used.

## What to gather before handing this to Claude Code
- A real, high-res photo of yourself for the Magnet-hover hero treatment
- Real screenshots: Dekho, Frontage (mid-build is fine), the Philips-inspired 3D site
- Final tuned FIFA Card stat numbers (starting values are in `CONTENT.md`)

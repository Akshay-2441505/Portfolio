# Punch List — everything outstanding, one pass
Consolidates gaps from `STATUS2.md` (self-audit), direct visual review of the live screenshots, the two mechanics confirmed never rebuilt from `TECH_SPEC.md`, and the now-delivered Kickoff video. Ordered by priority. Each item names its source doc for full detail — this file is the checklist, not the spec.

**Updated:** Kickoff video asset is done and moved from blocked to active (was item 12). Two open questions came out of actually seeing it — flagged inline, not silently resolved.

---

## Priority 1 — critical, do first

**1. Remove the "Open to Work" badge.**
Top-right corner on every page, contradicts the product/founder positioning the entire rework is built around. Never mentioned in any spec doc — a pre-existing leftover nobody touched. Just delete it.

**2. Implement the palette split — now checkable against both real assets.** *(full detail: `PALETTE.md`)*
- Sample the cyan/icy-blue hex from `fifa-card.jpg` **and** from `kickoff-reveal.mp4`/`.webm` — both exist now. They came from two separate AI generations; confirm they read as the same color before locking `--accent-primary`. If they diverge, the card should win as source of truth (it's the persistent UI element; the video is a one-time flash).
- Set it as one CSS variable, referenced everywhere instead of the current hardcoded red/orange.
- Red/orange narrows to exactly two jobs: match clock stoppage-time state, "in progress" tags (Frontage's "IN BUILD," the ribbon caption).
- Move the Position tag ("PRODUCT & BUILD") from red to the new cyan token.

**3. Real screenshots for Dekho and Frontage Highlights cards.**
Currently plain gradient placeholder boxes — the single biggest reason Highlights reads unfinished.

---

## Priority 2 — Kickoff video integration (newly unblocked)

**4. Wire in the Kickoff video.** *(full detail: `KICKOFF_VIDEO.md` — integration checklist section still applies as written)*
- Assets: `kickoff-reveal.mp4` (2.9MB) + `kickoff-reveal.webm` (2.3MB), 1920×1080, no audio track (nothing to explicitly mute — simpler than the original spec assumed), watermark-free.
- Session-gate, skip path (manual + instant for `prefers-reduced-motion`), hand off into the existing canvas frame-sequence once it ends — all per the confirmed decision earlier in this thread.
- **Open question, not yet decided:** actual duration is ~5.46s against the original 3–4s target in `KICKOFF_VIDEO.md`/`TECH_SPEC.md`. It needs the extra length to do both the hidden phase and the reveal. Decide explicitly whether 5.5s is acceptable for a first-visit gate, or trim further — don't just quietly accept the new number.
- **Open question, not yet decided:** the video's own payoff already reveals your photo, on the card. `TECH_SPEC.md`'s planned Magnet-hover hero portrait (a *separate* photo of you, right after Kickoff) may now be redundant — showing your face twice in quick succession. Decide whether to drop it, apply Magnet to something else in the Hero instead, or keep it and see if it actually feels repetitive once built.

---

## Priority 3 — mechanic rebuilds (fully specified, never built)

**5. Matchday Ticker → scroll-position-linked dual-row marquee.** *(full detail: `TECH_SPEC.md` §5)*
Currently a plain looping CSS marquee on a timer, not scroll-linked.

**6. Highlights → sticky-stacking scale-down cards.** *(full detail: `TECH_SPEC.md` §4)*
Currently the original horizontal-scroll-pin, predating the football-theme work entirely.

---

## Priority 4 — FIFA Card completeness
Aesthetic is strong and approved — these are functional gaps, not redesign requests.

**7. Surface real-skill labels somewhere visible.** *(source rule: `DESIGN_BRIEF.md` §3)*
Card shows only codes and numbers. `skill`/`descriptor` fields exist in `content.ts` but are unused.

**8. Add Club ("Dekho") and Nation ("India") visibly.**

**9. Add the "Ones to Watch" tier visibly.**

---

## Priority 5 — consistency and QA

**10. Migrate remaining components onto shared `motion.ts` tokens.**
Only `FifaCard` and `MatchClock` currently use them.

**11. Confirm the pitch-line grid is actually visible** at ~5% opacity against pure black.

**12. Full visual QA in a real browser.**
`STATUS2.md`'s own browser tool was unreliable this session — everything was checked via DOM/grep, not a real render.

---

## Explicitly not bugs — leave as-is, don't "fix"
- FIFA Card flip → hover-reveal side panels (your own approved mid-build change)
- `motionTokens` as the export name instead of `motion` (deliberate, avoids colliding with `framer-motion`'s own `motion` import)
- Orphaned `About`/`Skills`/`Stats` components and data — harmless, consistent with how superseded code has been left in place throughout this project

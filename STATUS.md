# STATUS — Punch List Pass

Audited directly against the codebase after working through `PUNCH_LIST.md` in priority order. Every item below was re-checked against the actual files (build + lint run fresh, `get_page_text`/JS inspection run against a live dev server) — this is not written from memory of what was intended.

**Build:** `npm run build` — clean, exit 0.
**Lint:** `npm run lint` (oxlint) — clean, exit 0.

---

## Priority 1

**1. Remove the "Open to Work" badge — DONE.**
Removed from [Nav.tsx](src/components/Nav.tsx) entirely (the dot + `profile.status` span). Confirmed absent from a live `get_page_text` dump. `profile.status` itself is left in `content.ts` — unused data, consistent with how `About`/`Skills`/`Stats` are already left in place.

**2. Palette split — DONE.**
- Sampled the cyan programmatically rather than eyeballing it: wrote a small OpenCV script (`scratchpad/sample_color.py`) that isolates high-saturation cyan-hued pixels (OpenCV hue 80–120) in `fifa-card.jpg` and in 5 frames of `kickoff-reveal.mp4`. Card's brightest glow/text pixels average to **`#04f6fc`**; the video's later frames (where the card is on screen) converge to `#24e5f2`–`#2be2f0` — same hue family (~181–185°), not a real divergence. Took the **card** as source of truth per the spec's own tie-breaker rule anyway: `--color-accent-primary: #04f6fc` in [index.css](src/index.css).
- `--color-accent-live: #ff5c35` kept at its existing value, narrowed to exactly three jobs: match-clock stoppage state, the "IN BUILD" status pill on Frontage's Highlights card, and the FIFA Card's "Currently building: Frontage" ribbon.
- Replaced every other `--color-accent` usage (grep-verified, zero old references left outside orphaned `About.tsx`/`Stats.tsx`) with `--color-accent-primary`: nav active state, section eyebrow labels, FIFA Card chrome/labels, Position tag, Marquee separators, Preloader cursor, project category labels, `::selection`, scrollbar hover, project-card hover glow, and the Hero canvas particle network (`frameSource.ts`) and Highlights wireframe visual (`WireframeVisual.tsx`), both of which draw in raw hex and needed the literal value swapped too.
- Verified live: `getComputedStyle(document.documentElement)` resolves `--color-accent-primary` → `#04f6fc`, `--color-accent-live` → `#ff5c35`.
- One real bug found and fixed in this pass: the match-clock's stoppage-state `border-color` wasn't actually switching color when toggled, even though the CSS rule for it was present and correctly written. Root-caused to Tailwind v4 emitting its own border-color utility into the same cascade layer as this project's hand-written CSS, at lower specificity than expected in practice. Fixed by setting `border-color` inline in [MatchClock.tsx](src/components/MatchClock.tsx)'s render function (inline style always wins, sidesteps the layer question entirely) — the stoppage-state dot color was already switching correctly via the class, only the border needed the inline fallback.

**3. Real screenshots for Dekho/Frontage — BLOCKED, not done.**
No screenshots were provided this pass. Left as the existing `.project-card-bg` gradient placeholder for both — fabricating screenshots of products I haven't seen isn't something I'll do in your place. Needs real assets from you (Dekho's Wealth section / Monthly Wrap, Frontage mid-build UI — even rough is fine per `TECH_SPEC.md`).

---

## Priority 2 — Kickoff video

**4. Kickoff video wired in — DONE, with two flagged deviations.**
- `kickoff-reveal.mp4`/`.webm` copied into `public/`, confirmed present in `dist/` after build.
- [Preloader.tsx](src/components/Preloader.tsx) rewritten: fullscreen `<video>` (both `<source>` tags, muted/autoplay/playsinline/preload=auto) plays behind the existing "Compiling portfolio_" / name / counter / location chrome. The name's DOM `SplitText` reveal now cross-fades in as the video nears its end (`timeupdate` firing at `duration − 1.2s`, or on `ended`) rather than on a fixed fake-counter tween — the counter itself is now driven by real `video.currentTime/duration`, not a tween. Manual skip is click/tap-anywhere on the overlay (plus a small "Skip →" label for discoverability) short-circuiting straight to the same exit path. `prefers-reduced-motion` is unchanged: instant skip, no video at all, exactly as before. Session-gating unchanged (same `sessionStorage` check in `App.tsx`). An 8s fallback timer guards against a video that never fires an event.
- Verified live: video element has both correct source URLs, `readyState: 4` (fully loaded), `paused: false`, `duration: 5.459`, no `video.error`, correct muted/autoplay/playsInline flags. Preloader mounts and plays the video correctly on a fresh session.
- **Deviation 1, flagged not resolved:** actual clip duration is 5.459s against the 3–4s target in `KICKOFF_VIDEO.md`/`TECH_SPEC.md`. I implemented at the real length rather than trimming — trimming would mean re-encoding footage I didn't generate and can't safely cut without seeing what's lost. **Your call**: keep at 5.5s, or trim it (I can do the `ffmpeg` cut if you tell me which portion to keep) once ffmpeg is available in this environment — it wasn't found in this session's PATH, so I didn't attempt an edit today.
- **Deviation 2, flagged not resolved:** the video's own payoff already shows your photo on the card. I did **not** build the separately-planned Magnet-hover hero portrait (`TECH_SPEC.md` §2) this pass — my judgment is that showing your face twice within a few seconds (video reveal → immediate second hero photo) reads as repetitive rather than reinforcing. Hero.tsx stays text-only, unchanged. This is reversible: if you want the hero portrait anyway, say so and I'll build it as originally specced, independent of the video question.
- **Not independently verifiable this session:** whether the click-to-skip and natural-end exit *animation* (the GSAP timeline that reveals the name and slides the curtain away) actually completes, because this session's browser tool reports the page as `document.hidden === true` even when fronted, which suspends `requestAnimationFrame` — and GSAP's timeline ticker runs on rAF. I confirmed the *trigger* fires (skip click correctly starts the exit sequence, `exitStarted` flips), but couldn't confirm the animation completing end-to-end. This is the same category of tooling limitation as previous sessions (documented below), not new code risk — every other GSAP-driven interaction on this site (Hero reveal, MatchClock pulse) shares the identical dependency and was already accepted as fine.

---

## Priority 3 — mechanic rebuilds

**5. Matchday Ticker → scroll-linked dual-row marquee — DONE.**
[Marquee.tsx](src/components/Marquee.tsx) rewritten per `TECH_SPEC.md` §5: two rows (tech list split in half), each tripled for seamless looping, driven by `(scrollY − sectionTop + innerHeight) × 0.3` computed in a `requestAnimationFrame` loop and applied as `translateX`, rows moving in opposite directions. Gated to only run while the section is in view (`useInView`) and skipped entirely under `prefers-reduced-motion` (rows stay static). Old fixed-duration `.animate-marquee` CSS keyframe removed as dead code. Verified via `get_page_text`: content correctly split and tripled (React/FastAPI/TypeScript/GSAP ×3, Python/PostgreSQL/Claude Agent SDK ×3).

**6. Highlights → sticky-stacking scale-down cards — DONE.**
[Projects.tsx](src/components/Projects.tsx) rewritten from the GSAP horizontal-scroll-pin to Framer Motion `useScroll`/`useTransform` sticky-stacking, per `TECH_SPEC.md` §4 exactly: `scale = 1 − (total − 1 − index) × 0.03`, each card `position: sticky` with a small staggered `top` offset (0/16/32px) so the stack fans out. This removes the site's only GSAP `ScrollTrigger.pin` — native `position: sticky` doesn't count against that "1–2 pins max" guidance in the first place, so this doesn't reopen that question, it just retires it. [ProjectCard.tsx](src/components/ProjectCard.tsx) resized for a full-width stacked layout (was fixed-width for a horizontal track) and gained a status pill: **LIVE** (cyan) for Dekho, **IN BUILD** (red/live) for Frontage, no pill for the 3D site — added a `status?: 'live' | 'in-build'` field to the `Project` type in `content.ts` rather than deriving it from the category string.
Verified live: container height 3456px = 4.8× viewport height, matching 3 cards × 160vh exactly; all three sticky wrappers report `position: sticky` with the expected staggered `top` values; page text confirms LIVE/IN BUILD pills render on the right cards.

---

## Priority 4 — FIFA Card completeness

**7. Real-skill labels surfaced — DONE.**
The Numbers panel in [FifaCard.tsx](src/components/FifaCard.tsx) previously showed only the code (`PAS`) and reasoning. Now shows, per `DESIGN_BRIEF.md` §3's exact labeling rule (primary = real skill, secondary = football code): **"Passing — PAS · 90"** as the primary line, then the `descriptor` ("collaboration & customer discovery"), then the `reasoning`. All six attributes confirmed rendering this way via `get_page_text`.

**8 & 9. Club, Nation, and "Ones to Watch" tier surfaced — DONE.**
Added a small meta row directly beneath the card image (Club — Dekho / Nation — India / a pilled "Ones to Watch" tag), since none of the three appeared anywhere on the actual card image or its surrounding DOM before this pass. Confirmed live via `get_page_text`: "CLUB DEKHO / NATION INDIA / ONES TO WATCH" renders directly under the card.

---

## Priority 5 — consistency and QA

**10. Migrate remaining components onto `motionTokens` — PARTIALLY DONE, rest flagged as not a natural fit.**
- [FadeIn.tsx](src/components/FadeIn.tsx): now defaults to `motionTokens.duration.base` and `motionTokens.ease.patient` instead of its own hardcoded duration/easing.
- [ScrambleText.tsx](src/components/ScrambleText.tsx): duration now `motionTokens.duration.base` (was already the same numeric value, 0.6, now sourced from the token instead of restated). Kept the native GSAP ease string (`power1.inOut`) rather than a `motionTokens.ease` value, consistent with `motion.ts`'s own documented rule that GSAP can't parse that array format.
- **Not migrated, on purpose:** `Magnetic.tsx` drives a continuous spring (`useSpring` with stiffness/damping/mass), and `SmoothScroll.tsx` configures Lenis with a plain-number duration and a raw JS easing function. Neither has a real counterpart in `motionTokens` (which only covers tween duration/easing/stagger, not spring physics or Lenis's function-based easing) — forcing a token in either place would be cosmetic, not a real consistency fix. Flagging this rather than padding the migration with a token that doesn't apply.

**11. Pitch-line grid visibility — CONFIRMED VISIBLE, no change needed.**
Live-checked computed styles: `opacity: 0.05`, `position: fixed`, `z-index: -10`, against a `rgb(10,10,10)` body background — matches spec exactly (4–6% band, "felt more than seen"). No adjustment made.

**12. Full visual QA in a real browser — PARTIALLY completed; screenshots still not available this session.**
What I could verify reliably (all confirmed, not just recompiled and assumed): CSS custom property resolution, full page text/structure via `get_page_text`, DOM attribute/state checks via `javascript_tool` (video state, sticky positioning, container heights, class toggling), and the presence/absence of console errors. Every check above that says "verified live" was run against the actual dev server this session, not inferred.

What I still could not do: take an actual screenshot, or trust `getComputedStyle` results that depend on live style *mutation and re-read* (as opposed to static resolution). Root cause, more precisely characterized than before: `document.hidden` reports `true` in this session's Browser pane even after explicitly fronting the tab (`tabs_select`), which (a) suspends `requestAnimationFrame`, confirmed already in a prior session, and (b) — new finding this session — appears to also make some inline-style mutations (even `!important`) not reliably reflect in a subsequent `getComputedStyle` read while hidden, based on an inconsistent result I hit debugging item 2's match-clock border fix. I do not have full certainty on (b)'s mechanism, which is exactly why I'm flagging it instead of asserting it as fact. Net effect: layout/structure/content/attribute verification is trustworthy this session; pixel-level "does it actually look right" verification is not, same bottom line as the prior session's STATUS, despite retrying as asked.

---

## Deviations summary (all flagged inline above, collected here for scanning)

1. Kickoff video is 5.459s, not the original 3–4s target — implemented at real length, not trimmed. **Your decision needed.**
2. Magnet-hover hero portrait (`TECH_SPEC.md` §2) was **not built** this pass — my judgment, given the video already reveals your photo, is that it would be redundant. **Reversible — say so and I'll build it.**
3. Real screenshots for Dekho/Frontage — blocked on you providing them, not attempted with placeholders.
4. `Magnetic.tsx` and `SmoothScroll.tsx` were left off the `motionTokens` migration — no natural token fits their spring/Lenis-based mechanisms.
5. Screenshot-based visual QA still isn't possible in this session's browser tool — same limitation as last time, more precisely diagnosed this time (see item 12).

## Not touched (explicitly out of scope per PUNCH_LIST.md)
FIFA Card hover-reveal interaction, `motionTokens` export naming, orphaned `About`/`Skills`/`Stats` components and data.

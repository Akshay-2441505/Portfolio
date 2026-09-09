# Visual Craft Pass — bugs first, then presence
Written after direct screenshot review. Two items here are bugs, not taste — fix those regardless of anything else. The rest addresses a real gap: outside the FIFA Card and match clock, the site currently carries no environmental signal that it's football-themed at all, and the "restraint" principle in `MOTION.md`/`DESIGN_BRIEF.md` was applied too literally in the build — "felt more than seen" became "not there."

---

## Bugs — fix regardless of anything else below

**1. Kickoff video/name-reveal overlap.**
The `SplitText` name reveal and the video are both rendering at high opacity simultaneously, colliding visually over the card's face. The crossfade isn't actually inverse.

**Fix — replace the direct crossfade with a fade-through-black:** video fades to black (not directly to text), brief hold on black, then the name reveals on the flat black background. This sidesteps the collision entirely rather than tuning opacity curves to try to avoid it, and it's a legitimate technique on its own — a "dip to black before kickoff" beat, not just a workaround.

**2. Highlights sticky-stack reads as stuck.**
Cards only change at transition boundaries; nothing moves during the ~4.8-screen-height pinned scroll in between, so scroll input produces no visible feedback for long stretches.

**Fix, two parts:**
- Add continuous subtle motion for the *entire* duration each card is pinned, not just at the scale transition — parallax the card's image content at a different rate than the card shell itself (image drifts slower than the frame around it), so something is always visibly responding to scroll.
- Add a small in-section progress indicator (three dots or `01/02/03`, filling as each card's pin range completes) — gives explicit confirmation that scroll is registering, independent of the parallax fix.

---

## The restraint principle, corrected

Original rule: spend the site's boldness on exactly one moment, keep everything else quiet. In practice this produced sections that are quiet in the sense of *absent*, not *considered*. Corrected version, going forward: **every section gets one deliberate signature move. Zero moves reads as unfinished; five reads as chaotic; one is the target — for every section, not just one section for the whole site.**

This also means the pitch-line grid needs an honest fix: 4-6% opacity is not achieving "felt more than seen" — it's achieving "absent." Raise it to a level that's genuinely, if subtly, visible against the black — test at 12-15% and adjust from there by eye, not by re-asserting the original number.

---

## Per-section signature moves

**Appearances** — currently the flattest section in the whole site.
- Extend the word-by-word scroll-reveal technique (already built for the Preloader name — direct reuse) to the bullet detail under each row.
- A vertical timeline line connecting the Dekho and Brown Agri Waste entries — visual structure where there's currently just a table.

**Full-time** — same problem, different section.
- Intensify the pitch-line grid specifically here, at the site's closing moment — floodlights fully up for the ending beat.
- A confirm-pulse on the email button (using the `decisive` motion token, already defined, barely used anywhere) before `mailto:` opens.

**More Work** — currently a plain list with no signature at all.
- At minimum, apply the same word-by-word reveal to each entry's description, consistent with Appearances rather than inventing a third treatment.

**Highlights** — covered under Bugs above (parallax + progress indicator are the fix, not optional polish here).

---

## Status update — "build it all, trim later" methodology adopted
These no longer need individual yes/no confirmation as of the peak-creativity direction — build them, judge in the eventual trim pass:
- Matchday Ticker: items glow briefly crossing center-screen
- Site-wide: custom cursor (small cyan dot/ring)
- Scroll-velocity-reactive intensity: effect energy tied to scroll *speed*, not just position — a fast scroll flares particles/glow briefly before settling, extending `MOTION.md`'s "patient scroll, decisive action" language into scroll speed itself.

**Superseded — don't build separately, see `WEBGL_UPGRADE.md` instead:**
- Hero: cursor-reactive particle network — absorbed into the real 3D Hero scene, not a separate Canvas 2D effect
- FIFA Card: cursor-follow holographic tilt-and-gloss — absorbed into real 3D card geometry, not a CSS trick

# Effects Plan — GSAP techniques mapped to sections
Extends `RESET.md`. Each item below traces to a specific real GSAP demo, not an abstract idea — see the demo names for reference when implementing.

---

## Confirmed — each solves a real need
**Preloader — staggered name reveal.** Apply the "Staggering" technique to the existing `SplitText` name reveal: each letter staggers in individually rather than the whole name fading as one unit. Same mechanic already in place, one added technique, not a second competing loading motif.

**Projects — card stack.** Same direction `TECH_SPEC.md` originally specced (sticky-stacking), now with a real reference (GSAP's "Card stack" demo, built on the `Flip` plugin with `onEnter`/`onLeave`). **Still open:** that demo is click-to-cycle, not scroll-scrubbed — decide which interaction model actually fits three projects before building.

**Footer/Contact — footer bounce.** Scroll-velocity-reactive (`getVelocity()`), directly resolves the "scroll-velocity-reactive intensity" idea from earlier in this conversation with a real technique instead of a description.

**Footer/Contact — text morph, "See Ya."** Scoped down from "site-wide text" to one contained moment: an abstract shape resolves into the words "See Ya" (or similar) via `convertToPath()` + MorphSVG, as a one-time farewell beat when the visitor reaches the bottom. Exact source shape and final wording still open — "See Ya" is a placeholder direction, not locked copy.

**Candidate for the still-open "wow moment" — Horizontal Text.** `SplitText` + `ScrollTrigger`, GSAP-only, zero 3D/Three.js risk. Strongest current candidate for the site's signature moment; not yet confirmed as *the* one.

---

## Experimental — build now, keep only what earns its place
Explicit trial basis, not committed decisions:
- **Cursor Trail**
- **Canvas Particles**
- **Image Mask on Scroll** — most purposeful of the three (real comparison/reveal technique, good fit for an About-section photo specifically)

**If a trim pass happens later, cut in this order:** Canvas Particles and Cursor Trail first (most purely decorative, most likely to read as excess) — Image Mask on Scroll last, since it's doing actual work rather than just adding motion.

**Restyle requirement, not optional:** both Cursor Trail and Canvas Particles demos use the GSAP site's own rainbow multi-hue defaults — recolor to the site's actual palette before judging whether they work; the demo colors were never meant to ship.

---

## Still open
- Card stack: click-cycle vs. scroll-scrubbed
- Footer text morph: final wording and source shape
- Whether Horizontal Text becomes the confirmed single wow-moment, or one technique among several

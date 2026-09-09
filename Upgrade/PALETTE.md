# Palette — resolving the accent-color clash, then adding presence
Addendum to MOTION.md / DESIGN_BRIEF.md.

---

## Part 1 — the semantic split (implemented, keep as-is)
No accent color was ever specified in `CONTENT.md`, `DESIGN_BRIEF.md`, or `MOTION.md`. Two showed up anyway, unreconciled — this section is now resolved and confirmed live (see `STATUS3.md`).

| Color | Job | Applies to |
|---|---|---|
| **Cyan/icy-blue** (`--color-accent-primary`, sampled at `#04f6fc` from `fifa-card.jpg`) | Site identity / structure | Nav active link + badge circles, section eyebrow labels, dividers, button outlines, FIFA Card chrome, match clock in its normal state |
| **Red/orange** (`--color-accent-live`, `#ff5c35`) | "Happening right now" — live/urgency only | Match clock's stoppage-time state, the "IN BUILD" tag on Frontage, the "Currently building: Frontage" ribbon caption |

This split stays exactly as-is. What follows adds richness *around* it, doesn't replace it — the two functional colors still carry meaning; everything below adds atmosphere and depth.

---

## Part 2 — why "resolved" still reads as dead
Two functional colors on flat black with flat white text is disciplined, not alive. The palette needs a presence layer: glow, depth, warmth, a third semantic color — none of which touches the legibility floor, since color and light read to everyone regardless of football knowledge.

## Presence layer — additions

**1. Secondary hue — re-sample, don't invent.** Real "Ones to Watch" cards run a blue-to-purple gradient in the actual game. Check whether `fifa-card.jpg`'s gradient background has violet/indigo that's never been pulled out as a token — if so, that's `--color-accent-secondary`, already thematically anchored. Same sampling discipline as Part 1: pull the real pixel value, don't guess one.

**2. Glow, not flat fills.** Add blurred box-shadow / soft radial falloff wherever `--color-accent-primary` or `--color-accent-live` currently render as flat color — nav actives, button outlines, match clock, card chrome. The colors stay the same; they stop looking like flat swatches and start looking like they're actually emitting light.

**3. A third semantic color: `--color-accent-success`, muted green.** Green-for-positive/confirmed is near-universal (traffic lights, checkmarks) — passes the self-evident floor without question. Gives confirmation states (email sent, form submitted) their own color instead of overloading cyan for everything that isn't urgent.

**4. Background: vignette + section-to-section temperature drift.** Replace flat `rgb(10,10,10)` with a subtle radial gradient — near-black center, easing to pure black at the edges. Layer in a slight color-temperature shift per section (Hero reads a touch cooler/bluer, Highlights a touch warmer) for a sense of journey without introducing a new named color.

**5. Text: soften pure white.** Primary text moves from `#FFFFFF` to a warm off-white (something in the `#F2EFE9` range, tune by eye against the new background) — pure white on pure black reads clinical/templated; a small warm shift reads considered.

**6. Grain overlay: tint it.** The existing film-grain texture goes from neutral gray to a faint cyan tint, so texture and palette reinforce each other instead of sitting unrelated.

## Implementation note
Same token discipline as Part 1 — every addition above becomes a CSS variable, referenced everywhere, sampled from real assets where a color is being pulled from existing art (item 1) rather than invented from description.

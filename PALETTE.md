# Palette — resolving the accent-color clash
Addendum to MOTION.md / DESIGN_BRIEF.md. Written after visual review of the live build surfaced two competing, undocumented accent colors.

---

## The problem, precisely
No accent color was ever specified in `CONTENT.md`, `DESIGN_BRIEF.md`, or `MOTION.md`. Two showed up anyway, unreconciled:
- **Red/orange** — nav active state, match clock, "MORE WORK" eyebrow label, "VIEW CODE" button outlines, Position tag. Ad hoc, Claude Code's own default, no design rationale behind it.
- **Icy cyan-blue** — the FIFA Card's neon edge-glow. This one *is* intentional: it's the real color scheme of an actual "Ones to Watch" card in FIFA, which is why that tier was chosen for `fifaCard.tier` in the first place (see `CONTENT.md`). The upcoming Kickoff video is being generated to match this same palette, which will make the split more visible, not less, if nothing else changes.

## The fix: semantic split, not elimination
Don't make the site monochrome — give each color exactly one consistent job, same self-evident-on-sight logic the rest of the theme already follows.

| Color | Job | Applies to |
|---|---|---|
| **Cyan/icy-blue** (sample exact hex from `fifa-card.jpg`, don't guess) | Site identity / structure | Nav active link + badge circles, section eyebrow labels (Kickoff, Highlights, More Work, Appearances headers), dividers, button outlines (View Code, Resume), FIFA Card chrome (unchanged), match clock in its normal (non-stoppage) state |
| **Red/orange** (keep existing value, or retune to complement the new cyan) | "Happening right now" — live/urgency only | Match clock's stoppage-time state (0′+ styling — this is real broadcast convention, not arbitrary), the "IN BUILD" tag on the Frontage Highlights card, the "Currently building: Frontage" ribbon caption on the FIFA Card |

Position tag ("POSITION: PRODUCT & BUILD") is currently red without clear reason — move to the cyan/identity token, since it's describing who you are, not signaling something urgent.

## Implementation note
- Add one CSS variable (e.g. `--accent-primary` for cyan, `--accent-live` for red) referenced everywhere — no new hardcoded color values in individual components, matching the token discipline already established for motion values in `MOTION.md`.
- Sample the cyan's exact hex directly from the `fifa-card.jpg` asset (and the Kickoff video once generated) — a quick pixel-sample script or browser eyedropper — rather than approximating from a compressed screenshot.
- "OPEN TO WORK" badge removal (already flagged as the top-priority fix) should happen in the same pass as this — it's currently using neither accent color consistently and shouldn't exist regardless.

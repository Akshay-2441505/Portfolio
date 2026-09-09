# Reset — minimal direction, one wow moment
Supersedes the systemic football theme. Anchor reference: gionatannese.com — strict 2-color palette, one polished 3D moment, subtle sound, "a few nerdy details," not a systemic theme.

---

## What's retired
These stay on disk as history, not current guidance — don't build from them:
- `DESIGN_BRIEF.md` — the full section-by-section football rework (Kickoff/Starting XI/Appearances/Highlights/Full-time naming, the FIFA Card structure)
- The FIFA Card concept itself — stats, tier, club/nation, hover-reveal panels
- `MOTION.md`'s match clock, pitch-line grid
- `PALETTE.md`'s multi-color system (cyan/red/green + glow + gradient + grain-tint presence layer)
- `VISUAL_CRAFT.md`'s per-section football signature moves
- `WEBGL_UPGRADE.md`'s scope (Hero + FIFA Card both getting football-themed 3D geometry) — the *scope* is retired, the root-cause technical fix is not, see below
- `kickoff-reveal.mp4`/`.webm` — retired, don't reuse (see above)

## What's kept
- **All real content** — name, positioning, Dekho, Frontage, education, project descriptions. None of this was ever the problem; carry it forward as-is from `CONTENT.md`.
- **The WebGL root-cause fix** — explicit container sizing before Canvas mount, properly-sized Suspense fallback, `<Preload all>`. This is real engineering knowledge independent of theme; still applies to whatever the new single 3D moment turns out to be.
- **The token discipline** — sample real colors from real assets rather than guessing, one CSS variable referenced everywhere. Applies to the new, much smaller palette too.
- **The self-evident-to-anyone floor** — if anything, this matters more now, not less. A minimal site has nowhere to hide an unclear moment.

## The new direction
- **Palette:** 2-3 colors, max. Near-monochrome, the way Nese runs pure black/white. Pick colors that earn their place, not a system with multiple semantic jobs to track.
- **One wow moment:** a single, genuinely polished 3D/interactive element — the site's whole creative statement lives here, nothing else competes with it. Root-cause WebGL fix applies (see "What's kept").
- **Typography-forward:** confident type doing most of the work, same as Nese, same as the original Hero headline treatment that was already working well before the football theme layered on top of it.
- **Sound:** optional, subtle, opt-in only if it happens at all — never autoplay.
- **Section structure:** plain naming. Hero / About / Projects / Contact, or equivalent — no reworked vocabulary layered on top.

## The one authentic detail — visual only, never in wording
Reversed from the earlier draft: football shows up visually, never in text. No football vocabulary anywhere in copy — no "Position," no "Midfield," no bio sentence naming football explicitly.

This merges with the single wow-moment decision rather than sitting separately: **the 3D wow-object itself is the football touch** — a ball, a boot, or something similarly recognizable, rendered with the same precision as Nese's 3D head, placed in Hero. This actually satisfies the self-evident-to-anyone floor better than words would have — a 3D football needs no glossary the way "Position: CM" did; anyone recognizes it instantly, no football fluency required, no explanation anywhere near it.

One object, one placement, nothing else. A background pitch texture or a boot icon elsewhere would start reintroducing a system, just a silent one instead of a worded one — keep it to the single object.

## Still true regardless of any of this
Real screenshots for Dekho and Frontage are still needed and still not provided — unrelated to the reset, still worth getting before the next build pass.

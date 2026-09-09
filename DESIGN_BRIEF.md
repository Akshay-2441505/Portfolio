# Portfolio Redesign — Design Brief
For: Akshay Kurdekar's personal portfolio (React 19 + TS + Vite + Tailwind v4 + GSAP/ScrollTrigger + Framer Motion + Lenis + Canvas 2D)
Purpose: give Claude Code (or any agent building this) the full context and rules for the football-theme rework, in one place.

---

## 1. Positioning (read this before anything else)

The site leads with **product/founder identity**, not "frontend developer" or "open to work" framing. The football theme is the *voice and structure* layered on top of that identity — it is not a sports-fan site, and it is not a separate section bolted onto a founder site. Every themed element must still communicate its real function on sight, to someone with zero football knowledge.

**The one test every themed element must pass:** *does it explain itself the instant someone sees it, with no legend, caption, or "here's why" section?* A match clock instead of a progress bar passes — everyone understands a clock filling up as they scroll. An unlabeled attribute name a visitor has to decode does not pass. If an element fails this test, cut it or relabel it — never add an explainer to compensate. There is no "why this site is football-themed" section anywhere on the site.

**Full commitment was the direction chosen** — most sections are reworked around match vocabulary, not just accents. But full commitment still means every individual choice passes the self-evident test above. Commitment is about *scope* (how many sections are touched), not about *how literal or unexplained* any one element gets.

---

## 2. Section-by-section rework

| Current section | Themed version | What it carries | Why it reads without a legend |
|---|---|---|---|
| Preloader | **Kickoff** | Name reveal (unchanged mechanic) | Countdown/reveal on load already resembles a matchday announcement |
| Nav | Stays functional, light touch only | Section links | Navigation must work under time pressure — keep labels plain; small jersey-number-style badges next to links are the only themed touch here |
| Hero | **Starting XI** | Name, one-line positioning, canvas visual | "Position: Product & Build" reads instantly — "position" means the same thing in football and in a resume |
| Marquee | **Matchday ticker** | Tech stack, scrolling | Stadium scoreboards already scroll info — zero translation needed |
| About + Skills (merged) | **The FIFA Card** — see CONTENT.md | Photo/silhouette, position, club, nation, 6 attribute stats, bio | Trading/player cards are recognizable even to non-football audiences; this is the single most distinctive element on the site — spend the most craft here |
| Experience | **Appearances** | Dekho + Brown Agri Waste, as a club-history table (Club / Role / Period) | Near 1:1 structural match to a real football appearances table |
| Projects | **Highlights** | Dekho, Frontage, 3D site — pinned horizontal scroll (existing mechanic, new framing) | "Highlights reel" is understood by everyone regardless of football knowledge |
| Contact | **Full-time** | CTA, socials | "Full-time whistle" reads as an ending/closing moment even cold |
| Scroll progress indicator | **Match clock** (0′ → 90′+, ticks up as the page scrolls) | Replaces a generic progress bar | Reads as a progress indicator to anyone; football knowledge irrelevant |
| Background geometry | Subtle pitch-line grid (center circle, halfway line) as structural layout guide | — | Felt more than seen; texture, not decoration |

**Do not add:** a section or caption explaining the theme. **Do not use:** literal grass textures, ball-physics animations as UI chrome, or jersey/team colors as the primary palette — the theme lives in structure and vocabulary, not decoration.

---

## 3. The FIFA Card — special execution notes

This is the merged About + Skills section, and it's the one most likely to either land very well or read as gimmicky, because it's the only section asking a visitor to map an unfamiliar label (an attribute name) onto a real skill. The fix is labeling discipline, not avoidance:

- **Primary label = the real skill. Secondary/small tag = the football word.** E.g. "**Vision** — product & customer discovery," not "Vision" alone.
- Give it real craft: a flip or reveal interaction (front = card face, back = short bio) is a good candidate for "the one memorable moment" the whole site spends its boldness on (see `frontend-design` restraint principle: spend boldness in one place, keep everything around it quiet).
- Card tier suggestion: an **"Ones to Watch"**-style treatment (the real-game tier for promising young/rising talent) fits the actual narrative — a student positioning himself as early-career and on the rise — better than a generic "gold card" tier. See CONTENT.md for full stat block and copy.
- A small corner ribbon/tag for "currently building: Frontage" reuses real FIFA card iconography (special-edition/in-form tags) meaningfully, tied to genuinely live, in-progress work — not decoration for its own sake.

---

## 4. Guardrails carried over from the base build (unchanged)

- `prefers-reduced-motion` support stays everywhere, including the match-clock scroll indicator and any card flip/reveal.
- Keep the single typed content file pattern (`content.ts`) — add the new copy there, don't scatter strings into components.
- Canvas 2D over WebGL/R3F remains the right call (this was already tested and retired once) — the FIFA card face can be a styled DOM/CSS component; it does not need a canvas render.
- Motion tokens (durations, eases) belong in one shared file so every themed transition feels authored, not assembled piecemeal — see `MOTION.md`.
- Avoid the generic AI-portfolio tells regardless of theme: no cream-background+serif+terracotta-accent combo, no tracked-out ALL-CAPS eyebrow labels above every section, no numbered 01/02/03 markers unless the content is a genuine sequence (Highlights reordered by relevance is *not* a sequence — don't number it just because "Highlights" sounds sports-y).

---

## 5. Design inspiration references

Real sources to pull from — hand these to Claude Code or browse them directly. None of these should be copied; they're reference points for craft level and specific mechanics.

**Player/trading card treatments (for the FIFA Card section):**
- Dribbble — FIFA Ultimate Team card searches: https://dribbble.com/search/fifa-ultimate-team and https://dribbble.com/search/fifa-cards — browse for stat-block layout, rarity-tier color treatment, corner ribbon placement.
- Dribbble — individual player card / trading card explorations: https://dribbble.com/tags/fifa_20 (see the "Sergio Ramos — Player Card Profile/Trading Card" piece specifically for a clean stat-card layout) and https://dribbble.com/FlipDesigns/collections/4945809-website-collection (has a literal "Trading Card Style Social CTAs" concept worth studying for card-flip/CTA integration).

**Scroll mechanics, pacing, and overall craft level (for Highlights / Starting XI / match-clock scroll indicator):**
- Made With GSAP — a library of real, working scroll/interaction effects with breakdowns: https://madewithgsap.com/
- Awwwards GSAP showcase — browse for site-of-the-day–level scroll pacing and restraint: https://www.awwwards.com/websites/gsap/ and https://www.awwwards.com/inspiration_search/gsap-animation/

**General portfolio structure and card-UI patterns (for Appearances table, ticker, layout rhythm):**
- Land-book's portfolio + sport-category filter: https://land-book.com/design/portfolio
- Mobbin's Card UI pattern library (structural reference, not visual theme): https://mobbin.com/explore/web/ui-elements/card

Use these for mechanics and craft level, not literal copying — the FIFA card's *content* (real stats, real bio) is what makes it land, not the decoration.

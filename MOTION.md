# Motion Brief — tokens and rules for Claude Code
Goal: motion that feels authored and consistent, not a toolkit's default fade-up-on-scroll. Every rule below exists to be reused everywhere, not applied once and forgotten.

---

## The core rule: possession-based pacing

Football-derived, applied to interaction, never spelled out to the visitor:
- **Patient during scroll/reveal** — slower, controlled easing while the visitor is just moving through the page. Nothing should feel rushed or snappy during ordinary scroll.
- **Decisive on interaction** — when the visitor actually does something (a click, a card flip, a form submit, hitting Full-time), the response should be fast and confident. The contrast between "patient scroll" and "decisive action" is what reads as intentional pacing rather than a single uniform animation style.
- **One moment gets to be bold.** Per `frontend-design` restraint principles: spend the site's boldness on the FIFA Card reveal/flip. Every other transition (nav, marquee, hover states) should be quiet and near-invisible.

---

## Tokens

Put these in a shared `motion.ts` (same pattern as the existing Tailwind `@theme` tokens) and reference them everywhere — no new eases invented per-component.

```ts
export const motion = {
  duration: {
    instant: 0.15,   // decisive interaction feedback (clicks, confirmations)
    base: 0.6,        // standard scroll-reveal pacing
    slow: 0.9,         // the one bold moment (FIFA card reveal/flip)
  },
  ease: {
    patient: "cubic-bezier(0.16, 1, 0.3, 1)",   // expo-out — controlled, unhurried scroll reveals
    decisive: "cubic-bezier(0.4, 0, 0.2, 1)",     // snappier — click/interaction responses
  },
  stagger: 0.08,   // for any multi-element reveal (e.g. FIFA card stat rows)
};
```

Rules for use:
- Scroll-triggered reveals (GSAP ScrollTrigger) always use `duration.base` + `ease.patient`.
- Anything responding to a direct user action (Framer Motion hover/tap/click states) always uses `duration.instant` + `ease.decisive`.
- The FIFA Card flip/reveal is the only place `duration.slow` is used — that's what makes it read as the site's one bold moment instead of just another transition.

---

## Match clock (scroll progress indicator)

Replace the generic progress bar with a stadium-clock-style element: `0′` counting up to `90′+` as the visitor scrolls through the page. Implementation notes:
- Drive it off the same scroll progress value ScrollTrigger/Lenis already track — this is a relabeling of an existing mechanic, not new plumbing.
- Format as `NN′` (minutes symbol), optionally ticking past 90′ into "stoppage time" styling near the very end of the page (Full-time section) — a small, self-contained joke that still reads as "you're near the end" without explanation.
- Respect `prefers-reduced-motion`: the number can still update, just skip any bounce/pulse per-tick animation.

---

## Pitch-line background grid

- Center circle + halfway line rendered as a very low-contrast structural element (think 4–6% opacity against the background), not a literal green pitch.
- Use it to inform actual layout alignment (e.g. the FIFA Card or Hero content can align to the "center circle") rather than floating independently as decoration — structural, not cosmetic.
- Keep it static or extremely subtly parallaxed — this is texture, it should never compete with foreground content or scroll-jack attention.

---

## What NOT to add

- No new animation libraries beyond the existing GSAP + Framer Motion + Lenis + Canvas 2D stack — that's already more than enough range.
- No per-card hover-scale-plus-shadow as a blanket default across every section — the generic default this whole rework is trying to avoid.
- No literal ball/kick physics anywhere in UI chrome (buttons, cursors, loaders) — this is the kind of decoration that breaks the "reads instantly, no legend" rule from DESIGN_BRIEF.md.

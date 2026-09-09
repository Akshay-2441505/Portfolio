# Kickoff Video — integration notes
Addendum to MOTION.md. Covers the generated card-unpacking video, hero-only, single use.

---

## Scope (confirmed)
- Plays once, as the Kickoff/Preloader opening moment only. Not reused elsewhere on the site — the FIFA Card stays the site's other "bold moment," and repeating this clip elsewhere would dilute both.
- Self-generated via Higgsfield or Flow — no third-party/hotlinked assets, no licensing concern.

## Generation prompt direction
Match the FIFA Card's existing visual language, don't introduce a new one: dark navy background, icy cyan/blue neon edge-glow, small crystal-shard corner artwork, cinematic push-in, ends on black or an abstract glow (not a fully-formed, readable card).

Avoid: literal FIFA/FUT/EA branding, logos, or chrome in the prompt — keep it in the site's own original style, same as the card art itself.

Avoid: any legible name/text baked into the video frames — see below.

## Integration checklist for Claude Code
1. **Video is atmosphere only, not content.** It ends on an abstract/empty reveal; the real name/headline is the existing DOM `SplitText` reveal, cross-fading in on top or immediately after. Keeps text accessible, selectable, and editable without re-rendering video.
2. **Session-gate it** the same way the current Preloader already does (`sessionStorage` check) — first visit per session only.
3. **Skip path required:**
   - Manual skip (click/tap anywhere, or an explicit skip control)
   - Instant skip for `prefers-reduced-motion` — straight to Hero, no video at all
4. **Export both WebM and MP4 (H.264)** for browser coverage; `<video>` with multiple `<source>` tags.
5. **Muted autoplay + `playsinline`** attributes — required for autoplay on mobile Safari.
6. **Target file size:** well under 5MB for a 3–4 second clip. Compress after generation if the raw export is heavier (`ffmpeg` with a reasonable CRF is fine).
7. **Preload strategy:** don't block first paint on the video loading — show a minimal static frame or the existing name-reveal mechanic as a fallback while the video buffers, rather than a blank screen.

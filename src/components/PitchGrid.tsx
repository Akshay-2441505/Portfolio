/** A pitch-marking watermark (center circle + halfway line) — structural
 * texture, mirrors the .grain-overlay pattern (pointer-events-none, negative
 * z-index). Default opacity raised from the original 4-6% ("felt more than
 * seen" read as "absent" in practice, VISUAL_CRAFT.md) to a genuinely if
 * subtly visible ~13%. `className`/`absolute` let a section render its own
 * scoped, more intense instance instead of relying on the global fixed one. */
export function PitchGrid({
  opacity = 0.13,
  absolute = false,
}: {
  opacity?: number
  absolute?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none -z-10 h-full w-full ${absolute ? 'absolute inset-0' : 'fixed inset-0 h-screen w-screen'}`}
      style={{ opacity }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <line x1="0" y1="500" x2="1000" y2="500" stroke="var(--color-fg)" strokeWidth="1.5" />
      <circle cx="500" cy="500" r="180" fill="none" stroke="var(--color-fg)" strokeWidth="1.5" />
      <circle cx="500" cy="500" r="4" fill="var(--color-fg)" />
    </svg>
  )
}

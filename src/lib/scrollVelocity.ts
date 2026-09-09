/** Shared scroll-velocity signal — a plain mutable ref, not React state, so
 * anything reading it inside its own rAF/useFrame loop (the WebGL scenes,
 * CustomCursor) never triggers a re-render on scroll. Written to from
 * SmoothScroll.tsx's existing Lenis 'scroll' listener. */
export const scrollVelocity = { current: 0 }

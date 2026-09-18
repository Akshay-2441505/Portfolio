import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Draggable, gsap } from '../lib/gsap'

const ITEM_DURATION = 1
// Absolute pixel travel, not a percent-of-own-width — a percent range put
// narrow phone frames (150px) on a much shorter leash than wide browser
// frames (528px), so phone items were still inside the card's clipped
// bounds (and not yet fully faded) when the crossfade should have hidden
// them, leaving a faint "ghost" sliver at the edge. A shared pixel target
// clears any card width for every device.
const TRAVEL_PX = 1600
const AUTOPLAY_INTERVAL_MS = 4200

/** GSAP's own "seamless infinite loop" technique (the canonical
 * demos.gsap.com/demo/infinite-card-slider — ScrollTrigger + Draggable +
 * gsap.utils.wrap()), adapted for a small strip embedded in a project card
 * instead of a full-page pinned gallery: same buildSeamlessLoop timeline
 * trick and drag-driven playhead, but no page-scroll hijack since this
 * isn't the whole viewport. Autoplay steps one image at a time and holds
 * at center (matching the reference's `jump`, not a continuous drift, so
 * each image actually gets a moment before the next one arrives) and is
 * clipped to the card's own bounds so the fan-out doesn't spill into a
 * neighboring project's card. Each image animates through xPercent RANGE →
 * -RANGE while pulsing scale/opacity, so the centered one reads large and
 * sharp and neighbors recede and fade close alongside it. */
type Device = 'phone' | 'browser'

const FRAME_DIMS: Record<Device, { box: string; frame: string; widthPx: number }> = {
  phone: {
    box: 'aspect-[9/19.5] w-[150px]',
    frame: 'rounded-[22px] border-[4px] border-[var(--color-fg)]',
    widthPx: 150,
  },
  browser: {
    box: 'aspect-[16/10] w-[528px]',
    frame: 'rounded-lg border border-[var(--color-border)]',
    widthPx: 528,
  },
}

export function ImageStrip({
  images,
  alt,
  device,
  devices,
}: {
  images: string[]
  alt: string
  /** Fallback used for every image when `devices` doesn't cover it. */
  device: Device
  /** Per-image override, same length/order as `images` — for a project
   * that mixes device types (a mobile app alongside a desktop admin panel,
   * say) so each screenshot gets the frame it actually is. */
  devices?: Device[]
}) {
  const deviceFor = (i: number) => devices?.[i] ?? device
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const dragProxyRef = useRef<HTMLDivElement>(null)
  const jumpTo = useRef<(delta: number) => void>(() => {})
  const setHovering = useRef<(hovering: boolean) => void>(() => {})

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useGSAP(
    () => {
      const track = trackRef.current
      const proxy = dragProxyRef.current
      if (!track || !proxy || prefersReducedMotion) return
      const items = gsap.utils.toArray<HTMLElement>(track.children)
      if (items.length < 2) return

      // Each item repeats every items.length * spacing seconds — that gap
      // must clear ITEM_DURATION or a fresh animateItem tween starts on the
      // same element before its previous instance finishes, fighting it
      // (the reference demo's fixed 0.1 spacing only works because it
      // assumes 12+ items; ours has 3-4, so spacing has to scale to match).
      const spacing = Math.max(0.3, (ITEM_DURATION * 1.2) / items.length)

      const rangeFor = (i: number) => (TRAVEL_PX / FRAME_DIMS[deviceFor(i)].widthPx) * 100

      items.forEach((el, i) => gsap.set(el, { xPercent: rangeFor(i), opacity: 0, scale: 0 }))

      const animateItem = (el: HTMLElement, range: number) => {
        const tl = gsap.timeline()
        tl.set(el, { scale: 0, opacity: 0 })
          .to(
            el,
            {
              // Opacity and scale share the same plateau — spacing packs
              // several of these timelines concurrently (see `overlap`
              // below), so any window where opacity is up but scale isn't
              // shows as a fully-visible-but-shrunken neighbor beside the
              // centered image. Keeping them in lockstep means nothing is
              // visible unless it's also near full size.
              keyframes: {
                '0%': { opacity: 0, scale: 0 },
                '35%': { opacity: 1, scale: 1 },
                '65%': { opacity: 1, scale: 1 },
                '100%': { opacity: 0, scale: 0 },
              },
              zIndex: 10,
              duration: ITEM_DURATION,
              ease: 'power1.inOut',
            },
            0,
          )
          .fromTo(
          el,
          { xPercent: range },
          { xPercent: -range, duration: ITEM_DURATION, ease: 'none', immediateRender: false },
          0,
        )
        return tl
      }

      const overlap = Math.ceil(1 / spacing)
      const startTime = items.length * spacing + 0.5
      const loopTime = (items.length + overlap) * spacing + 1
      const rawSequence = gsap.timeline({ paused: true })
      const seamlessLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat() {
          if (this._time === this._dur) this._tTime += this._dur - 0.01
        },
      })
      const total = items.length + overlap * 2
      for (let i = 0; i < total; i++) {
        const index = i % items.length
        const time = i * spacing
        rawSequence.add(animateItem(items[index], rangeFor(index)), time)
        if (i <= items.length) seamlessLoop.add(`label${i}`, time)
      }
      rawSequence.time(startTime)
      seamlessLoop
        .to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: 'none' })
        .fromTo(
          rawSequence,
          { time: overlap * spacing + 1 },
          { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: 'none' },
        )

      const state = { offset: 0 }
      const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration())
      // Visually, the loop repeats every items.length*spacing (one full
      // rotation through the real images) — keeping state.offset wrapped to
      // that period, rather than letting it grow unbounded, keeps every
      // jump landing in the timeline's well-behaved first segment instead
      // of eventually drifting into the wrap-back segment, where a "hold"
      // can land between two images instead of on one.
      const cyclePeriod = items.length * spacing
      const normalize = gsap.utils.wrap(0, cyclePeriod)
      const render = () => seamlessLoop.time(wrapTime(normalize(state.offset)))

      let hovering = false
      let dragging = false

      const jump = (itemDelta: number) => {
        gsap.killTweensOf(state)
        gsap.to(state, {
          offset: state.offset + itemDelta * spacing,
          duration: 0.6,
          ease: 'power3',
          onUpdate: render,
        })
      }
      jumpTo.current = jump
      setHovering.current = (value) => {
        hovering = value
      }

      // Steps one image at a time and holds there, rather than drifting
      // continuously, so each screenshot actually gets a moment on screen.
      let autoplayTimer: number | null = null
      const scheduleAutoplay = () => {
        if (autoplayTimer) window.clearTimeout(autoplayTimer)
        autoplayTimer = window.setTimeout(() => {
          if (!hovering && !dragging) jump(1)
          scheduleAutoplay()
        }, AUTOPLAY_INTERVAL_MS)
      }
      scheduleAutoplay()

      const draggable = Draggable.create(proxy, {
        type: 'x',
        trigger: track,
        onPress() {
          gsap.killTweensOf(state)
          dragging = true
          this.startOffset = state.offset
        },
        onDrag() {
          state.offset = this.startOffset + (this.startX - this.x) * 0.001
          render()
        },
        onRelease() {
          dragging = false
        },
      })[0]

      return () => {
        if (autoplayTimer) window.clearTimeout(autoplayTimer)
        draggable.kill()
        seamlessLoop.kill()
        rawSequence.kill()
        gsap.killTweensOf(state)
      }
    },
    { scope: rootRef, dependencies: [images.length, device] },
  )

  if (images.length === 0) return null

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setHovering.current(true)}
      onMouseLeave={() => setHovering.current(false)}
    >
      <div className="relative mx-auto flex h-[330px] items-center justify-center overflow-hidden">
        {prefersReducedMotion ? (
          <div className="flex flex-wrap justify-center gap-3">
            {images.map((src, i) => {
              const d = FRAME_DIMS[deviceFor(i)]
              return (
                <div key={src} className={`relative shrink-0 overflow-hidden bg-[var(--color-fg)] ${d.box} ${d.frame}`}>
                  <img src={src} alt={`${alt} — screenshot ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              )
            })}
          </div>
        ) : (
          <ul ref={trackRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {images.map((src, i) => {
              const d = FRAME_DIMS[deviceFor(i)]
              return (
                // GSAP owns this <li>'s transform (xPercent slide, scale,
                // opacity) — any CSS transform placed on it directly would
                // get overwritten the moment GSAP first touches it. The
                // frame's own size and centering live one level down,
                // where GSAP never looks.
                <li key={src} className="absolute top-0 left-0">
                  <div
                    className={`-translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[var(--color-fg)] ${d.box} ${d.frame}`}
                  >
                    <img
                      src={src}
                      alt={`${alt} — screenshot ${i + 1}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {!prefersReducedMotion && images.length > 1 && (
        <>
          <div ref={dragProxyRef} className="invisible absolute" />
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => jumpTo.current(-1)}
              className="rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => jumpTo.current(1)}
              className="rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

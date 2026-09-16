import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'

/** Hero visual, replacing the raymarched chrome blob (ChromeBlobField.tsx)
 * — a quiet, GSAP-driven node network rather than an abstract 3D shape.
 * Reads as either a customer-discovery interview network or a fintech
 * account graph without being a literal chart icon, and unlike every
 * prior attempt at this slot, it's plain SVG/DOM: no WebGL, no per-pixel
 * shader cost, no progressive-enhancement fallback needed at all.
 *
 * Six things happen, layered on top of each other:
 * 1. Entrance — edges draw themselves in (stroke-dashoffset), nodes pop
 *    in right after with a back.out snap.
 * 2. Idle breathing — each node pulses on its own staggered repeat/yoyo
 *    timeline (same convention as FooterMorph's per-letter loop).
 * 3. Cursor-proximity glow — nodes and edges brighten based on actual
 *    distance to the pointer, via gsap.quickTo driven off gsap.ticker
 *    rather than a fresh tween per frame.
 * 4. Traveling signal pulses — small dots riding edge paths via
 *    MotionPathPlugin.
 * 5. Occasional new connections — a dormant edge draws in and an active
 *    one fades out every few seconds, so the graph slowly evolves
 *    instead of looping one fixed shape forever.
 * 6. Shape-shift on hover — the same node/edge topology re-arranges into
 *    a different one of several hand-placed layouts each time the
 *    pointer enters the graph, so it reads as the network reorganizing
 *    itself rather than a static diagram.
 *
 * Node positions are read live from the DOM (each circle's own cx/cy)
 * rather than the static layout constants wherever "current position"
 * matters at runtime (proximity glow, edge redraws) — once #6 exists,
 * the constants only describe each layout's target, not the truth. */

const VIEWBOX_W = 400
const VIEWBOX_H = 260

type NodeId = 'n1' | 'n2' | 'n3' | 'n4' | 'n5' | 'n6' | 'n7' | 'n8'
type EdgeDef = { id: string; a: NodeId; b: NodeId }
type Layout = Record<NodeId, { x: number; y: number }>

const NODE_RADII: Record<NodeId, number> = {
  n1: 5,
  n2: 9,
  n3: 5,
  n4: 7,
  n5: 4,
  n6: 5,
  n7: 4,
  n8: 4,
}
const NODE_IDS = Object.keys(NODE_RADII) as NodeId[]

const EDGES: EdgeDef[] = [
  { id: 'e1', a: 'n1', b: 'n2' },
  { id: 'e2', a: 'n1', b: 'n3' },
  { id: 'e3', a: 'n2', b: 'n4' },
  { id: 'e4', a: 'n2', b: 'n3' },
  { id: 'e5', a: 'n4', b: 'n5' },
  { id: 'e6', a: 'n4', b: 'n6' },
  { id: 'e7', a: 'n3', b: 'n6' },
  { id: 'e8', a: 'n6', b: 'n7' },
  { id: 'e9', a: 'n4', b: 'n7' },
  { id: 'e10', a: 'n1', b: 'n8' },
  { id: 'e11', a: 'n3', b: 'n8' },
  { id: 'e12', a: 'n2', b: 'n5' },
]

const INITIAL_EDGE_IDS = new Set(['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'])

// Same 8 nodes, same edges (topology never changes) — only where each node
// sits changes between these. Hand-placed rather than randomized, so every
// layout still reads as an intentional composition, not a jumble.
const LAYOUTS: Record<string, Layout> = {
  default: {
    n1: { x: 60, y: 95 },
    n2: { x: 165, y: 50 },
    n3: { x: 115, y: 175 },
    n4: { x: 260, y: 95 },
    n5: { x: 335, y: 65 },
    n6: { x: 235, y: 195 },
    n7: { x: 330, y: 175 },
    n8: { x: 35, y: 205 },
  },
  arc: {
    n1: { x: 40, y: 180 },
    n2: { x: 110, y: 90 },
    n3: { x: 190, y: 50 },
    n4: { x: 270, y: 60 },
    n5: { x: 340, y: 110 },
    n6: { x: 320, y: 190 },
    n7: { x: 230, y: 220 },
    n8: { x: 130, y: 210 },
  },
  cluster: {
    n1: { x: 150, y: 80 },
    n2: { x: 205, y: 55 },
    n3: { x: 160, y: 145 },
    n4: { x: 235, y: 105 },
    n5: { x: 255, y: 60 },
    n6: { x: 210, y: 175 },
    n7: { x: 275, y: 150 },
    n8: { x: 110, y: 130 },
  },
  grid: {
    n1: { x: 55, y: 55 },
    n2: { x: 180, y: 55 },
    n3: { x: 305, y: 55 },
    n4: { x: 55, y: 150 },
    n5: { x: 180, y: 150 },
    n6: { x: 305, y: 150 },
    n7: { x: 120, y: 220 },
    n8: { x: 245, y: 220 },
  },
}
const LAYOUT_NAMES = Object.keys(LAYOUTS)

function edgePathD(a: { x: number; y: number }, b: { x: number; y: number }) {
  return `M${a.x},${a.y} L${b.x},${b.y}`
}

export function NetworkGraph() {
  const rootRef = useRef<SVGSVGElement>(null)
  const nodeEls = useRef<Record<string, SVGCircleElement | null>>({})
  const edgeEls = useRef<Record<string, SVGPathElement | null>>({})
  const pointer = useRef({ x: VIEWBOX_W / 2, y: VIEWBOX_H / 2 })
  const currentLayout = useRef('default')

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      // Reads live DOM position rather than a layout constant — after the
      // first hover-triggered shape shift, the constants no longer
      // describe where anything currently is.
      function getNodePos(id: NodeId) {
        const el = nodeEls.current[id]
        if (el) return { x: el.cx.baseVal.value, y: el.cy.baseVal.value }
        return LAYOUTS.default[id]
      }

      // Recomputes one edge's `d` from its endpoints' current positions,
      // and refreshes its dash length to match — otherwise a stale
      // strokeDasharray from before a shape shift (sized for the old,
      // different-length edge) can cut the line off partway along the
      // new one.
      function redrawEdge(edge: EdgeDef) {
        const el = edgeEls.current[edge.id]
        if (!el) return
        el.setAttribute('d', edgePathD(getNodePos(edge.a), getNodePos(edge.b)))
        const len = el.getTotalLength()
        el.setAttribute('stroke-dasharray', String(len))
        el.setAttribute('stroke-dashoffset', '0')
      }

      // ---- Initial states ----
      for (const edge of EDGES) {
        const el = edgeEls.current[edge.id]
        if (!el) continue
        if (INITIAL_EDGE_IDS.has(edge.id)) {
          const len = el.getTotalLength()
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.35 })
        } else {
          gsap.set(el, { opacity: 0 })
        }
      }
      for (const id of NODE_IDS) {
        const el = nodeEls.current[id]
        if (el) gsap.set(el, { scale: prefersReducedMotion ? 1 : 0, transformOrigin: '50% 50%' })
      }

      if (prefersReducedMotion) {
        for (const edge of EDGES) {
          if (!INITIAL_EDGE_IDS.has(edge.id)) continue
          const el = edgeEls.current[edge.id]
          if (el) gsap.set(el, { strokeDashoffset: 0 })
        }
        return
      }

      // ---- 1. Entrance: edges draw in, nodes pop in right after ----
      const entrance = gsap.timeline({ delay: 0.3 })
      const initialEdges = EDGES.filter((e) => INITIAL_EDGE_IDS.has(e.id))
      initialEdges.forEach((edge, i) => {
        const el = edgeEls.current[edge.id]
        if (!el) return
        entrance.to(el, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, i * 0.12)
      })
      NODE_IDS.forEach((id, i) => {
        const el = nodeEls.current[id]
        if (!el) return
        entrance.to(el, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, 0.25 + i * 0.08)
      })

      // ---- 2. Idle breathing, staggered per node ----
      for (const id of NODE_IDS) {
        const el = nodeEls.current[id]
        if (!el) continue
        gsap.to(el, {
          scale: 1.25,
          opacity: 0.75,
          duration: 1.4 + Math.random() * 0.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          repeatDelay: Math.random() * 1.5,
          delay: 1 + Math.random() * 2,
        })
      }

      // ---- 4. Traveling signal pulses along active edges ----
      function launchSignal(edgeId: string) {
        const el = edgeEls.current[edgeId]
        const svg = rootRef.current
        if (!el || !svg) return
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        dot.setAttribute('r', '2.2')
        dot.setAttribute('fill', 'var(--color-fg)')
        svg.appendChild(dot)
        gsap.to(dot, {
          motionPath: { path: el, align: el, alignOrigin: [0.5, 0.5] },
          duration: 1.6 + Math.random() * 0.6,
          ease: 'none',
          onComplete: () => dot.remove(),
        })
      }

      const activeEdgeIds = new Set(INITIAL_EDGE_IDS)
      const signalInterval = window.setInterval(() => {
        const ids = Array.from(activeEdgeIds)
        if (!ids.length) return
        launchSignal(ids[Math.floor(Math.random() * ids.length)])
      }, 900)

      // ---- 5. Occasional new connections forming ----
      const swapInterval = window.setInterval(() => {
        const dormantEdges = EDGES.filter((e) => !activeEdgeIds.has(e.id))
        if (!dormantEdges.length) return
        const incoming = dormantEdges[Math.floor(Math.random() * dormantEdges.length)]
        const activeIds = Array.from(activeEdgeIds)
        const outgoingId = activeIds[Math.floor(Math.random() * activeIds.length)]

        const inEl = edgeEls.current[incoming.id]
        if (inEl) {
          const len = inEl.getTotalLength()
          gsap.set(inEl, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.35 })
          gsap.to(inEl, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' })
          activeEdgeIds.add(incoming.id)
        }
        const outEl = edgeEls.current[outgoingId]
        if (outEl) {
          gsap.to(outEl, { opacity: 0, duration: 0.8, ease: 'power2.in' })
          activeEdgeIds.delete(outgoingId)
        }
      }, 4500)

      // ---- 3. Cursor-proximity glow ----
      const nodeOpacityTo: Record<string, (v: number) => void> = {}
      for (const id of NODE_IDS) {
        const el = nodeEls.current[id]
        if (el) nodeOpacityTo[id] = gsap.quickTo(el, 'opacity', { duration: 0.4 })
      }
      const edgeWidthTo: Record<string, (v: number) => void> = {}
      for (const edge of EDGES) {
        const el = edgeEls.current[edge.id]
        if (el) edgeWidthTo[edge.id] = gsap.quickTo(el, 'strokeWidth', { duration: 0.4 })
      }

      function handleMove(e: PointerEvent) {
        const svg = rootRef.current
        if (!svg) return
        const rect = svg.getBoundingClientRect()
        pointer.current.x = ((e.clientX - rect.left) / rect.width) * VIEWBOX_W
        pointer.current.y = ((e.clientY - rect.top) / rect.height) * VIEWBOX_H
      }
      window.addEventListener('pointermove', handleMove)

      function updateProximity() {
        const { x: px, y: py } = pointer.current
        for (const id of NODE_IDS) {
          const pos = getNodePos(id)
          const dist = Math.hypot(pos.x - px, pos.y - py)
          const proximity = Math.max(0, 1 - dist / 110)
          nodeOpacityTo[id]?.(0.5 + proximity * 0.5)
        }
        for (const edge of EDGES) {
          if (!activeEdgeIds.has(edge.id)) continue
          const a = getNodePos(edge.a)
          const b = getNodePos(edge.b)
          const dist = Math.hypot((a.x + b.x) / 2 - px, (a.y + b.y) / 2 - py)
          const proximity = Math.max(0, 1 - dist / 130)
          edgeWidthTo[edge.id]?.(1 + proximity * 1.2)
        }
      }
      gsap.ticker.add(updateProximity)

      // ---- 6. Shape-shift on hover ----
      function shiftToLayout(name: string) {
        const layout = LAYOUTS[name]
        const tl = gsap.timeline({
          onUpdate: () => {
            for (const edge of EDGES) redrawEdge(edge)
          },
        })
        NODE_IDS.forEach((id) => {
          const el = nodeEls.current[id]
          if (!el) return
          tl.to(el, { attr: { cx: layout[id].x, cy: layout[id].y }, duration: 1.1, ease: 'power2.inOut' }, 0)
        })
      }

      function handleEnter() {
        const options = LAYOUT_NAMES.filter((n) => n !== currentLayout.current)
        const next = options[Math.floor(Math.random() * options.length)]
        currentLayout.current = next
        shiftToLayout(next)
      }

      const svgEl = rootRef.current
      svgEl?.addEventListener('pointerenter', handleEnter)

      return () => {
        window.clearInterval(signalInterval)
        window.clearInterval(swapInterval)
        window.removeEventListener('pointermove', handleMove)
        gsap.ticker.remove(updateProximity)
        svgEl?.removeEventListener('pointerenter', handleEnter)
      }
    },
    { scope: rootRef },
  )

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <g stroke="var(--color-fg)" fill="none" strokeWidth={1}>
        {EDGES.map((edge) => (
          <path
            key={edge.id}
            ref={(el) => {
              edgeEls.current[edge.id] = el
            }}
            d={edgePathD(LAYOUTS.default[edge.a], LAYOUTS.default[edge.b])}
          />
        ))}
      </g>
      <g fill="var(--color-fg)">
        {NODE_IDS.map((id) => (
          <circle
            key={id}
            ref={(el) => {
              nodeEls.current[id] = el
            }}
            cx={LAYOUTS.default[id].x}
            cy={LAYOUTS.default[id].y}
            r={NODE_RADII[id]}
            opacity={0.6}
          />
        ))}
      </g>
    </svg>
  )
}

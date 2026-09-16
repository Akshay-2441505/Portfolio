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
 * Five things happen, layered on top of each other:
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
 *    instead of looping one fixed shape forever. */

const VIEWBOX_W = 400
const VIEWBOX_H = 260

type NodeDef = { id: string; x: number; y: number; r: number }
type EdgeDef = { id: string; a: string; b: string }

const NODES: NodeDef[] = [
  { id: 'n1', x: 60, y: 95, r: 5 },
  { id: 'n2', x: 165, y: 50, r: 9 },
  { id: 'n3', x: 115, y: 175, r: 5 },
  { id: 'n4', x: 260, y: 95, r: 7 },
  { id: 'n5', x: 335, y: 65, r: 4 },
  { id: 'n6', x: 235, y: 195, r: 5 },
  { id: 'n7', x: 330, y: 175, r: 4 },
  { id: 'n8', x: 35, y: 205, r: 4 },
]

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

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!
}

function edgePathD(edge: EdgeDef) {
  const a = nodeById(edge.a)
  const b = nodeById(edge.b)
  return `M${a.x},${a.y} L${b.x},${b.y}`
}

export function NetworkGraph() {
  const rootRef = useRef<SVGSVGElement>(null)
  const nodeEls = useRef<Record<string, SVGCircleElement | null>>({})
  const edgeEls = useRef<Record<string, SVGPathElement | null>>({})
  const pointer = useRef({ x: VIEWBOX_W / 2, y: VIEWBOX_H / 2 })

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

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
      for (const node of NODES) {
        const el = nodeEls.current[node.id]
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
      NODES.forEach((node, i) => {
        const el = nodeEls.current[node.id]
        if (!el) return
        entrance.to(el, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, 0.25 + i * 0.08)
      })

      // ---- 2. Idle breathing, staggered per node ----
      for (const node of NODES) {
        const el = nodeEls.current[node.id]
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
      for (const node of NODES) {
        const el = nodeEls.current[node.id]
        if (el) nodeOpacityTo[node.id] = gsap.quickTo(el, 'opacity', { duration: 0.4 })
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
        for (const node of NODES) {
          const dist = Math.hypot(node.x - px, node.y - py)
          const proximity = Math.max(0, 1 - dist / 110)
          nodeOpacityTo[node.id]?.(0.5 + proximity * 0.5)
        }
        for (const edge of EDGES) {
          if (!activeEdgeIds.has(edge.id)) continue
          const a = nodeById(edge.a)
          const b = nodeById(edge.b)
          const dist = Math.hypot((a.x + b.x) / 2 - px, (a.y + b.y) / 2 - py)
          const proximity = Math.max(0, 1 - dist / 130)
          edgeWidthTo[edge.id]?.(1 + proximity * 1.2)
        }
      }
      gsap.ticker.add(updateProximity)

      return () => {
        window.clearInterval(signalInterval)
        window.clearInterval(swapInterval)
        window.removeEventListener('pointermove', handleMove)
        gsap.ticker.remove(updateProximity)
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
            d={edgePathD(edge)}
          />
        ))}
      </g>
      <g fill="var(--color-fg)">
        {NODES.map((node) => (
          <circle
            key={node.id}
            ref={(el) => {
              nodeEls.current[node.id] = el
            }}
            cx={node.x}
            cy={node.y}
            r={node.r}
            opacity={0.6}
          />
        ))}
      </g>
    </svg>
  )
}

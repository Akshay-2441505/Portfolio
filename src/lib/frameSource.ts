/** A FrameSource paints whatever the hero sequence looks like at a given
 * scroll progress. `proceduralFrameSource` is the placeholder in use today;
 * `createImageFrameSource` is the seam for swapping in a real captured
 * image sequence later — to switch, change one prop in Hero.tsx:
 *   <FrameSequence frameSource={createImageFrameSource([...])} />
 * Nothing else in FrameSequence.tsx or useScrollScrub.ts needs to change. */
export type FrameSource = {
  draw(
    ctx: CanvasRenderingContext2D,
    progress: number,
    width: number,
    height: number,
    t: number,
  ): void
}

const POINT_COUNT = 40
const points = Array.from({ length: POINT_COUNT }, (_, i) => {
  const y = 1 - (i / (POINT_COUNT - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const theta = i * 2.399963 // golden angle
  return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r }
})

const LINK_DISTANCE = 90

export const proceduralFrameSource: FrameSource = {
  draw(ctx, progress, width, height, t) {
    ctx.fillStyle = 'rgba(239, 231, 216, 0.14)' // mirrors --color-bg
    ctx.fillRect(0, 0, width, height)

    const angle = t * 0.15 + progress * Math.PI * 1.5
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const scaleUnit = Math.min(width, height) * 0.32

    const projected = points.map((p) => {
      const rx = p.x * cos - p.z * sin
      const rz = p.x * sin + p.z * cos
      const scale = scaleUnit / (rz + 3)
      return {
        x: width / 2 + rx * scale,
        y: height / 2 + p.y * scale,
        z: rz,
        scale,
      }
    })

    const linkAlpha = 0.05 + progress * 0.35
    ctx.strokeStyle = `rgba(29, 26, 23, ${linkAlpha})` // mirrors --color-fg
    ctx.lineWidth = 1
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x
        const dy = projected[i].y - projected[j].y
        if (Math.sqrt(dx * dx + dy * dy) < LINK_DISTANCE) {
          ctx.beginPath()
          ctx.moveTo(projected[i].x, projected[i].y)
          ctx.lineTo(projected[j].x, projected[j].y)
          ctx.stroke()
        }
      }
    }

    ctx.fillStyle = '#1d1a17' // mirrors --color-fg
    for (const p of projected) {
      const radius = Math.max(1.5, p.scale * 0.03)
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  },
}

export function createImageFrameSource(urls: string[]): FrameSource {
  const images = urls.map((url) => {
    const img = new Image()
    img.src = url
    return img
  })

  return {
    draw(ctx, progress, width, height) {
      const index = Math.min(
        images.length - 1,
        Math.floor(progress * images.length),
      )
      const img = images[index]
      if (!img || !img.complete) return
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
    },
  }
}

/** Shared neon canvas helpers for the 2D games. */
export const NEON = {
  bg: "#0d0820",
  grid: "rgba(255,45,149,0.18)",
  pink: "#ff2d95",
  cyan: "#22e5ff",
  purple: "#b45cff",
  yellow: "#ffe14d",
  red: "#ff5c5c",
  white: "#f5ecff",
}

export function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.fillStyle = NEON.bg
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = NEON.grid
  ctx.lineWidth = 1
  const offset = (time * 30) % 30
  ctx.beginPath()
  for (let y = offset; y < h; y += 30) {
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  for (let x = 0; x < w; x += 30) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
  }
  ctx.stroke()
}

export function glowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 14,
  align: CanvasTextAlign = "center"
) {
  ctx.save()
  ctx.font = `bold ${size}px ui-monospace, "JetBrains Mono", monospace`
  ctx.textAlign = align
  ctx.textBaseline = "middle"
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

export function glowRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

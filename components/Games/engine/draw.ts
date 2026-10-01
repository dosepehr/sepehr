/**
 * Calm game-screen palette: dark charcoal glass with soft, readable colors
 * (all at least 7:1 on the background). No glow, no flicker.
 */
export const SCREEN = {
  bg: "#14171f",
  grid: "rgba(255,255,255,0.045)",
  teal: "#5fd4cc",
  amber: "#f2c25b",
  coral: "#ff8a78",
  lavender: "#a9b4ff",
  white: "#f1f3f8",
}

export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.fillStyle = SCREEN.bg
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = SCREEN.grid
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let y = 30; y < h; y += 30) {
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  for (let x = 30; x < w; x += 30) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
  }
  ctx.stroke()
}

export function drawText(
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
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

export function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

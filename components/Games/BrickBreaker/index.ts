import { drawBackdrop, glowRect, glowText, NEON } from "../engine/draw"
import type { GameDef } from "../engine/types"
import {
  BALL_R,
  BRICK,
  H,
  init,
  PADDLE_H,
  PADDLE_Y,
  step,
  W,
  type BrickState,
} from "./logic"

const ROW_COLORS = [NEON.pink, NEON.purple, NEON.cyan, NEON.yellow]

const BrickBreaker: GameDef<BrickState> = {
  width: W,
  height: H,
  init,
  step,
  render(ctx, state, time) {
    drawBackdrop(ctx, W, H, time * 0.3)
    for (const b of state.bricks) {
      const color =
        b.hp > 1
          ? NEON.white
          : ROW_COLORS[Math.round((b.y - 70) / 20) % ROW_COLORS.length]
      glowRect(ctx, b.x, b.y, BRICK.w, BRICK.h, color)
      glowText(ctx, b.label, b.x + BRICK.w / 2, b.y + BRICK.h / 2 + 1, color, 9)
    }
    ctx.save()
    ctx.shadowColor = NEON.pink
    ctx.shadowBlur = 14
    ctx.fillStyle = NEON.pink
    ctx.fillRect(
      state.paddleX - state.paddleW / 2,
      PADDLE_Y,
      state.paddleW,
      PADDLE_H
    )
    ctx.shadowColor = NEON.cyan
    ctx.fillStyle = NEON.white
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    glowText(ctx, `LVL ${state.level}`, 10, 24, NEON.yellow, 12, "left")
    if (state.ball.stuck)
      glowText(ctx, "SPACE / ↑ TO LAUNCH", W / 2, H / 2 + 60, NEON.cyan, 12)
  },
}

export default BrickBreaker

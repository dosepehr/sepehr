import { drawBackdrop, glowText, NEON } from "../engine/draw"
import type { GameDef } from "../engine/types"
import { CELL, H, init, step, W, type SnakeState } from "./logic"

const NeonSnake: GameDef<SnakeState> = {
  width: W,
  height: H,
  init,
  step,
  render(ctx, state, time) {
    drawBackdrop(ctx, W, H, time * 0.2)
    const pulse = 0.6 + Math.sin(time * 6) * 0.4
    ctx.save()
    ctx.shadowColor = NEON.yellow
    ctx.shadowBlur = 14 * pulse
    ctx.fillStyle = NEON.yellow
    ctx.fillRect(
      state.food.x * CELL + 4,
      state.food.y * CELL + 4,
      CELL - 8,
      CELL - 8
    )
    ctx.restore()
    glowText(
      ctx,
      state.food.label,
      state.food.x * CELL + CELL / 2,
      state.food.y * CELL - 6,
      NEON.yellow,
      9
    )
    state.body.forEach((c, i) => {
      const k = 1 - i / (state.body.length + 4)
      ctx.save()
      ctx.shadowColor = NEON.cyan
      ctx.shadowBlur = i === 0 ? 16 : 8
      ctx.fillStyle =
        i === 0 ? NEON.white : `rgba(34,229,255,${0.35 + k * 0.65})`
      ctx.fillRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4)
      ctx.restore()
    })
  },
}

export default NeonSnake

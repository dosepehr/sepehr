import { drawBackdrop, glowRect, glowText, NEON } from "../engine/draw"
import type { GameDef } from "../engine/types"
import {
  H,
  init,
  PLAYER_W,
  PLAYER_Y,
  step,
  W,
  type TechCatcherState,
} from "./logic"

const TechCatcher: GameDef<TechCatcherState> = {
  width: W,
  height: H,
  init,
  step,
  render(ctx, state, time) {
    drawBackdrop(ctx, W, H, time)
    for (const item of state.items) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(item.x, item.y, 16, 0, Math.PI * 2)
      ctx.fillStyle = item.bug
        ? "rgba(255,92,92,0.15)"
        : "rgba(34,229,255,0.12)"
      ctx.fill()
      ctx.restore()
      glowText(
        ctx,
        item.bug ? `✖ ${item.label}` : item.label,
        item.x,
        item.y,
        item.bug ? NEON.red : NEON.cyan,
        12
      )
    }
    glowRect(
      ctx,
      state.playerX - PLAYER_W / 2,
      PLAYER_Y - 6,
      PLAYER_W,
      12,
      NEON.pink
    )
    if (state.combo > 1)
      glowText(
        ctx,
        `x${state.combo}`,
        state.playerX,
        PLAYER_Y + 20,
        NEON.yellow,
        11
      )
  },
}

export default TechCatcher

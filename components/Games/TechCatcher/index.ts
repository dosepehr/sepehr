import { drawBackdrop, drawText, SCREEN } from "../engine/draw"
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
  render(ctx, state) {
    drawBackdrop(ctx, W, H)
    for (const item of state.items) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(item.x, item.y, 17, 0, Math.PI * 2)
      ctx.fillStyle = item.bug
        ? "rgba(255,138,120,0.18)"
        : "rgba(95,212,204,0.16)"
      ctx.fill()
      ctx.restore()
      drawText(
        ctx,
        item.bug ? `✖ ${item.label}` : item.label,
        item.x,
        item.y,
        item.bug ? SCREEN.coral : SCREEN.teal,
        14
      )
    }
    ctx.fillStyle = SCREEN.white
    ctx.fillRect(state.playerX - PLAYER_W / 2, PLAYER_Y - 6, PLAYER_W, 12)
    if (state.combo > 1)
      drawText(
        ctx,
        `x${state.combo}`,
        state.playerX,
        PLAYER_Y + 22,
        SCREEN.amber,
        13
      )
  },
}

export default TechCatcher

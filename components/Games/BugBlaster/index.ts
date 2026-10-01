import { drawBackdrop, drawBox, drawText, SCREEN } from "../engine/draw"
import type { GameDef } from "../engine/types"
import {
  BOSS_LABEL,
  BOSS_W,
  H,
  init,
  PLAYER_Y,
  step,
  W,
  type BugBlasterState,
} from "./logic"

const BugBlaster: GameDef<BugBlasterState> = {
  width: W,
  height: H,
  init,
  step,
  render(ctx, state, time) {
    drawBackdrop(ctx, W, H)
    for (const enemy of state.enemies)
      drawText(ctx, enemy.label, enemy.x, enemy.y, SCREEN.lavender, 15)
    if (state.boss) {
      drawBox(
        ctx,
        state.boss.x - BOSS_W / 2,
        state.boss.y - 15,
        BOSS_W,
        30,
        SCREEN.coral
      )
      drawText(ctx, BOSS_LABEL, state.boss.x, state.boss.y, SCREEN.coral, 15)
      ctx.fillStyle = SCREEN.coral
      ctx.fillRect(
        20,
        16,
        ((W - 40) * state.boss.hp) / (30 + state.wave * 4),
        4
      )
    }
    for (const shot of state.shots)
      drawText(ctx, ";", shot.x, shot.y, SCREEN.teal, 20)
    for (const shot of state.enemyShots)
      drawText(ctx, "!", shot.x, shot.y, SCREEN.amber, 16)
    const blink = state.invulnerable > 0 && Math.floor(time * 12) % 2 === 0
    if (!blink) {
      ctx.fillStyle = SCREEN.white
      ctx.beginPath()
      ctx.moveTo(state.playerX, PLAYER_Y - 12)
      ctx.lineTo(state.playerX + 14, PLAYER_Y + 8)
      ctx.lineTo(state.playerX - 14, PLAYER_Y + 8)
      ctx.closePath()
      ctx.fill()
    }
    drawText(ctx, `WAVE ${state.wave}`, W - 12, H - 12, SCREEN.white, 12, "right")
  },
}

export default BugBlaster

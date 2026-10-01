import { drawBackdrop, glowRect, glowText, NEON } from "../engine/draw"
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
    drawBackdrop(ctx, W, H, time)
    for (const enemy of state.enemies)
      glowText(ctx, enemy.label, enemy.x, enemy.y, NEON.purple, 13)
    if (state.boss) {
      glowRect(
        ctx,
        state.boss.x - BOSS_W / 2,
        state.boss.y - 15,
        BOSS_W,
        30,
        NEON.red
      )
      glowText(ctx, BOSS_LABEL, state.boss.x, state.boss.y, NEON.red, 14)
      ctx.fillStyle = NEON.red
      ctx.fillRect(
        20,
        16,
        ((W - 40) * state.boss.hp) / (30 + state.wave * 4),
        4
      )
    }
    for (const shot of state.shots)
      glowText(ctx, ";", shot.x, shot.y, NEON.cyan, 18)
    for (const shot of state.enemyShots)
      glowText(ctx, "!", shot.x, shot.y, NEON.yellow, 14)
    const blink = state.invulnerable > 0 && Math.floor(time * 12) % 2 === 0
    if (!blink) {
      ctx.save()
      ctx.shadowColor = NEON.pink
      ctx.shadowBlur = 12
      ctx.fillStyle = NEON.pink
      ctx.beginPath()
      ctx.moveTo(state.playerX, PLAYER_Y - 12)
      ctx.lineTo(state.playerX + 14, PLAYER_Y + 8)
      ctx.lineTo(state.playerX - 14, PLAYER_Y + 8)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    glowText(ctx, `WAVE ${state.wave}`, W - 12, H - 12, NEON.white, 10, "right")
  },
}

export default BugBlaster

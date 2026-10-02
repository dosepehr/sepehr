import { drawBackdrop, glowText, NEON } from "../engine/draw"
import type { GameDef } from "../engine/types"
import {
  BALL,
  CPU_Y,
  H,
  init,
  PAD_H,
  PAD_W,
  PLAYER_Y,
  step,
  W,
  type PongState,
} from "./logic"

const PixelPong: GameDef<PongState> = {
  width: W,
  height: H,
  init,
  step,
  render(ctx, state, time) {
    drawBackdrop(ctx, W, H, time * 0.1)
    ctx.save()
    ctx.setLineDash([8, 8])
    ctx.strokeStyle = "rgba(245,236,255,0.25)"
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()
    ctx.restore()
    glowText(ctx, String(state.cpuScore), W - 24, H / 2 - 24, NEON.purple, 26)
    glowText(ctx, String(state.playerScore), W - 24, H / 2 + 26, NEON.cyan, 26)
    const pad = (x: number, y: number, c: string) => {
      ctx.save()
      ctx.shadowColor = c
      ctx.shadowBlur = 14
      ctx.fillStyle = c
      ctx.fillRect(x - PAD_W / 2, y, PAD_W, PAD_H)
      ctx.restore()
    }
    pad(state.cpu, CPU_Y, NEON.purple)
    pad(state.player, PLAYER_Y, NEON.cyan)
    ctx.save()
    ctx.shadowColor = NEON.yellow
    ctx.shadowBlur = 16
    ctx.fillStyle = NEON.yellow
    ctx.fillRect(state.ball.x - BALL / 2, state.ball.y - BALL / 2, BALL, BALL)
    ctx.restore()
    glowText(ctx, "CPU", 24, CPU_Y + 30, NEON.purple, 10)
    glowText(ctx, "YOU", 24, PLAYER_Y - 16, NEON.cyan, 10)
  },
}

export default PixelPong

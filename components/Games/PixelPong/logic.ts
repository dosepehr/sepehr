import { rand } from "../engine/random"
import type { BaseState, InputState } from "../engine/types"

export const W = 360
export const H = 540
export const PAD_W = 70
export const PAD_H = 10
export const BALL = 8
export const PLAYER_Y = H - 30
export const CPU_Y = 20
const WIN = 7

export type PongState = BaseState & {
  player: number
  cpu: number
  ball: { x: number; y: number; vx: number; vy: number }
  cpuScore: number
  playerScore: number
  serveIn: number
  rally: number
}

function serve(
  seed: number,
  towardPlayer: boolean
): [PongState["ball"], number] {
  let r: number
  ;[r, seed] = rand(seed)
  const vx = (r - 0.5) * 300
  return [{ x: W / 2, y: H / 2, vx, vy: towardPlayer ? 260 : -260 }, seed]
}

export function init(seed: number): PongState {
  const [ball, next] = serve(seed, true)
  return {
    status: "playing",
    score: 0,
    lives: WIN,
    seed: next,
    events: [],
    player: W / 2,
    cpu: W / 2,
    ball,
    cpuScore: 0,
    playerScore: 0,
    serveIn: 1,
    rally: 0,
  }
}

export function step(
  state: PongState,
  input: InputState,
  dt: number
): PongState {
  if (state.status === "over") return { ...state, events: [] }
  const events: PongState["events"] = []
  let { seed, cpuScore, playerScore, serveIn, rally, score, lives } = state
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const player = Math.max(
    PAD_W / 2,
    Math.min(W - PAD_W / 2, state.player + dir * 400 * dt)
  )
  // The CPU is good, not perfect: capped speed and a little lag.
  const cpuSpeed = 230 + playerScore * 15
  const target = state.ball.vy < 0 ? state.ball.x : W / 2
  const cpu =
    state.cpu +
    Math.max(-cpuSpeed * dt, Math.min(cpuSpeed * dt, target - state.cpu))

  if (serveIn > 0) {
    return { ...state, player, cpu, serveIn: serveIn - dt, events }
  }
  const ball = { ...state.ball }
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt
  if (ball.x < BALL / 2 || ball.x > W - BALL / 2) {
    ball.vx *= -1
    ball.x = Math.max(BALL / 2, Math.min(W - BALL / 2, ball.x))
  }
  const paddle = (px: number, py: number, down: boolean) => {
    const inY = down
      ? ball.y + BALL / 2 >= py && ball.y < py + PAD_H
      : ball.y - BALL / 2 <= py + PAD_H && ball.y > py
    if (!inY || Math.abs(ball.x - px) > PAD_W / 2 + BALL / 2) return false
    const speed = Math.min(620, Math.hypot(ball.vx, ball.vy) * 1.06)
    const angle = ((ball.x - px) / (PAD_W / 2)) * 0.9
    ball.vx = Math.sin(angle) * speed
    ball.vy = (down ? -1 : 1) * Math.cos(angle) * speed
    ball.y = down ? py - BALL / 2 : py + PAD_H + BALL / 2
    events.push({ type: "hit" })
    return true
  }
  if (ball.vy > 0 && paddle(player, PLAYER_Y, true)) {
    rally += 1
    score += rally * 5
  }
  if (ball.vy < 0) paddle(cpu, CPU_Y, false)

  let next = ball
  if (ball.y < -BALL) {
    playerScore += 1
    score += 100
    rally = 0
    events.push({ type: "catch", label: "" })
    ;[next, seed] = serve(seed, false)
    serveIn = 0.8
  } else if (ball.y > H + BALL) {
    cpuScore += 1
    lives -= 1
    rally = 0
    events.push({ type: "lose" })
    ;[next, seed] = serve(seed, true)
    serveIn = 0.8
  }
  const over = playerScore >= WIN || cpuScore >= WIN
  if (over && playerScore >= WIN) score += 500
  return {
    ...state,
    status: over ? "over" : "playing",
    player,
    cpu,
    ball: next,
    seed,
    cpuScore,
    playerScore,
    serveIn,
    rally,
    score,
    lives,
    events,
  }
}

import { rand } from "../engine/random"
import type { BaseState, InputState } from "../engine/types"

export const W = 360
export const H = 540
export const PADDLE_Y = H - 36
export const PADDLE_H = 10
export const BALL_R = 6
const COLS = 8
const BRICK_W = 40
const BRICK_H = 16
const GAP = 4
const TOP = 70

export type Brick = { x: number; y: number; hp: number; label: string }

export type BrickState = BaseState & {
  paddleX: number
  paddleW: number
  ball: { x: number; y: number; vx: number; vy: number; stuck: boolean }
  bricks: Brick[]
  level: number
}

// Every brick is a bit of legacy code.
const LEGACY = [
  "jQ",
  "IE6",
  "var",
  "eval",
  "XHR",
  "goto",
  "any",
  "TODO",
  "FIXME",
  "!imp",
]

function makeBricks(level: number, seed: number): [Brick[], number] {
  const bricks: Brick[] = []
  let r: number
  const rows = Math.min(8, 4 + level)
  const left = (W - (COLS * BRICK_W + (COLS - 1) * GAP)) / 2
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < COLS; col++) {
      ;[r, seed] = rand(seed)
      if (level > 1 && r < 0.12) continue
      ;[r, seed] = rand(seed)
      bricks.push({
        x: left + col * (BRICK_W + GAP),
        y: TOP + row * (BRICK_H + GAP),
        hp: row < level - 1 ? 2 : 1,
        label: LEGACY[Math.floor(r * LEGACY.length)],
      })
    }
  return [bricks, seed]
}

export function init(seed: number): BrickState {
  const [bricks, next] = makeBricks(1, seed)
  return {
    status: "playing",
    score: 0,
    lives: 3,
    seed: next,
    events: [],
    paddleX: W / 2,
    paddleW: 70,
    ball: { x: W / 2, y: PADDLE_Y - 12, vx: 150, vy: -300, stuck: true },
    bricks,
    level: 1,
  }
}

export function step(
  state: BrickState,
  input: InputState,
  dt: number
): BrickState {
  if (state.status === "over") return { ...state, events: [] }
  const events: BrickState["events"] = []
  let { lives, score, seed, level, bricks } = state
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const half = state.paddleW / 2
  const paddleX = Math.max(
    half,
    Math.min(W - half, state.paddleX + dir * 380 * dt)
  )
  let ball = { ...state.ball }

  if (ball.stuck) {
    ball.x = paddleX
    ball.y = PADDLE_Y - BALL_R - 2
    if (input.fire || input.up) {
      ball.stuck = false
      events.push({ type: "shoot" })
    }
    return { ...state, paddleX, ball, events }
  }

  ball.x += ball.vx * dt
  ball.y += ball.vy * dt
  if (ball.x < BALL_R || ball.x > W - BALL_R) {
    ball.vx *= -1
    ball.x = Math.max(BALL_R, Math.min(W - BALL_R, ball.x))
  }
  if (ball.y < BALL_R) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }
  // Paddle: the hit position steers the bounce.
  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
    Math.abs(ball.x - paddleX) <= half + BALL_R
  ) {
    const speed = Math.min(560, Math.hypot(ball.vx, ball.vy) * 1.02)
    const offset = (ball.x - paddleX) / half
    const angle = offset * 1.05
    ball.vx = Math.sin(angle) * speed
    ball.vy = -Math.cos(angle) * speed
    ball.y = PADDLE_Y - BALL_R
    events.push({ type: "hit" })
  }

  const next: Brick[] = []
  let bounced = false
  for (const b of bricks) {
    const hit =
      !bounced &&
      ball.x + BALL_R > b.x &&
      ball.x - BALL_R < b.x + BRICK_W &&
      ball.y + BALL_R > b.y &&
      ball.y - BALL_R < b.y + BRICK_H
    if (!hit) {
      next.push(b)
      continue
    }
    bounced = true
    const overlapX = Math.min(
      ball.x + BALL_R - b.x,
      b.x + BRICK_W - (ball.x - BALL_R)
    )
    const overlapY = Math.min(
      ball.y + BALL_R - b.y,
      b.y + BRICK_H - (ball.y - BALL_R)
    )
    if (overlapX < overlapY) ball.vx *= -1
    else ball.vy *= -1
    if (b.hp > 1) next.push({ ...b, hp: b.hp - 1 })
    else {
      score += 10 * level
      events.push({ type: "explode" })
    }
  }
  bricks = next

  if (ball.y - BALL_R > H) {
    lives -= 1
    events.push({ type: "hit" })
    ball = { x: paddleX, y: PADDLE_Y - 12, vx: 150, vy: -300, stuck: true }
  }
  if (bricks.length === 0) {
    level += 1
    score += 250
    ;[bricks, seed] = makeBricks(level, seed)
    ball = {
      x: paddleX,
      y: PADDLE_Y - 12,
      vx: 160,
      vy: -300 - level * 20,
      stuck: true,
    }
    events.push({ type: "catch", label: "" })
  }
  const status = lives <= 0 ? "over" : "playing"
  if (status === "over") events.push({ type: "lose" })
  return {
    ...state,
    status,
    lives,
    score,
    seed,
    level,
    bricks,
    ball,
    paddleX,
    events,
  }
}

export const BRICK = { w: BRICK_W, h: BRICK_H }

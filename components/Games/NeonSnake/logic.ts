import { rand } from "../engine/random"
import type { BaseState, InputState } from "../engine/types"

export const COLS = 18
export const ROWS = 24
export const CELL = 20
export const W = COLS * CELL
export const H = ROWS * CELL

type Cell = { x: number; y: number }
type Dir = "up" | "down" | "left" | "right"

export type SnakeState = BaseState & {
  body: Cell[]
  dir: Dir
  next: Dir
  food: Cell & { label: string }
  tick: number
  speed: number
  time: number
}

// Snacks are packages; eating one grows the bundle.
const SNACKS = ["npm", "zod", "tsx", "vite", "rx", "css", "api", "git"]

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
}
const DELTA: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function placeFood(body: Cell[], seed: number): [SnakeState["food"], number] {
  let r: number
  for (let i = 0; i < 200; i++) {
    ;[r, seed] = rand(seed)
    const x = Math.floor(r * COLS)
    ;[r, seed] = rand(seed)
    const y = Math.floor(r * ROWS)
    if (!body.some((c) => c.x === x && c.y === y)) {
      ;[r, seed] = rand(seed)
      return [{ x, y, label: SNACKS[Math.floor(r * SNACKS.length)] }, seed]
    }
  }
  return [{ x: 0, y: 0, label: "npm" }, seed]
}

export function init(seed: number): SnakeState {
  const body = [
    { x: 6, y: 12 },
    { x: 5, y: 12 },
    { x: 4, y: 12 },
  ]
  const [food, next] = placeFood(body, seed)
  return {
    status: "playing",
    score: 0,
    lives: 1,
    seed: next,
    events: [],
    body,
    dir: "right",
    next: "right",
    food,
    tick: 0,
    speed: 8,
    time: 0,
  }
}

export function step(
  state: SnakeState,
  input: InputState,
  dt: number
): SnakeState {
  if (state.status === "over") return { ...state, events: [] }
  const events: SnakeState["events"] = []
  let { next, tick, seed, food, score, speed } = state
  const wanted: Dir | null = input.up
    ? "up"
    : input.down
      ? "down"
      : input.left
        ? "left"
        : input.right
          ? "right"
          : null
  if (wanted && wanted !== OPPOSITE[state.dir]) next = wanted

  tick += dt
  const interval = 1 / speed
  if (tick < interval)
    return { ...state, next, tick, time: state.time + dt, events }
  tick -= interval

  const dir = next
  const head = state.body[0]
  // Walls wrap around: it's a torus, like the old Nokia ones.
  const nh = {
    x: (head.x + DELTA[dir].x + COLS) % COLS,
    y: (head.y + DELTA[dir].y + ROWS) % ROWS,
  }
  const ate = nh.x === food.x && nh.y === food.y
  const body = [nh, ...state.body.slice(0, ate ? undefined : -1)]
  if (body.slice(1).some((c) => c.x === nh.x && c.y === nh.y)) {
    events.push({ type: "lose" })
    return { ...state, status: "over", lives: 0, events }
  }
  if (ate) {
    score += 10 * body.length
    speed = Math.min(18, speed + 0.4)
    events.push({ type: "catch", label: food.label })
    ;[food, seed] = placeFood(body, seed)
  }
  return {
    ...state,
    body,
    dir,
    next,
    tick,
    food,
    seed,
    score,
    speed,
    time: state.time + dt,
    events,
  }
}

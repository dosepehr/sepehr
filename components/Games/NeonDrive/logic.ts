import { rand } from "../engine/random"
import type { BaseState, InputState } from "../engine/types"

export const LANES = [-2, 0, 2]
export const SPAWN_Z = -80
export const PLAYER_Z = 0
export const MAX_OBSTACLES = 40

export type Obstacle = { lane: number; z: number }

export type NeonDriveState = BaseState & {
  lane: number
  /** Smoothed x position of the car, for rendering. */
  x: number
  speed: number
  distance: number
  obstacles: Obstacle[]
  spawnIn: number
  /** Edge-triggered lane change: wait for key release. */
  latch: boolean
}

export function init(seed: number): NeonDriveState {
  return {
    status: "playing",
    score: 0,
    lives: 1,
    seed,
    events: [],
    lane: 1,
    x: 0,
    speed: 22,
    distance: 0,
    obstacles: [],
    spawnIn: 1,
    latch: false,
  }
}

export function step(state: NeonDriveState, input: InputState, dt: number): NeonDriveState {
  if (state.status === "over") return { ...state, events: [] }
  const events: NeonDriveState["events"] = []
  let { lane, latch, seed, spawnIn } = state

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  if (dir !== 0 && !latch) {
    lane = Math.max(0, Math.min(2, lane + dir))
    latch = true
  } else if (dir === 0) {
    latch = false
  }
  const x = state.x + (LANES[lane] - state.x) * Math.min(1, dt * 14)
  const speed = Math.min(70, state.speed + dt * 0.8)
  const distance = state.distance + speed * dt

  let obstacles = state.obstacles
    .map((o) => ({ ...o, z: o.z + speed * dt }))
    .filter((o) => o.z < 6)

  spawnIn -= dt
  if (spawnIn <= 0 && obstacles.length < MAX_OBSTACLES) {
    let r: number
    ;[r, seed] = rand(seed)
    const free = Math.floor(r * 3)
    ;[r, seed] = rand(seed)
    // One or two blocked lanes, never all three.
    const blocked = r < 0.4 ? [0, 1, 2].filter((l) => l !== free) : [(free + 1) % 3]
    obstacles = [...obstacles, ...blocked.map((l) => ({ lane: l, z: SPAWN_Z }))]
    spawnIn = Math.max(0.45, 1.3 - speed / 80)
  }

  const crashed = obstacles.some((o) => Math.abs(o.z - PLAYER_Z) < 1.1 && Math.abs(LANES[o.lane] - x) < 1.2)
  const status = crashed ? "over" : "playing"
  if (crashed) events.push({ type: "explode" }, { type: "lose" })

  return {
    ...state,
    status,
    lives: crashed ? 0 : 1,
    score: Math.floor(distance),
    seed,
    events,
    lane,
    latch,
    x,
    speed,
    distance,
    obstacles,
    spawnIn,
  }
}

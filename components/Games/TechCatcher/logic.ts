import { rand } from "../engine/random"
import type { BaseState, InputState } from "../engine/types"

export const W = 360
export const H = 540
export const PLAYER_Y = H - 40
export const PLAYER_W = 64
const ITEM_R = 16

// Names match lib/content/profile.ts skills, so a catch unlocks that skill.
export const TECH = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Three.js",
  "Node.js",
  "PostgreSQL",
  "GraphQL",
  "Docker",
  "Git",
]
export const BUGS = ["bug", "NaN", "null"]

export type Item = {
  x: number
  y: number
  vy: number
  label: string
  bug: boolean
}

export type TechCatcherState = BaseState & {
  playerX: number
  items: Item[]
  spawnIn: number
  time: number
  combo: number
}

export function init(seed: number): TechCatcherState {
  return {
    status: "playing",
    score: 0,
    lives: 3,
    seed,
    events: [],
    playerX: W / 2,
    items: [],
    spawnIn: 0.6,
    time: 0,
    combo: 0,
  }
}

export function step(
  state: TechCatcherState,
  input: InputState,
  dt: number
): TechCatcherState {
  if (state.status === "over") return { ...state, events: [] }
  const events: TechCatcherState["events"] = []
  let { seed, score, lives, combo, spawnIn } = state
  const time = state.time + dt
  const difficulty = 1 + time / 40

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const playerX = Math.max(
    PLAYER_W / 2,
    Math.min(W - PLAYER_W / 2, state.playerX + dir * 320 * dt)
  )

  const items: Item[] = []
  for (const item of state.items) {
    const y = item.y + item.vy * dt
    const caught =
      y + ITEM_R >= PLAYER_Y - 6 &&
      y - ITEM_R <= PLAYER_Y + 6 &&
      Math.abs(item.x - playerX) <= PLAYER_W / 2 + ITEM_R / 2
    if (caught) {
      if (item.bug) {
        lives -= 1
        combo = 0
        events.push({ type: "hit" })
      } else {
        combo += 1
        score += 25 + Math.min(combo, 10) * 5
        events.push({ type: "catch", label: item.label })
      }
      continue
    }
    if (y - ITEM_R > H) {
      if (!item.bug) combo = 0
      continue
    }
    items.push({ ...item, y })
  }

  spawnIn -= dt
  if (spawnIn <= 0) {
    let r: number
    ;[r, seed] = rand(seed)
    const bug = r < 0.28
    ;[r, seed] = rand(seed)
    const pool = bug ? BUGS : TECH
    const label = pool[Math.floor(r * pool.length)]
    ;[r, seed] = rand(seed)
    // Keep long labels (e.g. "PostgreSQL") inside the canvas.
    const x = 44 + r * (W - 88)
    ;[r, seed] = rand(seed)
    items.push({ x, y: -ITEM_R, vy: (110 + r * 70) * difficulty, label, bug })
    spawnIn = Math.max(0.28, 0.9 / difficulty)
  }

  const status = lives <= 0 ? "over" : "playing"
  if (status === "over") events.push({ type: "lose" })
  return {
    ...state,
    status,
    score,
    lives,
    combo,
    seed,
    items,
    playerX,
    spawnIn,
    time,
    events,
  }
}

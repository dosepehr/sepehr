import type { PanelId } from "@/lib/store/stage"
import type { PowerUpId } from "@/lib/store/mario"

export type V3 = [number, number, number]

/** Axis-aligned solid box. Everything you can stand on or bump into. */
export type Solid = { min: V3; max: V3; kind: SolidKind; id?: string }
export type SolidKind =
  "ground" | "block" | "pipe" | "stair" | "cloud" | "wall" | "prop"

export type BlockContent =
  | { type: "panel"; panel: PanelId; label: string }
  | { type: "coin" }
  | { type: "skill"; skill: string; level: number }
  | { type: "powerup"; id: PowerUpId }
  | { type: "empty" }

export type BlockDef = {
  id: string
  /** Center x/z, bottom y. Blocks are 1×1×1. */
  position: V3
  look: "question" | "brick" | "hidden"
  content: BlockContent
}

export type PipeDef = {
  id: string
  position: V3
  height: number
  color: string
  /** Project slug, or "secret" / "exit" for the bonus-room pipes. */
  target: string
  label: string
}

export const BLOCK = 1
export const UNDERGROUND_Y = -40
export const KILL_Y = -8

/** Ground islands: [x0, x1]. All span z ∈ [-12, 12] with the top at y = 0. */
export const ISLANDS: [number, number][] = [
  [-16, 30],
  [33, 60],
  [62.5, 112],
]

export const CHECKPOINTS: V3[] = [
  [0, 0, 2],
  [35, 0, 2],
  [64, 0, 2],
]

export const SPAWN: V3 = [0, 0, 2]
export const SECRET_PIPE: V3 = [-11, 0, 8]
export const BONUS_EXIT: V3 = [15, UNDERGROUND_Y, 0]
export const WELCOME_SIGN: V3 = [0, 0, -7]
export const GAME_HOUSE: V3 = [22, 0, -8]
export const BLOG_BOARD: V3 = [56, 0, -6]
export const STAIRS_X = 70
export const STAIRS_STEPS = 8
export const CLOUD_PLATFORM = { x0: 79.5, x1: 82.5, y: 9.5 }
export const FLAGPOLE: V3 = [86, 0, 0]
export const FLAG_HEIGHT = 11
export const CASTLE: V3 = [97, 0, -1]
export const COSTUME_BOX: V3 = [-7, 0, -3]

export const ZONES: { from: number; name: string }[] = [
  { from: -999, name: "1-1" },
  { from: 10, name: "1-2" },
  { from: 33, name: "1-3" },
  { from: 62.5, name: "1-4" },
  { from: 84, name: "1-5" },
]

export const POWERUP_SPOTS: { id: PowerUpId; position: V3 }[] = [
  { id: "one-up", position: [3.5, 0.5, -10.5] },
  { id: "super-star", position: [7, UNDERGROUND_Y + 2.6, 0] },
  { id: "cloud-coin", position: [81, CLOUD_PLATFORM.y + 0.7, 0] },
  { id: "golden-key", position: [97, 0.6, -6.6] },
]

export type LevelInput = {
  projects: { slug: string; title: string; color: string }[]
  skills: { name: string; level: number }[]
  experience: { company: string; role: string; period: string }[]
}

export function buildLevel(input: LevelInput) {
  const solids: Solid[] = []
  const box = (min: V3, max: V3, kind: SolidKind, id?: string) =>
    solids.push({ min, max, kind, id })

  for (const [x0, x1] of ISLANDS) box([x0, -3, -12], [x1, 0, 12], "ground")
  // Plank bridge over the first pit, brick hop over the second.
  box([30, -0.3, -9], [33, 0, -7], "ground", "bridge")
  box([60.6, 0.6, -1], [62.4, 1.2, 1], "block", "hop")

  // ---- ? blocks, bricks and the hidden block.
  const blocks: BlockDef[] = [
    {
      id: "q-about",
      position: [4, 3.2, 0],
      look: "question",
      content: { type: "panel", panel: "about", label: "About" },
    },
    {
      id: "b-1",
      position: [5, 3.2, 0],
      look: "brick",
      content: { type: "empty" },
    },
    {
      id: "q-coin",
      position: [6, 3.2, 0],
      look: "question",
      content: { type: "coin" },
    },
    {
      id: "b-2",
      position: [7, 3.2, 0],
      look: "brick",
      content: { type: "empty" },
    },
    {
      id: "q-resume",
      position: [8, 3.2, 0],
      look: "question",
      content: { type: "panel", panel: "resume", label: "Resume" },
    },
    {
      id: "hidden",
      position: [-4, 3.2, 0],
      look: "hidden",
      content: { type: "powerup", id: "mystery-mushroom" },
    },
    {
      id: "q-blog",
      position: [47.5, 3.6, 3],
      look: "question",
      content: { type: "panel", panel: "blog", label: "Blog" },
    },
    {
      id: "q-skills",
      position: [11.5, 3.2, 0],
      look: "question",
      content: { type: "panel", panel: "skills", label: "Skills" },
    },
  ]
  input.skills.slice(0, 10).forEach((s, i) =>
    blocks.push({
      id: `skill-${i}`,
      position: [13.5 + i * 1.6, i % 2 ? 4.4 : 3.2, 0],
      look: "brick",
      content: { type: "skill", skill: s.name, level: s.level },
    })
  )
  for (const b of blocks) {
    const [x, y, z] = b.position
    box([x - 0.5, y, z - 0.5], [x + 0.5, y + 1, z + 0.5], "block", b.id)
  }

  // ---- Warp pipes: one per project, plus the secret pair.
  const heights = [2.2, 3.4, 2.7, 3, 2.4]
  const pipes: PipeDef[] = input.projects.map((p, i) => ({
    id: `pipe-${p.slug}`,
    position: [37 + i * 7, 0, 0] as V3,
    height: heights[i % heights.length],
    color: p.color,
    target: p.slug,
    label: p.title,
  }))
  pipes.push(
    {
      id: "pipe-secret",
      position: SECRET_PIPE,
      height: 1.3,
      color: "#43b047",
      target: "secret",
      label: "???",
    },
    {
      id: "pipe-exit",
      position: BONUS_EXIT,
      height: 1.6,
      color: "#43b047",
      target: "exit",
      label: "Exit",
    }
  )
  for (const p of pipes) {
    const [x, y, z] = p.position
    box([x - 1, y, z - 1], [x + 1, y + p.height, z + 1], "pipe", p.id)
  }
  const tallest = pipes
    .filter((p) => !["secret", "exit"].includes(p.target))
    .reduce((a, b) => (b.height > a.height ? b : a), pipes[0])

  // ---- Experience staircase.
  for (let k = 0; k < STAIRS_STEPS; k++)
    box(
      [STAIRS_X + k, 0, -1.5],
      [STAIRS_X + k + 1, k + 1, 1.5],
      "stair",
      `step-${k}`
    )
  const jobs = [...input.experience].reverse()
  const milestones = [
    { step: 0, title: "Hello, world", sub: "Player 1 joins" },
    ...jobs.map((j, i) => ({
      step: Math.round(
        2 + (i * (STAIRS_STEPS - 4)) / Math.max(1, jobs.length - 1)
      ),
      title: j.company,
      sub: `${j.role} · ${j.period}`,
    })),
    { step: STAIRS_STEPS - 1, title: "Your team?", sub: "Next level" },
  ]
  box(
    [CLOUD_PLATFORM.x0, CLOUD_PLATFORM.y - 0.4, -1.2],
    [CLOUD_PLATFORM.x1, CLOUD_PLATFORM.y, 1.2],
    "cloud",
    "cloud"
  )

  // ---- Landmarks.
  box(
    [FLAGPOLE[0] - 0.5, 0, -0.5],
    [FLAGPOLE[0] + 0.5, 1, 0.5],
    "block",
    "flag-base"
  )
  box(
    [CASTLE[0] - 4, 0, CASTLE[2] - 3],
    [CASTLE[0] + 4, 5, CASTLE[2] + 3],
    "wall",
    "castle"
  )
  box(
    [GAME_HOUSE[0] - 2.2, 0, GAME_HOUSE[2] - 2],
    [GAME_HOUSE[0] + 2.2, 3, GAME_HOUSE[2] + 2],
    "wall",
    "house"
  )
  box(
    [WELCOME_SIGN[0] - 5, 0, WELCOME_SIGN[2] - 0.3],
    [WELCOME_SIGN[0] + 5, 1.2, WELCOME_SIGN[2] + 0.3],
    "prop",
    "sign"
  )
  box(
    [BLOG_BOARD[0] - 1.6, 0, BLOG_BOARD[2] - 0.3],
    [BLOG_BOARD[0] + 1.6, 1, BLOG_BOARD[2] + 0.3],
    "prop",
    "board"
  )
  box(
    [COSTUME_BOX[0] - 0.5, 0, COSTUME_BOX[2] - 0.5],
    [COSTUME_BOX[0] + 0.5, 1, COSTUME_BOX[2] + 0.5],
    "block",
    "costume"
  )

  // ---- Bonus room under the world.
  const U = UNDERGROUND_Y
  box([-8, U - 2, -4], [20, U, 4], "ground", "bonus-floor")
  box([-8, U, -5], [20, U + 7, -4], "wall")
  box([-9, U, -4], [-8, U + 7, 4], "wall")
  box([20, U, -4], [21, U + 7, 4], "wall")
  box([-8, U + 6, -4], [20, U + 7, 4], "wall")
  box([4, U, -1], [10, U + 1.5, 1], "block", "bonus-stack")

  // ---- Coins: trails that lead the eye.
  const coins: { id: string; position: V3 }[] = []
  const add = (x: number, y: number, z: number) =>
    coins.push({ id: `c${coins.length}`, position: [x, y, z] })
  for (let i = 0; i < 5; i++) add(-3 + i * 1.5, 1.2, 2)
  for (let i = 0; i < 6; i++) add(13.5 + i * 2.5, 6.2, 0)
  for (let i = 0; i < 4; i++)
    add(29.8 + i * 1.2, 1 + Math.sin((i / 3) * Math.PI) * 1.6, -8)
  input.projects.forEach((_, i) => {
    add(40.5 + i * 7, 1, 2)
    add(40.5 + i * 7, 1, -2)
  })
  for (let k = 1; k < STAIRS_STEPS; k += 2) add(STAIRS_X + k + 0.5, k + 2, 0)
  add(80, CLOUD_PLATFORM.y + 0.9, 0)
  add(82, CLOUD_PLATFORM.y + 0.9, 0)
  for (let i = 0; i < 4; i++) add(89 + i * 1.5, 1, 2)
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 6; i++) add(-4 + i * 1.6, U + 1 + r * 1.4, 2)

  const enemies: {
    id: string
    from: number
    to: number
    z: number
    y: number
  }[] = [
    { id: "e0", from: -13, to: -5, z: -1, y: 0 },
    { id: "e1", from: 12, to: 27, z: 2, y: 0 },
    { id: "e2", from: 45, to: 49.5, z: 2.5, y: 0 },
    { id: "e3", from: 64, to: 69, z: 0.5, y: 0 },
    { id: "e4", from: 88, to: 92, z: 3, y: 0 },
  ]

  return { solids, blocks, pipes, tallest, milestones, coins, enemies }
}

export type Level = ReturnType<typeof buildLevel>

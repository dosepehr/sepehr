import { rand } from "../engine/random"
import type { BaseState, GameOptions, InputState } from "../engine/types"

export const W = 360
export const H = 540
export const PLAYER_Y = H - 36
const ENEMY_W = 64
const ENEMY_H = 18
export const LABELS = ["undefined", "NaN", "404", "null"]
export const BOSS_LABEL = "Friday deploy"
export const BOSS_W = 150
const BOSS_HP = 30

export type Enemy = { x: number; y: number; label: string }
export type Shot = { x: number; y: number; vy: number }
export type Boss = { x: number; y: number; hp: number; dir: number }

export type BugBlasterState = BaseState & {
  playerX: number
  enemies: Enemy[]
  shots: Shot[]
  enemyShots: Shot[]
  boss: Boss | null
  wave: number
  dir: number
  cooldown: number
  invulnerable: number
  hard: boolean
}

function spawnWave(wave: number, hard: boolean): Pick<BugBlasterState, "enemies" | "boss" | "dir"> {
  // Every third wave (or immediately on hard mode) is the boss.
  if (hard ? wave % 2 === 1 : wave % 3 === 0) {
    return { enemies: [], boss: { x: W / 2, y: 70, hp: BOSS_HP + wave * 4, dir: 1 }, dir: 1 }
  }
  const enemies: Enemy[] = []
  const rows = Math.min(3 + Math.floor(wave / 2), 5)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 4; col++) {
      enemies.push({ x: 50 + col * 80, y: 50 + row * 30, label: LABELS[(row + col) % LABELS.length] })
    }
  }
  return { enemies, boss: null, dir: 1 }
}

export function init(seed: number, options?: GameOptions): BugBlasterState {
  const hard = !!options?.hard
  const wave = 1
  return {
    status: "playing",
    score: 0,
    lives: hard ? 2 : 3,
    seed,
    events: [],
    playerX: W / 2,
    shots: [],
    enemyShots: [],
    wave,
    cooldown: 0,
    invulnerable: 0,
    hard,
    ...spawnWave(wave, hard),
  }
}

const hits = (ax: number, ay: number, bx: number, by: number, bw: number, bh: number) =>
  ax >= bx - bw / 2 && ax <= bx + bw / 2 && ay >= by - bh / 2 && ay <= by + bh / 2

export function step(state: BugBlasterState, input: InputState, dt: number): BugBlasterState {
  if (state.status === "over") return { ...state, events: [] }
  const events: BugBlasterState["events"] = []
  let { seed, score, lives, dir, cooldown, invulnerable, wave, boss } = state
  const speedUp = (state.hard ? 1.5 : 1) * (1 + wave * 0.12)

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const playerX = Math.max(16, Math.min(W - 16, state.playerX + move * 260 * dt))

  cooldown = Math.max(0, cooldown - dt)
  invulnerable = Math.max(0, invulnerable - dt)
  let shots = state.shots.map((s) => ({ ...s, y: s.y + s.vy * dt })).filter((s) => s.y > -10)
  if (input.fire && cooldown === 0) {
    shots.push({ x: playerX, y: PLAYER_Y - 12, vy: -420 })
    cooldown = 0.28
    events.push({ type: "shoot" })
  }

  // Enemy formation: slide sideways, drop a row at the edges.
  let enemies = state.enemies
  if (enemies.length) {
    const dx = dir * 40 * speedUp * dt
    const minX = Math.min(...enemies.map((e) => e.x)) + dx
    const maxX = Math.max(...enemies.map((e) => e.x)) + dx
    if (minX < ENEMY_W / 2 || maxX > W - ENEMY_W / 2) {
      dir = -dir
      enemies = enemies.map((e) => ({ ...e, y: e.y + 14 }))
    } else {
      enemies = enemies.map((e) => ({ ...e, x: e.x + dx }))
    }
  }
  if (boss) {
    let bx = boss.x + boss.dir * 90 * speedUp * dt
    let bdir = boss.dir
    if (bx < BOSS_W / 2 || bx > W - BOSS_W / 2) {
      bdir = -bdir
      bx = Math.max(BOSS_W / 2, Math.min(W - BOSS_W / 2, bx))
    }
    boss = { ...boss, x: bx, dir: bdir }
  }

  // Player shots vs enemies and boss.
  const remainingShots: typeof shots = []
  for (const shot of shots) {
    const index = enemies.findIndex((e) => hits(shot.x, shot.y, e.x, e.y, ENEMY_W, ENEMY_H))
    if (index >= 0) {
      enemies = enemies.filter((_, i) => i !== index)
      score += 10 * wave
      events.push({ type: "explode" })
      continue
    }
    if (boss && hits(shot.x, shot.y, boss.x, boss.y, BOSS_W, 30)) {
      boss = { ...boss, hp: boss.hp - 1 }
      events.push({ type: "hit" })
      if (boss.hp <= 0) {
        score += 500
        boss = null
        events.push({ type: "explode" })
      }
      continue
    }
    remainingShots.push(shot)
  }
  shots = remainingShots

  // Enemy fire.
  let enemyShots = state.enemyShots.map((s) => ({ ...s, y: s.y + s.vy * dt })).filter((s) => s.y < H + 10)
  const shooters: { x: number; y: number }[] = boss ? [boss] : enemies
  let r: number
  ;[r, seed] = rand(seed)
  if (shooters.length && r < dt * (boss ? 2.4 : 1.2) * speedUp) {
    ;[r, seed] = rand(seed)
    const from = shooters[Math.floor(r * shooters.length)]
    enemyShots.push({ x: from.x, y: from.y + 12, vy: 200 * speedUp })
  }

  let hitPlayer = false
  if (invulnerable === 0) {
    const before = enemyShots.length
    enemyShots = enemyShots.filter((s) => !hits(s.x, s.y, playerX, PLAYER_Y, 28, 16))
    hitPlayer = enemyShots.length < before
  }
  if (enemies.some((e) => e.y + ENEMY_H / 2 >= PLAYER_Y - 10)) {
    hitPlayer = true
    enemies = []
  }
  if (hitPlayer) {
    lives -= 1
    invulnerable = 1.2
    events.push({ type: "hit" })
  }

  if (!enemies.length && !boss) {
    wave += 1
    const next = spawnWave(wave, state.hard)
    enemies = next.enemies
    boss = next.boss
    dir = next.dir
  }

  const status = lives <= 0 ? "over" : "playing"
  if (status === "over") events.push({ type: "lose" })
  return {
    ...state,
    status,
    score,
    lives,
    seed,
    events,
    playerX,
    enemies,
    shots,
    enemyShots,
    boss,
    wave,
    dir,
    cooldown,
    invulnerable,
  }
}

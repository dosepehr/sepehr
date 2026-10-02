import type { Solid } from "./level"

export const BODY = { radius: 0.34, height: 1.4, step: 0.3 }

export type Body = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  grounded: boolean
  /** What we are standing on (id of the solid). */
  ground: string | undefined
}

export type StepResult = {
  /** Solid hit with the head while moving up (? blocks, bricks). */
  bumped: Solid | null
  landed: boolean
  blocked: boolean
}

const overlapsXZ = (b: Body, s: Solid, r: number) =>
  b.x + r > s.min[0] &&
  b.x - r < s.max[0] &&
  b.z + r > s.min[2] &&
  b.z - r < s.max[2]

/**
 * Move a cylinder-ish body (a box in practice) through axis-aligned solids.
 * Horizontal first (with a small step-up so stairs feel smooth), then vertical,
 * reporting head bumps and landings. Simple, deterministic, good enough for a platformer.
 */
export function stepBody(b: Body, solids: Solid[], dt: number): StepResult {
  const { radius: r, height: h, step } = BODY
  let blocked = false

  // ---- Horizontal, one axis at a time so sliding along walls works.
  for (const axis of [0, 2] as const) {
    const v = axis === 0 ? b.vx : b.vz
    if (v === 0) continue
    if (axis === 0) b.x += v * dt
    else b.z += v * dt
    for (const s of solids) {
      if (s.max[1] <= b.y + 0.001 || s.min[1] >= b.y + h) continue
      if (!overlapsXZ(b, s, r)) continue
      // Low ledge: climb it instead of stopping.
      if (b.grounded && s.max[1] - b.y <= step) {
        b.y = s.max[1]
        continue
      }
      blocked = true
      if (axis === 0) b.x = v > 0 ? s.min[0] - r : s.max[0] + r
      else b.z = v > 0 ? s.min[2] - r : s.max[2] + r
    }
  }

  // ---- Vertical.
  const prevY = b.y
  b.y += b.vy * dt
  let bumped: Solid | null = null
  let landed = false
  let support: Solid | null = null
  for (const s of solids) {
    if (!overlapsXZ(b, s, r * 0.9)) continue
    if (b.vy <= 0 && prevY >= s.max[1] - 0.05 && b.y <= s.max[1]) {
      if (!support || s.max[1] > support.max[1]) support = s
    } else if (
      b.vy > 0 &&
      prevY + h <= s.min[1] + 0.05 &&
      b.y + h >= s.min[1]
    ) {
      b.y = s.min[1] - h
      b.vy = -1
      if (!bumped) bumped = s
    }
  }
  if (support) {
    if (!b.grounded) landed = true
    b.y = support.max[1]
    b.vy = 0
    b.grounded = true
    b.ground = support.id ?? support.kind
  } else {
    // Walked off a ledge?
    let under = false
    for (const s of solids)
      if (overlapsXZ(b, s, r * 0.9) && Math.abs(s.max[1] - b.y) < 0.02)
        under = true
    if (!under) {
      b.grounded = false
      b.ground = undefined
    }
  }
  return { bumped, landed, blocked }
}

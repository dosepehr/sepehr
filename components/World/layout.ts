import {
  GAME_WALL_X,
  gameZ,
  PROJECT_ROW_Z,
  projectX,
  RIGHT_GAMES,
  RIGHT_WALL_X,
  rightGameZ,
} from "@/components/Arcade/hotspots"
import type { RelicId } from "@/lib/store/world"

type V2 = [number, number]
type V3 = [number, number, number]

/** Axis-aligned box in the ground plane: center and half extents. */
export type Box = { x: number; z: number; hx: number; hz: number }
export type Circle = { x: number; z: number; r: number }

/** Walkable disc around the arcade. */
export const WORLD_RADIUS = 38

export const PALMS: V2[] = [
  [-12, 10],
  [-14.5, 4],
  [-11, -10],
  [13, 9.5],
  [15.5, 2.5],
  [12.5, -11],
  [20, 13],
  [21.5, 15.5],
  [-21, 16],
  [-24, -4],
  [24, -6],
  [4, -17],
  [-5, -18],
]

export const POND = { x: -17, z: 11, r: 3.4 }
export const PYRAMID = { x: 0, z: -24, r: 5.5, h: 7 }
export const BILLBOARD = { x: 17, z: -3, rot: -Math.PI / 2 }
export const ROAD_Z = 18
export const TRUCK: V3 = [7, 0, ROAD_Z]
export const TELEPORTS: [V2, V2] = [
  [-6, 12.5],
  [7, -29],
]
export const SIGNPOST: V2 = [3.2, 11.5]

/** Six odd objects hidden around the world. */
export const RELICS: { id: RelicId; position: V3 }[] = [
  { id: "rubber-duck", position: [POND.x + 2.2, 0.12, POND.z - 1.6] },
  { id: "floppy", position: [BILLBOARD.x + 1.4, 0.05, BILLBOARD.z + 2.2] },
  { id: "cassette", position: [-8.45, 0.05, -6.9] },
  { id: "ufo", position: [-2.5, 0.9, PYRAMID.z - 7.5] },
  { id: "any-key", position: [-31, 0.1, ROAD_Z + 0.6] },
  { id: "cartridge", position: [20.8, 0.08, 14.4] },
]

/** Coin trails that lead the eye: plaza arc, the road, around the pyramid and down the aisle. */
export const COINS: V3[] = (() => {
  const list: V3[] = []
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.15 + (i / 6) * 0.7)
    list.push([Math.cos(a) * 5.5, 0.6, 11 + Math.sin(a) * 2])
  }
  for (let i = 0; i < 8; i++) list.push([-24 + i * 6.5, 0.6, ROAD_Z - 1.4])
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    list.push([PYRAMID.x + Math.cos(a) * 8, 0.6, PYRAMID.z + Math.sin(a) * 8])
  }
  for (let i = 0; i < 4; i++) list.push([0, 0.6, 6.5 - i * 2.6])
  list.push([-15, 0.6, 7], [16, 0.6, 5], [-13, 0.6, -14])
  return list
})()

export const KICKABLES: V3[] = [
  [-3, 0.35, 13.5],
  [2.5, 0.35, 14.5],
  [-9, 0.35, 15],
  [11, 0.35, -2],
  [-6, 0.35, -15],
]

/** Static obstacles: room walls and furniture, then the outdoor props. */
export function buildColliders(projectCount: number) {
  const boxes: Box[] = [
    // Room shell (open at the front, z = 8).
    { x: -9.1, z: 0, hx: 0.35, hz: 8.05 },
    { x: 9.1, z: 0, hx: 0.35, hz: 8.05 },
    { x: 0, z: -7.7, hx: 9.4, hz: 0.35 },
    // Furniture.
    { x: -7.45, z: -6.75, hx: 0.55, hz: 0.45 },
    { x: -1.7, z: 2.6, hx: 1.0, hz: 0.55 },
    { x: -3.6, z: 5.2, hx: 0.45, hz: 0.32 },
    { x: 0.8, z: 5.4, hx: 0.42, hz: 0.38 },
    { x: 4.8, z: 5, hx: 1.12, hz: 0.82 },
    { x: 6.6, z: -0.8, hx: 0.52, hz: 1.22 },
    { x: -7.8, z: 4.6, hx: 0.32, hz: 0.92 },
    { x: 8.2, z: 2.6, hx: 0.52, hz: 0.55 },
    { x: 7.4, z: -6.6, hx: 0.85, hz: 0.3 },
    // Outdoors.
    { x: TRUCK[0], z: TRUCK[2], hx: 1.6, hz: 0.9 },
    { x: BILLBOARD.x, z: BILLBOARD.z - 2.6, hx: 0.25, hz: 0.25 },
    { x: BILLBOARD.x, z: BILLBOARD.z + 2.6, hx: 0.25, hz: 0.25 },
  ]
  for (let i = 0; i < projectCount; i++)
    boxes.push({
      x: projectX(i, projectCount),
      z: PROJECT_ROW_Z,
      hx: 0.6,
      hz: 0.55,
    })
  for (let i = 0; i < 5; i++)
    boxes.push({ x: GAME_WALL_X, z: gameZ(i), hx: 0.55, hz: 0.6 })
  RIGHT_GAMES.forEach((_, i) =>
    boxes.push({ x: RIGHT_WALL_X, z: rightGameZ(i), hx: 0.55, hz: 0.6 })
  )

  const circles: Circle[] = [
    { x: 3.3, z: 2.4, r: 0.45 },
    { x: PYRAMID.x, z: PYRAMID.z, r: PYRAMID.r },
    { x: SIGNPOST[0], z: SIGNPOST[1], r: 0.2 },
    ...PALMS.map(([x, z]) => ({ x, z, r: 0.35 })),
  ]
  return { boxes, circles }
}

export type Colliders = ReturnType<typeof buildColliders>

/** Push a circle (x, z, r) out of every collider. Returns true if it touched one. */
export function resolve(p: { x: number; z: number }, r: number, c: Colliders) {
  let hit = false
  for (const b of c.boxes) {
    const cx = Math.max(b.x - b.hx, Math.min(p.x, b.x + b.hx))
    const cz = Math.max(b.z - b.hz, Math.min(p.z, b.z + b.hz))
    const dx = p.x - cx
    const dz = p.z - cz
    const d2 = dx * dx + dz * dz
    if (d2 >= r * r) continue
    hit = true
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2)
      p.x = cx + (dx / d) * r
      p.z = cz + (dz / d) * r
    } else {
      // Center inside the box: leave by the nearest face.
      const ox = b.hx - Math.abs(p.x - b.x)
      const oz = b.hz - Math.abs(p.z - b.z)
      if (ox < oz) p.x = b.x + Math.sign(p.x - b.x || 1) * (b.hx + r)
      else p.z = b.z + Math.sign(p.z - b.z || 1) * (b.hz + r)
    }
  }
  for (const k of c.circles) {
    const dx = p.x - k.x
    const dz = p.z - k.z
    const d = Math.hypot(dx, dz)
    const min = k.r + r
    if (d >= min) continue
    hit = true
    const s = d > 1e-6 ? min / d : 1
    p.x = k.x + dx * s
    p.z = k.z + (d > 1e-6 ? dz * s : min)
  }
  const d = Math.hypot(p.x, p.z)
  if (d > WORLD_RADIUS) {
    p.x *= WORLD_RADIUS / d
    p.z *= WORLD_RADIUS / d
    hit = true
  }
  return hit
}

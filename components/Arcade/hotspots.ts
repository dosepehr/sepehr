export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }

export const HOTSPOTS = {
  overview: { position: [0, 4.6, 15], target: [0, 1.4, -1] },
  projects: { position: [0, 2.4, 1.6], target: [0, 1.5, -5] },
  games: { position: [-3.4, 2.3, -0.6], target: [-8, 1.4, -1.4] },
  blog: { position: [-4.2, 2.1, 4.8], target: [-7.5, 1.1, 4.6] },
  desk: { position: [4.4, 1.95, -0.8], target: [6.6, 1.15, -0.8] },
  skills: { position: [4.6, 2.8, -3.6], target: [8.9, 2.8, -4.2] },
  contact: { position: [-3.6, 1.9, 9], target: [-3.6, 1.4, 5.2] },
  resume: { position: [0.8, 2.1, 8.6], target: [0.8, 0.9, 5.4] },
  physics: { position: [4.6, 2.9, 10], target: [4.8, 1.1, 5] },
  roof: { position: [2, 3, 3], target: [6, 7, -7.4] },
} satisfies Record<string, Pose>

/** Where the camera starts before gliding into the overview. */
export const INTRO_POSITION: Vec3 = [3, 9.5, 24]

export type StaticHotspot = keyof typeof HOTSPOTS
/** Static hotspots plus per-project and per-game cabinet focuses. */
export type HotspotId = StaticHotspot | `project:${string}` | `game:${string}`

/** Arcade row layout, shared by Room (placement) and CameraRig (poses). */
export const PROJECT_ROW_Z = -5
export const projectX = (index: number, count: number) =>
  (index - (count - 1) / 2) * 2

export const GAME_WALL_X = -8.2
export const gameZ = (index: number) => -4.6 + index * 1.55

/** Second bank of cabinets along the right wall, past the claw machine. */
export const RIGHT_GAMES = ["neon-snake", "brick-breaker", "pixel-pong"]
export const RIGHT_WALL_X = 8.2
export const rightGameZ = (index: number) => 3.85 + index * 1.25

export function resolvePose(
  focus: HotspotId,
  projectSlugs: string[],
  gameIds: string[]
): Pose {
  if (focus.startsWith("project:")) {
    const index = Math.max(0, projectSlugs.indexOf(focus.slice(8)))
    const x = projectX(index, projectSlugs.length)
    return {
      position: [x, 1.85, PROJECT_ROW_Z + 2.4],
      target: [x, 1.55, PROJECT_ROW_Z],
    }
  }
  if (focus.startsWith("game:") && RIGHT_GAMES.includes(focus.slice(5))) {
    const z = rightGameZ(RIGHT_GAMES.indexOf(focus.slice(5)))
    return {
      position: [RIGHT_WALL_X - 1.6, 1.75, z],
      target: [RIGHT_WALL_X, 1.6, z],
    }
  }
  if (focus.startsWith("game:")) {
    const z = gameZ(Math.max(0, gameIds.indexOf(focus.slice(5))))
    // Close enough that the screen fills the view before the game crossfades in.
    return {
      position: [GAME_WALL_X + 1.6, 1.75, z],
      target: [GAME_WALL_X, 1.6, z],
    }
  }
  return (HOTSPOTS as Record<string, Pose>)[focus] ?? HOTSPOTS.overview
}

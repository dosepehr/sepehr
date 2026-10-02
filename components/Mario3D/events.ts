import * as THREE from "three"

/** Live state of the plumber, shared by the controller, camera, entities and HUD. */
export const hero = {
  body: {
    x: 0,
    y: 0,
    z: 2,
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
    ground: undefined as string | undefined,
  },
  /** Seconds of invulnerability left after a hit. */
  hurt: 0,
  /** Seconds of star power left. */
  star: 0,
  /** Input is locked during cutscenes (flagpole, pipes). */
  locked: false,
  checkpoint: 0,
}

export const heroPosition = () =>
  new THREE.Vector3(hero.body.x, hero.body.y, hero.body.z)

type BumpHandler = () => void
/** ? blocks and bricks register here; the controller calls them on a head bump. */
export const bumpHandlers = new Map<string, BumpHandler>()

/** Power-ups spawned at runtime (the hidden block's mushroom). */
export const spawned = new Set<string>()
export const spawnListeners = new Set<() => void>()
export function spawnPowerUp(id: string) {
  spawned.add(id)
  spawnListeners.forEach((l) => l())
}

// Test hook for screenshots in development only.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development")
  (window as unknown as { __hero: typeof hero }).__hero = hero

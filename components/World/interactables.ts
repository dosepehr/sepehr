import * as THREE from "three"

export type Interactable = {
  object: THREE.Object3D
  activate: () => void
  label?: string
  /** Cached world-space footprint, refreshed now and then. */
  box: THREE.Box3
  stamp: number
}

/**
 * Every <Hotspot> registers itself here, so in explore mode the player can
 * walk up to anything clickable and press E. No per-object wiring needed.
 */
export const interactables = new Map<string, Interactable>()

export function registerInteractable(
  id: string,
  object: THREE.Object3D,
  activate: () => void,
  label?: string
) {
  interactables.set(id, {
    object,
    activate,
    label,
    box: new THREE.Box3(),
    stamp: -1,
  })
  return () => {
    if (interactables.get(id)?.object === object) interactables.delete(id)
  }
}

const tmp = new THREE.Vector3()

/** Nearest reachable interactable to `point` (xz distance to its footprint), within `reach`. */
export function nearestInteractable(
  point: THREE.Vector3,
  reach: number,
  now: number
) {
  let best: string | null = null
  let bestD = reach
  for (const [id, it] of interactables) {
    if (now - it.stamp > 1) {
      it.box.setFromObject(it.object)
      it.stamp = now
    }
    if (it.box.isEmpty()) continue
    // Out of reach overhead (drone, roof cat, the ? block).
    if (it.box.min.y > 1.9) continue
    tmp.set(
      THREE.MathUtils.clamp(point.x, it.box.min.x, it.box.max.x),
      0,
      THREE.MathUtils.clamp(point.z, it.box.min.z, it.box.max.z)
    )
    const d = Math.hypot(tmp.x - point.x, tmp.z - point.z)
    if (d < bestD) {
      bestD = d
      best = id
    }
  }
  return best
}

/** Live player state shared by the controller, camera, pickups and props. */
export const player = {
  position: new THREE.Vector3(0, 0, 10),
  velocity: new THREE.Vector3(),
  facing: Math.PI,
  grounded: true,
  running: false,
}

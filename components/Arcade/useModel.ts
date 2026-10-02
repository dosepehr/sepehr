"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { useIsHovered } from "./Hotspot"

type Options = {
  /** Hotspot whose hover drives `hover` and the trim glow. */
  hoverId: string
  /** Neon color for meshes authored with the "Trim" material. */
  trim: string
  /** Paint for meshes authored with the "Body" material. */
  body?: string
  /** Extra material overrides, keyed by the authored material name. */
  slots?: Record<string, THREE.Material | undefined>
}

const noRaycast = () => null

/**
 * A per-instance clone of a GLB with its "Trim" and "Body" materials re-skinned.
 * Meshes don't raycast (parents add one cheap hit box instead). `hover` eases
 * between 0 and 1 with the hotspot's hover state, for custom animation.
 */
export function useModel(url: string, { hoverId, trim, body, slots }: Options) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => scene.clone(true), [scene])
  const hovered = useIsHovered(hoverId)
  const hover = useRef(0)

  const own = useMemo(
    () => ({
      trim: new THREE.MeshBasicMaterial({ toneMapped: false }),
      body: new THREE.MeshStandardMaterial({
        roughness: 0.32,
        metalness: 0.25,
      }),
    }),
    []
  )
  const trimColor = useMemo(() => new THREE.Color(trim), [trim])

  useLayoutEffect(() => {
    if (body) own.body.color.set(body)
  }, [own, body])

  useLayoutEffect(() => {
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.raycast = noRaycast
      // Remember the authored name: overrides replace the material itself.
      o.userData.slot ??= (o.material as THREE.Material).name
      const slot: string = o.userData.slot
      const override =
        slots?.[slot] ??
        (slot === "Trim" ? own.trim : slot === "Body" && body ? own.body : null)
      if (override) o.material = override
    })
  }, [model, own, slots, body])

  useLayoutEffect(
    () => () => Object.values(own).forEach((m) => m.dispose()),
    [own]
  )

  useFrame((_, dt) => {
    hover.current += ((hovered ? 1 : 0) - hover.current) * Math.min(1, dt * 8)
    own.trim.color.copy(trimColor).multiplyScalar(1.4 + hover.current * 1.8)
  })

  return { model, hover }
}

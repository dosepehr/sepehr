"use client"

import { CameraControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"
import { HOTSPOTS, resolvePose } from "./hotspots"

export default function CameraRig({ projectSlugs, gameSlots }: { projectSlugs: string[]; gameSlots: string[] }) {
  const controls = useRef<CameraControls>(null)
  const focus = useStage((s) => s.focus)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const pose = resolvePose(focus, projectSlugs, gameSlots)
    // Reduced motion: cut instead of ease.
    void controls.current?.setLookAt(...pose.position, ...pose.target, !reduced)
  }, [focus, projectSlugs, gameSlots, reduced])

  // Idle pointer parallax in the overview.
  useFrame(({ pointer }) => {
    if (focus !== "overview" || reduced || !controls.current) return
    const { position, target } = HOTSPOTS.overview
    void controls.current.setLookAt(
      position[0] + pointer.x * 0.8,
      position[1] + pointer.y * 0.35,
      position[2],
      target[0] + pointer.x * 0.3,
      target[1],
      target[2],
      true
    )
  })

  // User orbit/dolly is off: navigation is hotspot-driven (and keyboard via the HUD).
  return <CameraControls ref={controls} enabled={false} smoothTime={0.55} makeDefault />
}

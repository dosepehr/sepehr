"use client"

import { PerformanceMonitor } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { GAMES } from "@/components/Games/registry"
import { useStage, type PerfTier } from "@/lib/store/stage"
import type { ArcadeData } from "./arcade.types"
import CameraRig from "./CameraRig"
import Effects from "./Effects"
import { HOTSPOTS } from "./hotspots"
import NeonDriveScene from "./NeonDriveScene"
import { usePalette } from "./palette"
import Room, { WALL_SLOTS } from "./Room"

const TIERS: PerfTier[] = ["low", "medium", "high"]
const DPR: Record<PerfTier, number | [number, number]> = {
  low: 1,
  medium: [1, 1.5],
  high: [1, 2],
}

/** Seed the tier from device hints; PerformanceMonitor adjusts it at runtime. */
export function initialTier(): PerfTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  if (cores >= 8 && memory >= 8 && window.devicePixelRatio <= 2) return "high"
  if (cores <= 4 || memory <= 4) return "low"
  return "medium"
}

export default function Scene({
  data,
  onReady,
}: {
  data: ArcadeData
  onReady?: () => void
}) {
  const palette = usePalette()
  const tier = useStage((s) => s.tier)
  const game = useStage((s) => s.game)
  const [projectSlugs] = useState(() => data.projects.map((p) => p.slug))
  const driving = game === "neon-drive"
  // A 2D game covers the canvas: stop rendering entirely.
  const covered = !!game && !GAMES[game].is3d

  const step = (dir: 1 | -1) => {
    const current = TIERS.indexOf(useStage.getState().tier)
    const next = TIERS[Math.max(0, Math.min(TIERS.length - 1, current + dir))]
    if (next !== useStage.getState().tier) useStage.getState().setTier(next)
  }

  return (
    <Canvas
      dpr={DPR[tier]}
      frameloop={covered ? "never" : "always"}
      gl={{ antialias: tier !== "low", powerPreference: "high-performance" }}
      camera={{
        position: HOTSPOTS.overview.position,
        fov: 50,
        near: 0.1,
        far: 140,
      }}
      onCreated={() => onReady?.()}
      aria-hidden
    >
      <PerformanceMonitor
        onIncline={() => step(1)}
        onDecline={() => step(-1)}
        flipflops={3}
        onFallback={() => useStage.getState().setTier("low")}
      />
      {!driving && (
        <>
          <color attach="background" args={[palette.bg]} />
          <fog attach="fog" args={[palette.bg, 22, 42]} />
        </>
      )}
      <Suspense fallback={null}>
        {driving ? (
          <NeonDriveScene />
        ) : (
          <>
            <Room data={data} />
            <CameraRig projectSlugs={projectSlugs} gameSlots={WALL_SLOTS} />
          </>
        )}
        <Effects />
      </Suspense>
    </Canvas>
  )
}

"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import { useStage } from "@/lib/store/stage"
import { hero } from "./events"
import { buildLevel } from "./level"
import MarioPlayer, { requestWarp } from "./MarioPlayer"
import Scenery from "./Scenery"
import Things from "./Things"

/** Sun that follows the hero so the shadow map stays sharp around them. */
function Sun() {
  const tier = useStage((s) => s.tier)
  const light = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    const b = hero.body
    l.position.set(b.x + 8, b.y + 16, b.z + 10)
    l.target.position.set(b.x, b.y, b.z)
    l.target.updateMatrixWorld()
  })
  const size = tier === "high" ? 2048 : 1024
  return (
    <directionalLight
      ref={light}
      intensity={2.2}
      color="#fff6e0"
      castShadow={tier !== "low"}
      shadow-mapSize={[size, size]}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-near={1}
      shadow-camera-far={60}
      shadow-bias={-0.0005}
    />
  )
}

/** The mushroom-kingdom world: islands, blocks, pipes and the hero. */
export default function MarioWorld({ data }: { data: ArcadeData }) {
  const level = useMemo(
    () =>
      buildLevel({
        projects: data.projects.map((p) => ({
          slug: p.slug,
          title: p.title,
          color: p.color,
        })),
        skills: data.skills,
        experience: data.profile.experience,
      }),
    [data]
  )
  return (
    <group>
      <color attach="background" args={["#7ec0ff"]} />
      <fog attach="fog" args={["#bfe3ff", 45, 140]} />
      <hemisphereLight args={["#d6eeff", "#6b8e3a", 1.3]} />
      <ambientLight intensity={0.35} />
      <Sun />
      <Scenery level={level} />
      <Things level={level} onPipe={requestWarp} />
      <MarioPlayer level={level} />
    </group>
  )
}

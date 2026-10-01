"use client"

import { Clone, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import * as THREE from "three"
import { sfx } from "@/lib/audio/sfx"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useAudio } from "@/lib/store/audio"
import Hotspot, { useIsHovered } from "./Hotspot"
import { MODELS } from "./models"
import { usePalette } from "./palette"

/** A gold coin spinning above a cabinet. Spins faster when that cabinet is hovered. */
export function SpinningCoin({
  position,
  hoverId,
}: {
  position: [number, number, number]
  hoverId: string
}) {
  const { scene } = useGLTF(MODELS.coin)
  const ref = useRef<THREE.Group>(null)
  const hovered = useIsHovered(hoverId)
  const speed = useRef(1.2)
  const reduced = usePrefersReducedMotion()
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.MeshStandardMaterial
      m.metalness = 0.5
      m.roughness = 0.3
      m.emissive.set("#ff9d00")
      m.emissiveIntensity = 0.35
    })
  }, [scene])
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g || reduced) return
    speed.current += ((hovered ? 9 : 1.2) - speed.current) * Math.min(1, dt * 4)
    g.rotation.y += dt * speed.current
    g.position.y =
      position[1] + Math.sin(clock.elapsedTime * 2 + position[2]) * 0.06
  })
  return (
    <group ref={ref} position={position} scale={0.55}>
      <Clone object={scene} />
    </group>
  )
}

/** Hit it from below (well, click it): it bumps and a coin pops out. */
export function PowerBlock({
  position,
}: {
  position: [number, number, number]
}) {
  const block = useGLTF(MODELS.blockCoin).scene
  const coin = useGLTF(MODELS.coin).scene
  const blockRef = useRef<THREE.Group>(null)
  const coinRef = useRef<THREE.Group>(null)
  const bump = useRef(0)
  const pop = useRef(-1)
  useFrame(({ clock }, dt) => {
    const b = blockRef.current
    const c = coinRef.current
    if (!b || !c) return
    bump.current = Math.max(0, bump.current - dt * 4)
    const k = bump.current
    b.position.y =
      Math.sin(k * Math.PI) * 0.25 + Math.sin(clock.elapsedTime) * 0.05
    b.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.4
    if (pop.current >= 0) {
      pop.current += dt
      const t = pop.current / 0.9
      c.visible = t < 1
      c.position.y = 0.6 + Math.sin(Math.min(t, 1) * Math.PI) * 1.1
      c.rotation.y += dt * 18
      c.scale.setScalar(0.6 * (1 - Math.max(0, t - 0.7) / 0.3))
      if (t >= 1) pop.current = -1
    }
  })
  return (
    <group position={position}>
      <Hotspot
        id="power-block"
        onActivate={() => {
          bump.current = 1
          pop.current = 0
          sfx.coin()
        }}
      >
        <group ref={blockRef} scale={0.5}>
          <Clone object={block} />
        </group>
      </Hotspot>
      <group ref={coinRef} visible={false}>
        <Clone object={coin} />
      </group>
    </group>
  )
}

/** A little security drone patrolling under the ceiling with a scanner cone. Click: barrel roll. */
export function Drone() {
  const palette = usePalette()
  const { scene } = useGLTF(MODELS.drone)
  const ref = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const roll = useRef(0)
  const reduced = usePrefersReducedMotion()
  const prev = useRef(new THREE.Vector3())
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g || !body.current) return
    const t = reduced ? 4 : clock.elapsedTime * 0.22
    const x = Math.sin(t) * 5.5
    const z = 0.5 + Math.sin(t * 2) * 3
    prev.current.copy(g.position)
    g.position.set(x, 4.4 + Math.sin(clock.elapsedTime * 1.7) * 0.12, z)
    const dx = g.position.x - prev.current.x
    const dz = g.position.z - prev.current.z
    if (dx * dx + dz * dz > 1e-8) {
      const heading = Math.atan2(dx, dz)
      let delta = heading - g.rotation.y
      delta = Math.atan2(Math.sin(delta), Math.cos(delta))
      g.rotation.y += delta * Math.min(1, dt * 3)
    }
    roll.current = Math.max(0, roll.current - dt * 1.6)
    body.current.rotation.z =
      roll.current > 0 ? (1 - roll.current) * Math.PI * 2 : 0
  })
  return (
    <group ref={ref}>
      <Hotspot
        id="drone"
        onActivate={() => {
          if (roll.current > 0) return
          roll.current = 1
          sfx.shoot()
        }}
      >
        <group ref={body} scale={0.55}>
          <Clone object={scene} />
        </group>
        <mesh position={[0, 0.25, 0]} visible={false}>
          <sphereGeometry args={[0.6, 8, 8]} />
        </mesh>
      </Hotspot>
      {/* Scanner cone. */}
      <mesh position={[0, -1.6, 0]}>
        <coneGeometry args={[0.9, 3.2, 32, 1, true]} />
        <meshBasicMaterial
          color={palette.cyan}
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.02, 0.05]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial
          color={new THREE.Color(palette.cyan).multiplyScalar(4)}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/** The boombox on the desk doubles as the sound switch; it pulses while sound is on. */
export function BoomBox({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  const { scene } = useGLTF(MODELS.boombox)
  const ref = useRef<THREE.Group>(null)
  const muted = useAudio((s) => s.muted)
  const reduced = usePrefersReducedMotion()
  const SCALE = 16

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = muted ? 0.4 : 2.2
    })
  }, [scene, muted])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const beat =
      muted || reduced
        ? 0
        : Math.pow(Math.abs(Math.sin(clock.elapsedTime * Math.PI * 2)), 8)
    ref.current.scale.setScalar(SCALE * (1 + beat * 0.05))
  })

  return (
    <Hotspot
      id="boombox"
      onActivate={() => {
        useAudio.getState().toggle()
        sfx.select()
      }}
    >
      <group position={position} rotation-y={rotation}>
        <group ref={ref} scale={SCALE}>
          <primitive object={scene} />
        </group>
        <mesh visible={false}>
          <boxGeometry args={[0.36, 0.34, 0.34]} />
        </mesh>
      </group>
    </Hotspot>
  )
}

export function Trophy({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  const { scene } = useGLTF(MODELS.trophy)
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.MeshStandardMaterial
      m.metalness = 0.5
      m.roughness = 0.25
      m.emissive.set("#ff9d00")
      m.emissiveIntensity = 0.3
    })
  }, [scene])
  return (
    <primitive
      object={scene}
      position={position}
      rotation-y={rotation}
      scale={0.7}
    />
  )
}

useGLTF.preload(MODELS.coin)
useGLTF.preload(MODELS.blockCoin)
useGLTF.preload(MODELS.drone)
useGLTF.preload(MODELS.boombox)
useGLTF.preload(MODELS.trophy)

"use client"

import { Clone, RoundedBox, Sparkles, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { toast } from "sonner"
import * as THREE from "three"
import Label from "@/components/Arcade/Label"
import { MODELS } from "@/components/Arcade/models"
import { usePalette } from "@/components/Arcade/palette"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useStage } from "@/lib/store/stage"
import { allRelicsFound, useWorld, type RelicId } from "@/lib/store/world"
import { player } from "./interactables"
import { COINS, KICKABLES, RELICS, resolve, type Colliders } from "./layout"

type V3 = [number, number, number]

function Coin({ index, position }: { index: number; position: V3 }) {
  const { scene } = useGLTF(MODELS.coin)
  const ref = useRef<THREE.Group>(null)
  const taken = useRef(false)
  const pop = useRef(0)
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    if (taken.current) {
      // Fly up and shrink after pickup.
      pop.current += dt
      g.position.y = position[1] + pop.current * 4
      g.scale.setScalar(Math.max(0, 0.45 * (1 - pop.current * 2.5)))
      g.rotation.y += dt * 20
      if (pop.current > 0.4 && g.visible) {
        g.visible = false
        // Recorded after the fly-away so the coin isn't unmounted mid-animation.
        useWorld.getState().collectCoin(index)
      }
      return
    }
    g.rotation.y = clock.elapsedTime * 2 + index
    g.position.y = position[1] + Math.sin(clock.elapsedTime * 2.5 + index) * 0.1
    const d = Math.hypot(
      player.position.x - position[0],
      player.position.z - position[2]
    )
    if (
      d < 0.75 &&
      player.position.y < 1.2 &&
      useStage.getState().mode === "explore"
    ) {
      sfx.pickup()
      taken.current = true
    }
  })
  return (
    <group ref={ref} position={position} scale={0.45}>
      <Clone object={scene} />
    </group>
  )
}

function RelicMesh({ id }: { id: RelicId }) {
  const palette = usePalette()
  switch (id) {
    case "rubber-duck":
      return (
        <group scale={0.9}>
          <mesh position-y={0.18}>
            <sphereGeometry args={[0.22, 20, 16]} />
            <meshStandardMaterial color="#ffd23f" roughness={0.4} />
          </mesh>
          <mesh position={[0.12, 0.42, 0]}>
            <sphereGeometry args={[0.13, 20, 16]} />
            <meshStandardMaterial color="#ffd23f" roughness={0.4} />
          </mesh>
          <mesh position={[0.26, 0.4, 0]} rotation-z={-Math.PI / 2}>
            <coneGeometry args={[0.05, 0.12, 12]} />
            <meshStandardMaterial color="#ff8a3d" />
          </mesh>
        </group>
      )
    case "floppy":
      return (
        <group rotation-x={-Math.PI / 2}>
          <RoundedBox args={[0.5, 0.5, 0.04]} radius={0.01}>
            <meshStandardMaterial color="#1b2a6b" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.16, 0.025]}>
            <boxGeometry args={[0.28, 0.16, 0.01]} />
            <meshStandardMaterial
              color="#c9cdd6"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.1, 0.025]}>
            <boxGeometry args={[0.36, 0.22, 0.01]} />
            <meshStandardMaterial color="#f5ecff" />
          </mesh>
        </group>
      )
    case "cassette":
      return (
        <group rotation-x={-Math.PI / 2}>
          <RoundedBox args={[0.5, 0.32, 0.06]} radius={0.015}>
            <meshStandardMaterial color="#141018" roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.03, 0.035]}>
            <boxGeometry args={[0.4, 0.14, 0.01]} />
            <meshStandardMaterial
              color={palette.pink}
              emissive={palette.pink}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      )
    case "ufo":
      return (
        <group>
          <mesh scale={[1, 0.25, 1]}>
            <sphereGeometry args={[0.6, 32, 16]} />
            <meshStandardMaterial
              color="#9aa3b5"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
          <mesh position-y={0.12}>
            <sphereGeometry
              args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color="#7df9ff"
              transparent
              opacity={0.6}
              emissive="#22e5ff"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position-y={-0.9} rotation-x={Math.PI}>
            <coneGeometry args={[0.6, 1.6, 24, 1, true]} />
            <meshBasicMaterial
              color="#7dffb0"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )
    case "any-key":
      return (
        <group>
          <RoundedBox args={[0.5, 0.22, 0.5]} radius={0.05} position-y={0.11}>
            <meshStandardMaterial color="#e9e3f5" roughness={0.5} />
          </RoundedBox>
          <Label
            text="ANY"
            size={[0.4, 0.16]}
            position={[0, 0.226, 0]}
            rotation-x={-Math.PI / 2}
            options={{
              color: "#20103a",
              fontSize: 60,
              height: 80,
              glow: false,
              fontVar: "--font-mono",
            }}
          />
        </group>
      )
    case "cartridge":
      return (
        <group rotation-x={-1.2}>
          <RoundedBox args={[0.42, 0.5, 0.08]} radius={0.02}>
            <meshStandardMaterial color="#5c5c66" roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 0.06, 0.045]}>
            <boxGeometry args={[0.32, 0.26, 0.01]} />
            <meshStandardMaterial
              color={palette.cyan}
              emissive={palette.cyan}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      )
  }
}

function Relic({ id, position }: { id: RelicId; position: V3 }) {
  const { dict } = useDictionary()
  const palette = usePalette()
  const ref = useRef<THREE.Group>(null)
  const found = useWorld((s) => s.relics.includes(id))
  const hydrated = useHydrated()
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g || found) return
    if (id === "ufo") {
      g.position.y = position[1] + Math.sin(clock.elapsedTime * 1.3) * 0.25
      g.rotation.y = clock.elapsedTime * 0.8
    } else if (id === "rubber-duck") {
      g.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.03
      g.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.6
    }
    const d = Math.hypot(
      player.position.x - position[0],
      player.position.z - position[2]
    )
    if (
      d < 1 &&
      useStage.getState().mode === "explore" &&
      useWorld.getState().findRelic(id)
    ) {
      if (id === "rubber-duck") sfx.quack()
      sfx.discover()
      const info = dict.world.relics[id]
      toast.success(`${dict.world.relicFound}: ${info.name}`, {
        description: info.note,
      })
      if (allRelicsFound(useWorld.getState().relics))
        setTimeout(() => toast.success(dict.world.allRelics), 1400)
    }
  })
  if (!hydrated || found) return null
  return (
    <group ref={ref} position={position}>
      <RelicMesh id={id} />
      {/* A faint shimmer: findable if you look, not a beacon. */}
      <Sparkles
        count={8}
        scale={[0.9, 0.9, 0.9]}
        position-y={0.4}
        size={2}
        speed={0.4}
        color={palette.yellow}
        opacity={0.7}
      />
    </group>
  )
}

/** Beach balls you can kick around. Simple 2D physics with a hop. */
function Kickables({ colliders }: { colliders: Colliders }) {
  const palette = usePalette()
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const state = useRef(
    KICKABLES.map(([x, y, z]) => ({
      p: new THREE.Vector3(x, y, z),
      v: new THREE.Vector3(),
      cooldown: 0,
    }))
  )
  const R = 0.35
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    state.current.forEach((b, i) => {
      b.cooldown = Math.max(0, b.cooldown - dt)
      const dx = b.p.x - player.position.x
      const dz = b.p.z - player.position.z
      const d = Math.hypot(dx, dz)
      if (d < R + 0.38 && player.position.y < 0.9) {
        const nx = dx / (d || 1)
        const nz = dz / (d || 1)
        const push = Math.max(
          2.5,
          Math.hypot(player.velocity.x, player.velocity.z) * 1.6
        )
        b.v.set(nx * push, push * 0.45, nz * push)
        b.p.x = player.position.x + nx * (R + 0.39)
        b.p.z = player.position.z + nz * (R + 0.39)
        if (b.cooldown === 0) {
          sfx.kick()
          b.cooldown = 0.3
        }
      }
      b.v.y -= 14 * dt
      b.p.addScaledVector(b.v, dt)
      if (b.p.y < R) {
        b.p.y = R
        if (b.v.y < -1.5) sfx.bump()
        b.v.y = Math.abs(b.v.y) > 1.5 ? -b.v.y * 0.5 : 0
      }
      const friction = Math.pow(b.p.y <= R + 0.01 ? 0.25 : 0.8, dt)
      b.v.x *= friction
      b.v.z *= friction
      const before = { x: b.p.x, z: b.p.z }
      if (resolve(b.p, R, colliders)) {
        // Bounce off whatever we hit.
        if (Math.abs(b.p.x - before.x) > 1e-4) b.v.x *= -0.6
        if (Math.abs(b.p.z - before.z) > 1e-4) b.v.z *= -0.6
      }
      const m = refs.current[i]
      if (m) {
        m.position.copy(b.p)
        m.rotation.x += (b.v.z * dt) / R
        m.rotation.z -= (b.v.x * dt) / R
      }
    })
  })
  const colors = [
    palette.pink,
    palette.cyan,
    palette.yellow,
    palette.purple,
    "#5dff9d",
  ]
  return (
    <group>
      {KICKABLES.map((p, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)} position={p}>
          <icosahedronGeometry args={[R, 1]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            emissive={colors[i % colors.length]}
            emissiveIntensity={0.3}
            flatShading
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Collectibles({ colliders }: { colliders: Colliders }) {
  const hydrated = useHydrated()
  const taken = useWorld((s) => s.coins)
  return (
    <group>
      {hydrated &&
        COINS.map((p, i) =>
          taken.includes(i) ? null : <Coin key={i} index={i} position={p} />
        )}
      {RELICS.map((r) => (
        <Relic key={r.id} id={r.id} position={r.position} />
      ))}
      <Kickables colliders={colliders} />
    </group>
  )
}

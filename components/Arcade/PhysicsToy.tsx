"use client"

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { useStage } from "@/lib/store/stage"
import Hotspot from "./Hotspot"
import Label from "./Label"
import { usePalette } from "./palette"

const ORIGIN = new THREE.Vector3(4.8, 0, 5)
const TABLE_Y = 0.7
const LEVELS = 6
const BLOCK = { long: 0.6, h: 0.14, w: 0.19 }
const MAX_BALLS = 6
const STACK = ["React", "Next", "TS", "Node", "SQL", "CSS", "Git", "R3F", "Vite", "Zod", "Jest", "AWS", "Bun", "Deno", "Vue", "Go", "Rust", "Py"]

type Ball = { id: number; position: [number, number, number]; velocity: [number, number, number] }

function Block({
  position,
  rotation,
  color,
  label,
  golden,
  bodyRef,
}: {
  position: [number, number, number]
  rotation: number
  color: string
  label: string
  golden?: boolean
  bodyRef?: React.Ref<RapierRigidBody>
}) {
  return (
    <RigidBody ref={bodyRef} position={position} rotation={[0, rotation, 0]} colliders="cuboid" friction={0.8} restitution={0.05} mass={golden ? 0.6 : 0.4}>
      <mesh>
        <boxGeometry args={[BLOCK.long, BLOCK.h, BLOCK.w]} />
        <meshStandardMaterial
          color={golden ? "#c9a227" : "#1a1030"}
          emissive={golden ? "#ffcc33" : color}
          emissiveIntensity={golden ? 0.9 : 0.55}
          metalness={golden ? 0.9 : 0.1}
          roughness={golden ? 0.25 : 0.6}
        />
      </mesh>
      <Label
        text={label}
        size={[0.5, 0.12]}
        position={[0, 0, BLOCK.w / 2 + 0.002]}
        options={{ color: golden ? "#fff3b0" : "#ffffff", fontVar: "--font-mono", fontSize: 48, height: 64, glow: false }}
      />
    </RigidBody>
  )
}

function Tower({ onCoinMoved }: { onCoinMoved: () => void }) {
  const palette = usePalette()
  const coin = useRef<RapierRigidBody>(null)
  const start = useRef<THREE.Vector3 | null>(null)
  const done = useRef(false)
  const colors = [palette.pink, palette.cyan, palette.purple]

  useFrame(() => {
    if (done.current || !coin.current) return
    const t = coin.current.translation()
    start.current ??= new THREE.Vector3(t.x, t.y, t.z)
    if (start.current.distanceTo(new THREE.Vector3(t.x, t.y, t.z)) > 0.5) {
      done.current = true
      onCoinMoved()
    }
  })

  const blocks = []
  for (let level = 0; level < LEVELS; level++) {
    const rotated = level % 2 === 1
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * (BLOCK.w + 0.005)
      const y = TABLE_Y + 0.05 + BLOCK.h / 2 + level * (BLOCK.h + 0.002)
      const golden = level === 2 && i === 1
      blocks.push(
        <Block
          key={`${level}-${i}`}
          position={[ORIGIN.x + (rotated ? offset : 0), y, ORIGIN.z + (rotated ? 0 : offset)]}
          rotation={rotated ? Math.PI / 2 : 0}
          color={colors[(level + i) % 3]}
          label={golden ? "$$$" : STACK[(level * 3 + i) % STACK.length]}
          golden={golden}
          bodyRef={golden ? coin : undefined}
        />
      )
    }
  }
  return <>{blocks}</>
}

export default function PhysicsToy() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const focus = useStage((s) => s.focus)
  const game = useStage((s) => s.game)
  const discover = useDiscover()
  const camera = useThree((s) => s.camera)
  const [balls, setBalls] = useState<Ball[]>([])
  const [round, setRound] = useState(0)
  const nextId = useRef(0)
  const focused = focus === "physics"

  // R resets the tower while the physics corner is focused.
  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "r" || (e.target as HTMLElement)?.closest("input,textarea")) return
      setBalls([])
      setRound((r) => r + 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focused])

  const fire = (e: ThreeEvent<PointerEvent>) => {
    if (!focused) return
    e.stopPropagation()
    const dir = e.point.clone().sub(camera.position).normalize()
    const from = camera.position.clone().add(dir.clone().multiplyScalar(0.6))
    const v = dir.multiplyScalar(16)
    sfx.shoot()
    const id = nextId.current++
    setBalls((list) => [...list.slice(-(MAX_BALLS - 1)), { id, position: from.toArray(), velocity: v.toArray() }])
  }

  return (
    <group>
      {/* Table (visual) */}
      <group position={ORIGIN.toArray()}>
        <mesh position={[0, TABLE_Y, 0]}>
          <boxGeometry args={[2.2, 0.1, 1.6]} />
          <meshStandardMaterial color={palette.body} emissive={palette.purple} emissiveIntensity={0.2} />
        </mesh>
        {[-1, 1].flatMap((x) =>
          [-0.7, 0.7].map((z) => (
            <mesh key={`${x}${z}`} position={[x, TABLE_Y / 2, z]}>
              <boxGeometry args={[0.08, TABLE_Y, 0.08]} />
              <meshStandardMaterial color={palette.body} />
            </mesh>
          ))
        )}
        <Label
          text={focused ? `${dict.nav.physics} · click to fire · R` : dict.nav.physics}
          size={[2, 0.24]}
          position={[0, 2.2, -0.6]}
          options={{
            color: palette.yellow,
            fontSize: 44,
            height: 90,
            fontVar: lang === "fa" ? "--font-fa" : "--font-display",
            dir: lang === "fa" ? "rtl" : "ltr",
          }}
        />
      </group>

      {/* Click target: focuses the corner, then fires balls once focused. */}
      <Hotspot id="physics" disabled={focused} onActivate={() => useStage.getState().focusOn("physics")}>
        <mesh position={[ORIGIN.x, 1.4, ORIGIN.z]} visible={false} onPointerDown={fire}>
          <boxGeometry args={[2.4, 1.6, 1.8]} />
        </mesh>
      </Hotspot>

      <Physics timeStep={1 / 60} paused={!!game}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.1, 0.05, 0.8]} position={[ORIGIN.x, TABLE_Y, ORIGIN.z]} />
          <CuboidCollider args={[9, 0.05, 8]} position={[0, -0.05, 0]} />
        </RigidBody>
        <Tower key={round} onCoinMoved={() => discover("golden-coin")} />
        {balls.map((ball) => (
          <RigidBody key={ball.id} colliders="ball" position={ball.position} linearVelocity={ball.velocity} mass={1.5} restitution={0.3}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color={new THREE.Color(palette.cyan).multiplyScalar(2)} toneMapped={false} />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
    </group>
  )
}

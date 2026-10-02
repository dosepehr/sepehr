"use client"

import { RoundedBox } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import Hotspot from "@/components/Arcade/Hotspot"
import Label from "@/components/Arcade/Label"
import type { LabelOptions } from "@/components/Arcade/useCanvasTexture"
import { useDictionary } from "@/components/DictionaryProvider"
import { useStage } from "@/lib/store/stage"
import {
  BLOG_BOARD,
  CASTLE,
  CLOUD_PLATFORM,
  FLAGPOLE,
  FLAG_HEIGHT,
  GAME_HOUSE,
  ISLANDS,
  STAIRS_STEPS,
  STAIRS_X,
  UNDERGROUND_Y,
  WELCOME_SIGN,
  type Level,
  type V3,
} from "./level"
import { textures } from "./textures"

const INK = "#1a1410"

export function useSignFont(): LabelOptions {
  const { lang } = useDictionary()
  return {
    fontVar: lang === "fa" ? "--font-fa" : "--font-display",
    dir: lang === "fa" ? "rtl" : "ltr",
    color: INK,
    glow: false,
    weight: 400,
  }
}

/** A wooden signboard on two posts with pixel text. */
export function Signboard({
  position,
  rotation = 0,
  width,
  lines,
  height = 2.2,
  board = 1.6,
}: {
  position: V3
  rotation?: number
  width: number
  lines: { text: string; size: number; color?: string }[]
  height?: number
  board?: number
}) {
  const font = useSignFont()
  const total = lines.reduce((a, l) => a + l.size * 1.35, 0)
  // Center the block of lines vertically on the board.
  const rows = lines.map((l, i) => {
    const above = lines.slice(0, i).reduce((a, p) => a + p.size * 1.35, 0)
    return { ...l, cy: total / 2 - above - l.size * 0.675 }
  })
  return (
    <group position={position} rotation-y={rotation}>
      {[-width / 2 + 0.3, width / 2 - 0.3].map((x) => (
        <mesh key={x} position={[x, height / 2, -0.05]} castShadow>
          <boxGeometry args={[0.18, height, 0.18]} />
          <meshStandardMaterial color="#7a4a22" roughness={0.9} />
        </mesh>
      ))}
      <group position-y={height - 0.2 + board / 2}>
        <RoundedBox args={[width, board, 0.16]} radius={0.05} castShadow>
          <meshStandardMaterial color="#f3d9a0" roughness={0.8} />
        </RoundedBox>
        <mesh position-z={-0.01}>
          <boxGeometry args={[width + 0.14, board + 0.14, 0.12]} />
          <meshStandardMaterial color="#7a4a22" roughness={0.9} />
        </mesh>
        {rows.map((l) => (
          <Label
            key={l.text}
            text={l.text}
            size={[width - 0.3, l.size]}
            position={[0, l.cy, 0.09]}
            options={{
              ...font,
              color: l.color ?? INK,
              fontSize: 64,
              height: 96,
            }}
          />
        ))}
      </group>
    </group>
  )
}

function Islands() {
  const tex = useMemo(() => {
    const t = textures()
    return ISLANDS.map(([x0, x1]) => {
      const w = x1 - x0
      const top = t.grass.clone()
      top.repeat.set(w, 24)
      top.needsUpdate = true
      const side = t.ground.clone()
      side.repeat.set(w, 3)
      side.needsUpdate = true
      return { top, side, w, x: (x0 + x1) / 2 }
    })
  }, [])
  return (
    <group>
      {tex.map(({ top, side, w, x }, i) => (
        <group key={i} position-x={x}>
          {/* Dirt stops just under the grass so the two tops never z-fight. */}
          <mesh position-y={-1.65} receiveShadow>
            <boxGeometry args={[w, 3.1, 24]} />
            <meshStandardMaterial map={side} roughness={1} />
          </mesh>
          <mesh position-y={-0.075} receiveShadow>
            <boxGeometry args={[w + 0.02, 0.15, 24.02]} />
            <meshStandardMaterial map={top} roughness={1} />
          </mesh>
        </group>
      ))}
      {/* Plank bridge. */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[30.25 + i * 0.5, -0.15, -8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.46, 0.15, 2]} />
          <meshStandardMaterial
            color={i % 2 ? "#9a6232" : "#b5763c"}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

function Water() {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.color.setHSL(
        0.57,
        0.65,
        0.5 + Math.sin(clock.elapsedTime) * 0.02
      )
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[45, -1.4, 0]}>
      <planeGeometry args={[400, 300]} />
      <meshStandardMaterial
        ref={mat}
        color="#3a9ae8"
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  )
}

/** Rolling hills with darker stripes, round trees, bushes and puffy clouds. */
function Decor() {
  const tier = useStage((s) => s.tier)
  const clouds = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    clouds.current?.children.forEach((c, i) => {
      c.position.x += dt * (0.4 + (i % 3) * 0.15)
      if (c.position.x > 140) c.position.x = -40
    })
  })
  const hills: [number, number, number][] = [
    [-8, -10.5, 4],
    [14, -10, 3],
    [26, -10.5, 5],
    [44, -10.5, 4],
    [58, -10, 3],
    [76, -10.5, 5],
    [104, -10, 4],
  ]
  const trees: [number, number][] = [
    [-14, -6],
    [-12.5, 9],
    [9, -9],
    [28, 9],
    [34, -9],
    [47, -9.5],
    [59, 8],
    [66, -8],
    [92, 8],
    [108, -6],
    [110, 6],
  ]
  const bushes: [number, number][] = [
    [-2, 6],
    [10, 5.5],
    [24, 6],
    [39, 6.5],
    [53, 6],
    [67, 6],
    [84, 6],
    [102, 5],
  ]
  return (
    <group>
      {hills.map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh scale={[1, 0.85, 0.7]}>
            <sphereGeometry
              args={[r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color="#5ac54f" roughness={0.9} />
          </mesh>
          {[-0.35, 0.3].map((k) => (
            <mesh
              key={k}
              position={[r * k, r * 0.55, r * 0.55]}
              rotation-x={-0.5}
            >
              <capsuleGeometry args={[0.12, r * 0.25, 4, 8]} />
              <meshStandardMaterial color="#2f8a2c" />
            </mesh>
          ))}
        </group>
      ))}
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.9} castShadow>
            <cylinderGeometry args={[0.18, 0.24, 1.8, 8]} />
            <meshStandardMaterial color="#8a5a2b" />
          </mesh>
          <mesh position-y={2.4} castShadow>
            <sphereGeometry args={[1.1 + (i % 3) * 0.2, 16, 12]} />
            <meshStandardMaterial
              color={i % 2 ? "#3fae49" : "#2e9a3c"}
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}
      {bushes.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[-0.7, 0, 0.7].map((dx, k) => (
            <mesh key={k} position={[dx, k === 1 ? 0.45 : 0.3, 0]} castShadow>
              <sphereGeometry args={[k === 1 ? 0.7 : 0.55, 14, 10]} />
              <meshStandardMaterial color="#4cc04a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      <group ref={clouds}>
        {Array.from({ length: tier === "low" ? 8 : 16 }, (_, i) => (
          <group
            key={i}
            position={[-30 + i * 11, 12 + (i % 4) * 2.5, -22 - (i % 3) * 8]}
            scale={1 + (i % 3) * 0.4}
          >
            {[-1.2, 0, 1.2, 0.5].map((dx, k) => (
              <mesh
                key={k}
                position={[dx, k === 1 ? 0.5 : k === 3 ? 0.8 : 0, 0]}
              >
                <sphereGeometry args={[k === 1 ? 1.3 : 1, 14, 10]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

function Stairs() {
  const tex = useMemo(() => textures().used, [])
  return (
    <group>
      {Array.from({ length: STAIRS_STEPS }, (_, k) =>
        Array.from({ length: k + 1 }, (_, y) =>
          [-1, 0, 1].map((z) => (
            <mesh
              key={`${k}-${y}-${z}`}
              position={[STAIRS_X + k + 0.5, y + 0.5, z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial map={tex} roughness={0.8} />
            </mesh>
          ))
        )
      )}
    </group>
  )
}

function Milestones({ level }: { level: Level }) {
  const stage = useStage.getState
  const { dict } = useDictionary()
  return (
    <group>
      {level.milestones.map((m, i) => (
        <Hotspot
          key={i}
          id={`milestone-${i}`}
          label={dict.mario.experience}
          onActivate={() => stage().focusOn("overview", "about")}
        >
          <Signboard
            position={[STAIRS_X + m.step + 0.5, m.step + 1, -2.6]}
            width={3.2}
            board={1.2}
            height={1.4}
            lines={[
              { text: m.title, size: 0.38, color: "#c4161c" },
              { text: m.sub, size: 0.24 },
            ]}
          />
        </Hotspot>
      ))}
    </group>
  )
}

function CloudPlatform() {
  const { x0, x1, y } = CLOUD_PLATFORM
  return (
    <group position={[(x0 + x1) / 2, y - 0.2, 0]}>
      {[-1.2, -0.4, 0.4, 1.2].map((dx, i) => (
        <mesh key={i} position={[dx, 0, (i % 2) * 0.3 - 0.15]} receiveShadow>
          <sphereGeometry args={[0.8, 14, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function Flagpole() {
  const flag = useRef<THREE.Mesh>(null)
  const cleared = useRef(false)
  useFrame(({ clock }) => {
    const f = flag.current
    if (!f) return
    f.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.15
    // Lowered by the controller via userData.
    const target = f.userData.lowered ? 1.6 : FLAG_HEIGHT - 0.9
    f.position.y += (target - f.position.y) * 0.04
    cleared.current = !!f.userData.lowered
  })
  return (
    <group position={FLAGPOLE}>
      <mesh position-y={FLAG_HEIGHT / 2 + 0.5} castShadow>
        <cylinderGeometry args={[0.07, 0.07, FLAG_HEIGHT]} />
        <meshStandardMaterial color="#5ac54f" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position-y={FLAG_HEIGHT + 0.6}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#43b047" />
      </mesh>
      <mesh ref={flag} name="flag" position={[-0.6, FLAG_HEIGHT - 0.9, 0]}>
        <boxGeometry args={[1.1, 0.8, 0.04]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position-y={0.5} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={textures().used} />
      </mesh>
    </group>
  )
}

function Castle() {
  const { dict } = useDictionary()
  const tex = useMemo(() => {
    const t = textures().castle.clone()
    t.repeat.set(4, 2.5)
    t.needsUpdate = true
    return t
  }, [])
  const merlons = (w: number, y: number, z: number) =>
    Array.from({ length: Math.floor(w) }, (_, i) => (
      <mesh
        key={`${w}-${i}-${y}`}
        position={[-w / 2 + 0.5 + i, y, z]}
        castShadow
      >
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    ))
  return (
    <Hotspot
      id="castle"
      label={dict.mario.castle}
      onActivate={() => useStage.getState().focusOn("overview", "contact")}
    >
      <group position={CASTLE}>
        <mesh position-y={2.5} castShadow receiveShadow>
          <boxGeometry args={[8, 5, 6]} />
          <meshStandardMaterial map={tex} />
        </mesh>
        {merlons(8, 5.3, 2.7)}
        <mesh position-y={6.5} castShadow>
          <boxGeometry args={[4, 3, 3]} />
          <meshStandardMaterial map={tex} />
        </mesh>
        {merlons(4, 8.3, 1.2)}
        {/* Door and windows. */}
        <mesh position={[0, 1.2, 3.01]}>
          <planeGeometry args={[1.6, 2.4]} />
          <meshBasicMaterial color="#120806" />
        </mesh>
        <mesh position={[0, 2.4, 3.01]}>
          <circleGeometry args={[0.8, 24, 0, Math.PI]} />
          <meshBasicMaterial color="#120806" />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 0.9, 6.6, 1.51]}>
            <planeGeometry args={[0.5, 0.9]} />
            <meshBasicMaterial color="#120806" />
          </mesh>
        ))}
        <mesh position={[0, 9.8, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[0.45, 10.4, 0]}>
          <boxGeometry args={[0.9, 0.6, 0.03]} />
          <meshStandardMaterial color="#e52521" />
        </mesh>
      </group>
    </Hotspot>
  )
}

/** Mushroom-roofed hut: the game room. */
function GameHouse() {
  const { dict } = useDictionary()
  const spots = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        const tilt = 0.6 + (i % 2) * 0.35
        return new THREE.Vector3(
          Math.cos(a) * Math.sin(tilt),
          Math.cos(tilt),
          Math.sin(a) * Math.sin(tilt)
        )
      }),
    []
  )
  return (
    <Hotspot
      id="game-house"
      label={dict.mario.gameHouse}
      onActivate={() => useStage.getState().focusOn("overview", "games")}
    >
      <group position={GAME_HOUSE}>
        <mesh position-y={1.4} castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 2, 2.8, 24]} />
          <meshStandardMaterial color="#fff4d6" roughness={0.8} />
        </mesh>
        <mesh position-y={2.8} scale={[1, 0.75, 1]} castShadow>
          <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e52521" roughness={0.6} />
        </mesh>
        {spots.map((p, i) => (
          <mesh
            key={i}
            position={[p.x * 3, 2.8 + p.y * 2.25, p.z * 3]}
            scale={[1, 0.6, 1]}
          >
            <sphereGeometry args={[0.45, 12, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 1.97]}>
          <planeGeometry args={[1, 1.8]} />
          <meshStandardMaterial color="#7a4a22" />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 1.1, 1.8, 1.72]} rotation-y={x * 0.5}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#1a1410" />
          </mesh>
        ))}
      </group>
      <Signboard
        position={[GAME_HOUSE[0], 0, GAME_HOUSE[2] + 3.2]}
        width={3.4}
        board={0.9}
        height={0.9}
        lines={[{ text: dict.mario.gameHouse, size: 0.4, color: "#c4161c" }]}
      />
    </Hotspot>
  )
}

function Welcome() {
  const { dict } = useDictionary()
  return (
    <>
      <Hotspot
        id="welcome"
        label={dict.nav.about}
        onActivate={() => useStage.getState().focusOn("overview", "about")}
      >
        <Signboard
          position={WELCOME_SIGN}
          width={10}
          board={3.2}
          height={1.2}
          lines={[
            {
              text: dict.site.name.toUpperCase(),
              size: 0.95,
              color: "#c4161c",
            },
            { text: dict.site.role, size: 0.42, color: "#0a4f8a" },
            { text: dict.site.tagline, size: 0.36 },
          ]}
        />
      </Hotspot>
      <Signboard
        position={[-6.5, 0, 4.5]}
        rotation={0.35}
        width={4.6}
        board={1.4}
        height={0.8}
        lines={[
          { text: dict.mario.howTo1, size: 0.28 },
          { text: dict.mario.howTo2, size: 0.28 },
          { text: dict.mario.howTo3, size: 0.28 },
        ]}
      />
    </>
  )
}

function ZoneSigns() {
  const { dict } = useDictionary()
  const signs: [number, string][] = [
    [10.5, dict.mario.zones.skills],
    [34.5, dict.mario.zones.projects],
    [64, dict.mario.zones.experience],
    [88.5, dict.mario.zones.contact],
  ]
  return (
    <group>
      {signs.map(([x, text]) => (
        <Signboard
          key={x}
          position={[x, 0, 5.5]}
          rotation={-0.15}
          width={3.6}
          board={0.9}
          height={1}
          lines={[{ text, size: 0.36 }]}
        />
      ))}
    </group>
  )
}

function BlogBoard() {
  const { dict } = useDictionary()
  return (
    <Hotspot
      id="blog-board"
      label={dict.nav.blog}
      onActivate={() => useStage.getState().focusOn("overview", "blog")}
    >
      <Signboard
        position={BLOG_BOARD}
        width={3.4}
        board={1.6}
        height={1}
        lines={[
          { text: dict.nav.blog.toUpperCase(), size: 0.42, color: "#c4161c" },
          { text: dict.mario.blogHint, size: 0.24 },
        ]}
      />
    </Hotspot>
  )
}

/** The underground bonus room: dark blue bricks, coins and a star. */
function BonusRoom() {
  const tex = useMemo(() => {
    const t = textures().brick.clone()
    t.repeat.set(28, 7)
    t.needsUpdate = true
    return t
  }, [])
  const U = UNDERGROUND_Y
  return (
    <group>
      <pointLight
        position={[6, U + 4.5, 2]}
        intensity={60}
        distance={30}
        color="#bcd4ff"
      />
      <mesh position={[6, U + 3.5, -4.5]}>
        <boxGeometry args={[28, 7, 1]} />
        <meshStandardMaterial map={tex} color="#4a6cff" />
      </mesh>
      <mesh position={[6, U - 1, 0]} receiveShadow>
        <boxGeometry args={[28, 2, 8]} />
        <meshStandardMaterial map={tex} color="#3a5ae0" />
      </mesh>
      <mesh position={[6, U + 6.5, 0]}>
        <boxGeometry args={[28, 1, 8]} />
        <meshStandardMaterial map={tex} color="#3a5ae0" />
      </mesh>
      {[-8.5, 20.5].map((x) => (
        <mesh key={x} position={[x, U + 3.5, 0]}>
          <boxGeometry args={[1, 7, 8]} />
          <meshStandardMaterial map={tex} color="#3a5ae0" />
        </mesh>
      ))}
      <mesh position={[7, U + 0.75, 0]} castShadow>
        <boxGeometry args={[6, 1.5, 2]} />
        <meshStandardMaterial map={textures().used} />
      </mesh>
    </group>
  )
}

export default function Scenery({ level }: { level: Level }) {
  return (
    <group>
      <Islands />
      <Water />
      <Decor />
      <Stairs />
      <Milestones level={level} />
      <CloudPlatform />
      <Flagpole />
      <Castle />
      <GameHouse />
      <Welcome />
      <ZoneSigns />
      <BlogBoard />
      <BonusRoom />
    </group>
  )
}

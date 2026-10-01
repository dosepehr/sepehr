"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import type { Post, Skill } from "@/lib/content/types"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useScores } from "@/lib/store/scores"
import { TONE_HEX } from "@/lib/tone"
import Hotspot, { useIsHovered } from "./Hotspot"
import Label from "./Label"
import { ACCENTS, MARQUEE_BG, usePalette } from "./palette"

const useFont = () => {
  const { lang } = useDictionary()
  return {
    fontVar: lang === "fa" ? ("--font-fa" as const) : ("--font-sans" as const),
    dir: lang === "fa" ? ("rtl" as const) : ("ltr" as const),
  }
}

/** Hover feedback: a gentle lift in size (no glow). Attach the ref to a <group>. */
function useHoverLift(id: string) {
  const ref = useRef<THREE.Group>(null)
  const hovered = useIsHovered(id)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const target = hovered ? 1.03 : 1
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, dt * 8))
  })
  return ref
}

export function CrtDesk({
  onDesk,
  onScreen,
}: {
  onDesk: () => void
  onScreen: () => void
}) {
  const palette = usePalette()
  const desk = useHoverLift("desk")
  const crt = useHoverLift("crt")
  return (
    <group position={[6.6, 0, -0.8]} rotation-y={-Math.PI / 2}>
      <Hotspot id="desk" onActivate={onDesk}>
        <group ref={desk}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.08, 1]} />
            <meshStandardMaterial color={palette.trim} roughness={0.7} />
          </mesh>
          {[-1.1, 1.1].map((x) => (
            <mesh key={x} position={[x, 0.37, 0]} castShadow>
              <boxGeometry args={[0.08, 0.74, 0.9]} />
              <meshStandardMaterial color={palette.body} roughness={0.7} />
            </mesh>
          ))}
          {/* Keyboard */}
          <mesh position={[0, 0.81, 0.25]} castShadow>
            <boxGeometry args={[0.9, 0.04, 0.3]} />
            <meshStandardMaterial color="#cfc7b8" roughness={0.8} />
          </mesh>
        </group>
      </Hotspot>
      <Hotspot id="crt" onActivate={onScreen}>
        <group ref={crt}>
          {/* CRT monitor */}
          <mesh position={[0, 1.2, -0.15]} castShadow>
            <boxGeometry args={[0.95, 0.75, 0.7]} />
            <meshStandardMaterial color="#d8d0c0" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.22, 0.205]}>
            <planeGeometry args={[0.78, 0.58]} />
            <meshBasicMaterial color="#10201f" toneMapped={false} />
          </mesh>
          <Label
            text={"sepehr@arcade:~$\n> help_"}
            size={[0.74, 0.5]}
            position={[0, 1.22, 0.21]}
            options={{
              color: "#c8f2ea",
              fontVar: "--font-mono",
              fontSize: 40,
              height: 200,
              align: "left",
              dir: "ltr",
            }}
          />
        </group>
      </Hotspot>
    </group>
  )
}

export function ScoreBoard({
  skills,
  onActivate,
}: {
  skills: Skill[]
  onActivate: () => void
}) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const unlocked = useScores((s) => s.unlockedSkills)
  const lift = useHoverLift("skills")
  const lines = skills
    .slice(0, 8)
    .map(
      (s, i) =>
        `${String(i + 1).padStart(2, "0")} ${s.name.padEnd(11, ".")} ${hydrated && unlocked.includes(s.name) ? "★" : String(s.level * 10).padStart(4, "0")}`
    )
    .join("\n")
  const { fontVar, dir } = useFont()
  return (
    <Hotspot id="skills" onActivate={onActivate}>
      <group position={[8.9, 2.8, -4.2]} rotation-y={-Math.PI / 2}>
        <group ref={lift}>
          {/* Wooden frame + chalkboard */}
          <mesh castShadow>
            <boxGeometry args={[3, 2.6, 0.1]} />
            <meshStandardMaterial color={palette.trim} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.85, 2.45]} />
            <meshStandardMaterial color={palette.board} roughness={1} />
          </mesh>
          <Label
            text={dict.nav.skills}
            size={[2.6, 0.4]}
            position={[0, 0.98, 0.07]}
            options={{
              color: "#f2c25b",
              fontSize: 64,
              height: 100,
              fontVar,
              weight: 700,
              dir,
            }}
          />
          <Label
            text={lines}
            size={[2.6, 1.9]}
            position={[0, -0.2, 0.07]}
            options={{
              color: palette.boardInk,
              fontVar: "--font-mono",
              fontSize: 32,
              height: 380,
              weight: 600,
              align: "left",
              dir: "ltr",
            }}
          />
        </group>
      </group>
    </Hotspot>
  )
}

export function BlogRack({
  posts,
  onActivate,
}: {
  posts: Post[]
  onActivate: () => void
}) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const lift = useHoverLift("blog")
  const { fontVar, dir } = useFont()
  return (
    <Hotspot id="blog" onActivate={onActivate}>
      <group position={[-7.8, 0, 4.6]} rotation-y={Math.PI / 2}>
        <group ref={lift}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.6, 0.6]} />
            <meshStandardMaterial color={palette.trim} roughness={0.7} />
          </mesh>
          {[0.45, 1.0].map((y) => (
            <mesh key={y} position={[0, y, 0.25]}>
              <boxGeometry args={[1.75, 0.03, 0.2]} />
              <meshStandardMaterial color={palette.body} roughness={0.7} />
            </mesh>
          ))}
          {/* Zines, one per post (plus muted filler) */}
          {Array.from({ length: Math.max(6, posts.length) }, (_, i) => (
            <mesh
              key={i}
              position={[-0.7 + (i % 6) * 0.28, i < 6 ? 1.2 : 0.65, 0.22]}
              rotation-x={-0.15}
              castShadow
            >
              <boxGeometry args={[0.22, 0.34, 0.05]} />
              <meshStandardMaterial
                color={i < posts.length ? ACCENTS[i % ACCENTS.length] : "#b8ad9a"}
                roughness={0.6}
              />
            </mesh>
          ))}
          <Label
            text={dict.nav.blog}
            size={[1.6, 0.4]}
            position={[0, 1.85, 0]}
            options={{
              color: "#ffffff",
              fontSize: 66,
              height: 120,
              fontVar,
              weight: 700,
              dir,
              background: MARQUEE_BG,
            }}
          />
        </group>
      </group>
    </Hotspot>
  )
}

export function Payphone({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const lift = useHoverLift("contact")
  const { fontVar, dir } = useFont()
  return (
    <Hotspot id="contact" onActivate={onActivate}>
      <group position={[-3.6, 0, 5.2]}>
        <group ref={lift}>
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 2.2, 0.5]} />
            <meshStandardMaterial color={TONE_HEX.teal} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.3, 0.26]}>
            <boxGeometry args={[0.6, 0.8, 0.06]} />
            <meshStandardMaterial
              color="#2b2f36"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Handset */}
          <mesh position={[-0.2, 1.35, 0.33]} rotation-z={Math.PI / 2} castShadow>
            <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} />
          </mesh>
          <Label
            text={dict.nav.contact}
            size={[0.85, 0.28]}
            position={[0, 2.05, 0.26]}
            options={{
              color: "#ffffff",
              fontSize: 60,
              height: 110,
              fontVar,
              weight: 700,
              dir,
              background: MARQUEE_BG,
            }}
          />
        </group>
      </group>
    </Hotspot>
  )
}

export function Printer({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const lift = useHoverLift("resume")
  const paper = useRef<THREE.Mesh>(null)
  const hovered = useIsHovered("resume")
  const { fontVar, dir } = useFont()
  useFrame((_, dt) => {
    if (!paper.current) return
    const target = hovered ? 0.25 : 0
    paper.current.position.z +=
      (0.25 + target - paper.current.position.z) * Math.min(1, dt * 6)
  })
  return (
    <Hotspot id="resume" onActivate={onActivate}>
      <group position={[0.8, 0, 5.4]}>
        <group ref={lift}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.8, 0.7]} />
            <meshStandardMaterial color="#d9d2c3" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.6]} />
            <meshStandardMaterial color="#efe9dc" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.81, 0.36]}>
            <boxGeometry args={[0.6, 0.02, 0.02]} />
            <meshStandardMaterial color={palette.body} />
          </mesh>
          <mesh
            ref={paper}
            position={[0, 0.82, 0.25]}
            rotation-x={-Math.PI / 2 + 0.2}
          >
            <planeGeometry args={[0.45, 0.6]} />
            <meshStandardMaterial
              color={palette.light}
              side={THREE.DoubleSide}
              roughness={0.9}
            />
          </mesh>
          <Label
            text={dict.nav.resume}
            size={[0.85, 0.26]}
            position={[0, 1.25, 0]}
            options={{
              color: "#ffffff",
              fontSize: 60,
              height: 110,
              fontVar,
              weight: 700,
              dir,
              background: MARQUEE_BG,
            }}
          />
        </group>
      </group>
    </Hotspot>
  )
}

/** The rare ginger cat on top of the back wall. It shows up for a few seconds now and then. */
export function RoofCat({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const cycle = clock.elapsedTime % 40
    g.visible = cycle > 8 && cycle < 20
    g.position.x = 5.5 + Math.sin(clock.elapsedTime * 0.3) * 0.6
  })
  const fur = <meshStandardMaterial color="#d98a4b" roughness={0.9} />
  return (
    <group ref={group} position={[5.5, 6.62, -7.4]}>
      <Hotspot
        id="cat"
        onActivate={() => group.current?.visible && onActivate()}
      >
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.25, 0.2]} />
          {fur}
        </mesh>
        <mesh position={[0.3, 0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.2]} />
          {fur}
        </mesh>
        {[0.23, 0.37].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}>
            <coneGeometry args={[0.05, 0.1, 4]} />
            {fur}
          </mesh>
        ))}
        <mesh position={[-0.33, 0.32, 0]} rotation-z={0.6}>
          <boxGeometry args={[0.05, 0.35, 0.05]} />
          {fur}
        </mesh>
        {/* Generous invisible hitbox: the cat is small and far away. */}
        <mesh position={[0, 0.25, 0]} visible={false}>
          <boxGeometry args={[1.2, 0.9, 0.6]} />
        </mesh>
        <mesh position={[0.36, 0.38, 0.11]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color={palette.body} />
        </mesh>
      </Hotspot>
    </group>
  )
}

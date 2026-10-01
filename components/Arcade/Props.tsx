"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import type { Post, Skill } from "@/lib/content/types"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useScores } from "@/lib/store/scores"
import Hotspot, { useIsHovered } from "./Hotspot"
import Label from "./Label"
import { usePalette } from "./palette"

const useFont = () => {
  const { lang } = useDictionary()
  return { fontVar: lang === "fa" ? ("--font-fa" as const) : ("--font-display" as const), dir: lang === "fa" ? ("rtl" as const) : ("ltr" as const) }
}

/** Pulsing emissive helper for hovered props. */
function useGlow(id: string, base = 1.5) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  const hovered = useIsHovered(id)
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const target = hovered ? base * 2.4 : base
    m.emissiveIntensity += (target - m.emissiveIntensity) * Math.min(1, dt * 8)
  })
  return ref
}

export function CrtDesk({ onDesk, onScreen }: { onDesk: () => void; onScreen: () => void }) {
  const palette = usePalette()
  const glow = useGlow("desk")
  const screenGlow = useGlow("crt", 1.2)
  return (
    <group position={[6.6, 0, -0.8]} rotation-y={-Math.PI / 2}>
      <Hotspot id="desk" onActivate={onDesk}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[2.4, 0.08, 1]} />
          <meshStandardMaterial color={palette.body} emissive={palette.purple} emissiveIntensity={0.15} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 0.37, 0]}>
            <boxGeometry args={[0.08, 0.74, 0.9]} />
            <meshStandardMaterial color={palette.body} />
          </mesh>
        ))}
        <mesh position={[0, 0.79, 0.04]}>
          <boxGeometry args={[2.38, 0.02, 0.02]} />
          <meshStandardMaterial ref={glow} color="black" emissive={palette.purple} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        {/* Keyboard */}
        <mesh position={[0, 0.81, 0.25]}>
          <boxGeometry args={[0.9, 0.04, 0.3]} />
          <meshStandardMaterial color="#0c0816" emissive={palette.cyan} emissiveIntensity={0.2} />
        </mesh>
      </Hotspot>
      <Hotspot id="crt" onActivate={onScreen}>
        {/* CRT monitor */}
        <mesh position={[0, 1.2, -0.15]}>
          <boxGeometry args={[0.95, 0.75, 0.7]} />
          <meshStandardMaterial color="#d8d0c0" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.22, 0.205]}>
          <planeGeometry args={[0.78, 0.58]} />
          <meshStandardMaterial ref={screenGlow} color="black" emissive="#0a2a1a" emissiveIntensity={1.2} />
        </mesh>
        <Label
          text={"sepehr@arcade:~$\n> help_"}
          size={[0.74, 0.5]}
          position={[0, 1.22, 0.21]}
          options={{ color: "#5dff9d", fontVar: "--font-mono", fontSize: 40, height: 200, align: "left", dir: "ltr" }}
        />
      </Hotspot>
    </group>
  )
}

export function ScoreBoard({ skills, onActivate }: { skills: Skill[]; onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const unlocked = useScores((s) => s.unlockedSkills)
  const glow = useGlow("skills", 1)
  const lines = skills
    .slice(0, 8)
    .map((s, i) => `${String(i + 1).padStart(2, "0")} ${s.name.padEnd(11, ".")} ${hydrated && unlocked.includes(s.name) ? "★" : String(s.level * 10).padStart(4, "0")}`)
    .join("\n")
  const { fontVar, dir } = useFont()
  return (
    <Hotspot id="skills" onActivate={onActivate}>
      <group position={[8.9, 2.8, -4.2]} rotation-y={-Math.PI / 2}>
        <mesh>
          <boxGeometry args={[3, 2.6, 0.1]} />
          <meshStandardMaterial ref={glow} color="#07040f" emissive={palette.yellow} emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.9, 2.5]} />
          <meshBasicMaterial color="#07040f" />
        </mesh>
        <Label
          text={dict.nav.skills.toUpperCase()}
          size={[2.6, 0.35]}
          position={[0, 1.0, 0.07]}
          options={{ color: palette.yellow, fontSize: 60, height: 100, fontVar, dir }}
        />
        <Label
          text={lines}
          size={[2.6, 1.9]}
          position={[0, -0.2, 0.07]}
          options={{ color: palette.cyan, fontVar: "--font-mono", fontSize: 30, height: 380, align: "left", dir: "ltr", glow: false }}
        />
      </group>
    </Hotspot>
  )
}

export function BlogRack({ posts, onActivate }: { posts: Post[]; onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const glow = useGlow("blog")
  const { fontVar, dir } = useFont()
  const colors = [palette.pink, palette.cyan, palette.purple, palette.yellow]
  return (
    <Hotspot id="blog" onActivate={onActivate}>
      <group position={[-7.8, 0, 4.6]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.8, 1.6, 0.6]} />
          <meshStandardMaterial color={palette.body} />
        </mesh>
        {[0.45, 1.0].map((y) => (
          <mesh key={y} position={[0, y, 0.25]}>
            <boxGeometry args={[1.75, 0.03, 0.2]} />
            <meshStandardMaterial ref={y === 1 ? glow : undefined} color="black" emissive={palette.cyan} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
        {/* VHS tapes / zines, one per post (plus filler) */}
        {Array.from({ length: Math.max(6, posts.length) }, (_, i) => (
          <mesh key={i} position={[-0.7 + (i % 6) * 0.28, i < 6 ? 1.2 : 0.65, 0.22]} rotation-x={-0.15}>
            <boxGeometry args={[0.22, 0.34, 0.05]} />
            <meshStandardMaterial color={colors[i % colors.length]} emissive={colors[i % colors.length]} emissiveIntensity={i < posts.length ? 0.8 : 0.15} />
          </mesh>
        ))}
        <Label
          text={dict.nav.blog.toUpperCase()}
          size={[1.6, 0.36]}
          position={[0, 1.85, 0]}
          options={{ color: palette.cyan, fontSize: 64, height: 120, fontVar, dir, background: "#0a0514" }}
        />
      </group>
    </Hotspot>
  )
}

export function Payphone({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const glow = useGlow("contact")
  const { fontVar, dir } = useFont()
  return (
    <Hotspot id="contact" onActivate={onActivate}>
      <group position={[-3.6, 0, 5.2]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.9, 2.2, 0.5]} />
          <meshStandardMaterial color={palette.body} />
        </mesh>
        <mesh position={[0, 1.3, 0.26]}>
          <boxGeometry args={[0.6, 0.8, 0.06]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Handset */}
        <mesh position={[-0.2, 1.35, 0.33]} rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
          <meshStandardMaterial ref={glow} color="black" emissive={palette.pink} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Label
          text={dict.nav.contact.toUpperCase()}
          size={[0.85, 0.25]}
          position={[0, 2.05, 0.26]}
          options={{ color: palette.pink, fontSize: 56, height: 110, fontVar, dir, background: "#0a0514" }}
        />
      </group>
    </Hotspot>
  )
}

export function Printer({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const glow = useGlow("resume")
  const paper = useRef<THREE.Mesh>(null)
  const hovered = useIsHovered("resume")
  const { fontVar, dir } = useFont()
  useFrame((_, dt) => {
    if (!paper.current) return
    const target = hovered ? 0.25 : 0
    paper.current.position.z += (0.25 + target - paper.current.position.z) * Math.min(1, dt * 6)
  })
  return (
    <Hotspot id="resume" onActivate={onActivate}>
      <group position={[0.8, 0, 5.4]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.9, 0.8, 0.7]} />
          <meshStandardMaterial color={palette.body} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.6]} />
          <meshStandardMaterial color="#e8e3f0" />
        </mesh>
        <mesh position={[0, 0.81, 0.36]}>
          <boxGeometry args={[0.6, 0.02, 0.02]} />
          <meshStandardMaterial ref={glow} color="black" emissive={palette.yellow} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <mesh ref={paper} position={[0, 0.82, 0.25]} rotation-x={-Math.PI / 2 + 0.2}>
          <planeGeometry args={[0.45, 0.6]} />
          <meshStandardMaterial color="#fffdf5" side={THREE.DoubleSide} />
        </mesh>
        <Label
          text={dict.nav.resume.toUpperCase()}
          size={[0.85, 0.22]}
          position={[0, 1.25, 0]}
          options={{ color: palette.yellow, fontSize: 56, height: 110, fontVar, dir }}
        />
      </group>
    </Hotspot>
  )
}

/** The rare neon cat on top of the back wall. It shows up for a few seconds now and then. */
export function NeonCat({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const cycle = clock.elapsedTime % 40
    g.visible = cycle > 8 && cycle < 20
    g.position.x = 5.5 + Math.sin(clock.elapsedTime * 0.3) * 0.6
  })
  const m = <meshBasicMaterial color={new THREE.Color(palette.pink).multiplyScalar(2.5)} toneMapped={false} />
  return (
    <group ref={group} position={[5.5, 6.62, -7.4]}>
      <Hotspot id="cat" onActivate={() => group.current?.visible && onActivate()}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.5, 0.25, 0.2]} />
          {m}
        </mesh>
        <mesh position={[0.3, 0.35, 0]}>
          <boxGeometry args={[0.22, 0.22, 0.2]} />
          {m}
        </mesh>
        {[0.23, 0.37].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}>
            <coneGeometry args={[0.05, 0.1, 4]} />
            {m}
          </mesh>
        ))}
        <mesh position={[-0.33, 0.32, 0]} rotation-z={0.6}>
          <boxGeometry args={[0.05, 0.35, 0.05]} />
          {m}
        </mesh>
        {/* Generous invisible hitbox: the cat is small and far away. */}
        <mesh position={[0, 0.25, 0]} visible={false}>
          <boxGeometry args={[1.2, 0.9, 0.6]} />
        </mesh>
        <mesh position={[0.36, 0.38, 0.11]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color={palette.yellow} toneMapped={false} />
        </mesh>
      </Hotspot>
    </group>
  )
}

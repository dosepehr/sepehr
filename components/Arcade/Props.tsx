"use client"

import { RoundedBox, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import type { Post, Skill } from "@/lib/content/types"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useScores } from "@/lib/store/scores"
import { BoomBox, Trophy } from "./Decor"
import Hotspot, { useIsHovered } from "./Hotspot"
import Label from "./Label"
import { MODELS } from "./models"
import { usePalette } from "./palette"
import { useCanvasTexture } from "./useCanvasTexture"
import { useModel } from "./useModel"

const useFont = () => {
  const { lang } = useDictionary()
  return {
    fontVar:
      lang === "fa" ? ("--font-fa" as const) : ("--font-display" as const),
    dir: lang === "fa" ? ("rtl" as const) : ("ltr" as const),
  }
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

// Computer screen size in computer.glb (scripts/models/build-props.mjs).
const TERMINAL_ASPECT = 0.49 / 0.37

export function CrtDesk({
  onDesk,
  onScreen,
}: {
  onDesk: () => void
  onScreen: () => void
}) {
  const palette = usePalette()
  const glow = useGlow("desk")
  const terminal = useCanvasTexture("sepehr@arcade:~$\n> help_", {
    width: Math.round(256 * TERMINAL_ASPECT),
    height: 256,
    color: "#5dff9d",
    background: "#021208",
    fontVar: "--font-mono",
    fontSize: 26,
    align: "left",
  })
  const screen = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.3, 1.3, 1.3),
        toneMapped: false,
      }),
    []
  )
  useLayoutEffect(() => {
    screen.map = terminal
    screen.needsUpdate = true
  }, [screen, terminal])
  useLayoutEffect(() => () => screen.dispose(), [screen])
  const slots = useMemo(() => ({ Screen: screen }), [screen])
  const { model } = useModel(MODELS.computer, {
    hoverId: "crt",
    trim: palette.purple,
    slots,
  })
  return (
    <group position={[6.6, 0, -0.8]} rotation-y={-Math.PI / 2}>
      <Hotspot id="desk" onActivate={onDesk}>
        <RoundedBox
          args={[2.4, 0.07, 1]}
          radius={0.03}
          position={[0, 0.755, 0]}
        >
          <meshStandardMaterial
            color={palette.body}
            roughness={0.3}
            metalness={0.3}
          />
        </RoundedBox>
        {[-1.1, 1.1].map((x) => (
          <RoundedBox
            key={x}
            args={[0.08, 0.72, 0.9]}
            radius={0.02}
            position={[x, 0.36, 0]}
          >
            <meshStandardMaterial
              color={palette.body}
              roughness={0.35}
              metalness={0.3}
            />
          </RoundedBox>
        ))}
        <mesh position={[0, 0.755, 0.505]}>
          <boxGeometry args={[2.38, 0.02, 0.01]} />
          <meshStandardMaterial
            ref={glow}
            color="black"
            emissive={palette.purple}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </Hotspot>
      <Hotspot id="crt" onActivate={onScreen}>
        <primitive object={model} position={[0, 0.79, -0.05]} />
        <mesh position={[0, 1.15, -0.05]} visible={false}>
          <boxGeometry args={[0.8, 0.75, 0.9]} />
        </mesh>
      </Hotspot>
      <BoomBox position={[0.8, 0.95, 0.02]} rotation={-0.35} />
      <Trophy position={[-0.85, 0.79, 0.1]} rotation={0.4} />
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
  const glow = useGlow("skills", 1)
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
        <mesh>
          <boxGeometry args={[3, 2.6, 0.1]} />
          <meshStandardMaterial
            ref={glow}
            color="#07040f"
            emissive={palette.yellow}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.9, 2.5]} />
          <meshBasicMaterial color="#07040f" />
        </mesh>
        <Label
          text={dict.nav.skills.toUpperCase()}
          size={[2.6, 0.35]}
          position={[0, 1.0, 0.07]}
          options={{
            color: palette.yellow,
            fontSize: 60,
            height: 100,
            fontVar,
            dir,
          }}
        />
        <Label
          text={lines}
          size={[2.6, 1.9]}
          position={[0, -0.2, 0.07]}
          options={{
            color: palette.cyan,
            fontVar: "--font-mono",
            fontSize: 30,
            height: 380,
            align: "left",
            dir: "ltr",
            glow: false,
          }}
        />
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
            <meshStandardMaterial
              ref={y === 1 ? glow : undefined}
              color="black"
              emissive={palette.cyan}
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* VHS tapes / zines, one per post (plus filler) */}
        {Array.from({ length: Math.max(6, posts.length) }, (_, i) => (
          <mesh
            key={i}
            position={[-0.7 + (i % 6) * 0.28, i < 6 ? 1.2 : 0.65, 0.22]}
            rotation-x={-0.15}
          >
            <boxGeometry args={[0.22, 0.34, 0.05]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              emissive={colors[i % colors.length]}
              emissiveIntensity={i < posts.length ? 0.8 : 0.15}
            />
          </mesh>
        ))}
        <Label
          text={dict.nav.blog.toUpperCase()}
          size={[1.6, 0.36]}
          position={[0, 1.85, 0]}
          options={{
            color: palette.cyan,
            fontSize: 64,
            height: 120,
            fontVar,
            dir,
            background: "#0a0514",
          }}
        />
      </group>
    </Hotspot>
  )
}

export function Payphone({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const { fontVar, dir } = useFont()
  const reduced = usePrefersReducedMotion()
  const sign = useCanvasTexture(dict.nav.contact.toUpperCase(), {
    width: 430,
    height: 110,
    color: palette.pink,
    fontSize: 56,
    fontVar,
    dir,
    background: "#0a0514",
  })
  const signMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.5, 1.5, 1.5),
        toneMapped: false,
      }),
    []
  )
  useLayoutEffect(() => {
    signMat.map = sign
    signMat.needsUpdate = true
  }, [signMat, sign])
  useLayoutEffect(() => () => signMat.dispose(), [signMat])
  const slots = useMemo(() => ({ Sign: signMat }), [signMat])
  const { model, hover } = useModel(MODELS.payphone, {
    hoverId: "contact",
    trim: palette.pink,
    body: palette.body,
    slots,
  })
  const handset = useMemo(() => model.getObjectByName("Handset"), [model])
  // Hover rings the phone: the handset rattles on its hook.
  useFrame(({ clock }) => {
    if (!handset || reduced) return
    const t = clock.elapsedTime
    const ring = Math.sin(t * 3) > 0 ? 1 : 0
    handset.rotation.z = Math.sin(t * 40) * 0.08 * hover.current * ring
  })
  return (
    <Hotspot id="contact" onActivate={onActivate}>
      <group position={[-3.6, 0, 5.2]}>
        <primitive object={model} />
        <mesh position={[0, 1.15, 0]} visible={false}>
          <boxGeometry args={[0.95, 2.3, 0.55]} />
        </mesh>
      </group>
    </Hotspot>
  )
}

export function Printer({ onActivate }: { onActivate: () => void }) {
  const palette = usePalette()
  const { dict } = useDictionary()
  const { fontVar, dir } = useFont()
  const { model, hover } = useModel(MODELS.printer, {
    hoverId: "resume",
    trim: palette.yellow,
    body: palette.body,
  })
  const paper = useMemo(() => model.getObjectByName("Paper"), [model])
  const paperZ = useMemo(() => paper?.position.z ?? 0, [paper])
  // Hover feeds the printed page further out.
  useFrame(() => {
    if (!paper) return
    paper.position.z = paperZ + hover.current * 0.08
    paper.scale.y = 1 + hover.current * 0.35
  })
  return (
    <Hotspot id="resume" onActivate={onActivate}>
      <group position={[0.8, 0, 5.4]}>
        <primitive object={model} />
        <mesh position={[0, 0.45, 0.05]} visible={false}>
          <boxGeometry args={[0.85, 0.95, 0.75]} />
        </mesh>
        <Label
          text={dict.nav.resume.toUpperCase()}
          size={[0.85, 0.22]}
          position={[0, 1.25, 0]}
          options={{
            color: palette.yellow,
            fontSize: 56,
            height: 110,
            fontVar,
            dir,
          }}
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
  const m = (
    <meshBasicMaterial
      color={new THREE.Color(palette.pink).multiplyScalar(2.5)}
      toneMapped={false}
    />
  )
  return (
    <group ref={group} position={[5.5, 6.62, -7.4]}>
      <Hotspot
        id="cat"
        onActivate={() => group.current?.visible && onActivate()}
      >
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

useGLTF.preload(MODELS.computer)
useGLTF.preload(MODELS.payphone)
useGLTF.preload(MODELS.printer)

"use client"

import { Instance, Instances } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import Label from "./Label"
import { usePalette } from "./palette"
import { sunFragment, screenVertex } from "./shaders"

const W = 18
const H = 6.5
const BACK_Z = -7.5
const SIDE_X = 9

// Neon strips: [position, rotation, length, color key]
type Strip = [
  [number, number, number],
  [number, number, number],
  number,
  "pink" | "cyan" | "purple",
]
const STRIPS: Strip[] = [
  [[0, 0.05, BACK_Z + 0.05], [0, 0, 0], W, "pink"],
  [[0, H - 0.1, BACK_Z + 0.05], [0, 0, 0], W, "cyan"],
  [[-SIDE_X + 0.05, 0.05, 0], [0, Math.PI / 2, 0], 16, "purple"],
  [[SIDE_X - 0.05, 0.05, 0], [0, Math.PI / 2, 0], 16, "purple"],
  [[-SIDE_X + 0.05, H - 0.1, 0], [0, Math.PI / 2, 0], 16, "cyan"],
  [[SIDE_X - 0.05, H - 0.1, 0], [0, Math.PI / 2, 0], 16, "cyan"],
  [[-SIDE_X + 0.05, H / 2, BACK_Z + 0.05], [0, 0, Math.PI / 2], H, "pink"],
  [[SIDE_X - 0.05, H / 2, BACK_Z + 0.05], [0, 0, Math.PI / 2], H, "pink"],
]

function Sun() {
  const palette = usePalette()
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uTime: { value: 0 },
    }),
    []
  )
  uniforms.uTop.value.set(palette.sunTop)
  uniforms.uBottom.value.set(palette.sunBottom)
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })
  return (
    <mesh position={[0, 2.35, BACK_Z + 0.02]}>
      <planeGeometry args={[4.4, 4.4]} />
      <shaderMaterial
        vertexShader={screenVertex}
        fragmentShader={sunFragment}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function Walls() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const marqueeRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    // Subtle neon flicker on the marquee.
    const g = marqueeRef.current
    if (!g) return
    const t = clock.elapsedTime
    g.visible = !(Math.sin(t * 13) > 0.995 && Math.sin(t * 0.7) > 0.6)
  })

  return (
    <group>
      {/* Back + side walls */}
      <mesh position={[0, H / 2, BACK_Z]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={palette.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-SIDE_X, H / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[16, H]} />
        <meshStandardMaterial color={palette.wall} roughness={0.9} />
      </mesh>
      <mesh position={[SIDE_X, H / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[16, H]} />
        <meshStandardMaterial color={palette.wall} roughness={0.9} />
      </mesh>

      <Instances limit={STRIPS.length}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshBasicMaterial toneMapped={false} />
        {STRIPS.map(([position, rotation, length, color], i) => (
          <Instance
            key={i}
            position={position}
            rotation={rotation}
            scale={[length, 1, 1]}
            color={new THREE.Color(palette[color]).multiplyScalar(3)}
          />
        ))}
      </Instances>

      <Sun />

      <group ref={marqueeRef}>
        <Label
          text={dict.site.name.toUpperCase()}
          size={[7, 1.6]}
          intensity={2.2}
          position={[0, 5.45, BACK_Z + 0.1]}
          options={{
            fontSize: 96,
            height: 220,
            color: palette.pink,
            fontVar: lang === "fa" ? "--font-fa" : "--font-display",
            weight: 900,
            dir: lang === "fa" ? "rtl" : "ltr",
          }}
        />
        <Label
          text={dict.site.role}
          size={[7, 0.45]}
          intensity={1.4}
          position={[0, 4.75, BACK_Z + 0.1]}
          options={{
            fontSize: 44,
            height: 80,
            color: palette.cyan,
            fontVar: lang === "fa" ? "--font-fa" : "--font-mono",
            weight: 500,
            dir: lang === "fa" ? "rtl" : "ltr",
          }}
        />
      </group>
    </group>
  )
}

export { BACK_Z, H as WALL_HEIGHT, SIDE_X }

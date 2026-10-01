"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import Hotspot, { useIsHovered } from "./Hotspot"
import Label from "./Label"
import { usePalette } from "./palette"
import { attractFragment, screenVertex } from "./shaders"

export type CabinetProps = {
  id: string
  label: string
  color: string
  position: [number, number, number]
  rotation?: number
  onActivate: () => void
  /** Dead screen with an "OUT OF ORDER" sign. */
  broken?: boolean
}

/** Procedural arcade cabinet: body, glowing trims, attract-mode screen, marquee. */
export default function Cabinet({
  id,
  label,
  color,
  position,
  rotation = 0,
  onActivate,
  broken,
}: CabinetProps) {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const hovered = useIsHovered(id)
  const trim = useRef<THREE.MeshBasicMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: (id.length * 7.3) % 10 },
      uColor: { value: new THREE.Color() },
      uBoost: { value: 0 },
    }),
    [id.length]
  )
  uniforms.uColor.value.set(color)
  const trimColor = useMemo(() => new THREE.Color(color), [color])

  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    const target = hovered ? 1 : 0
    uniforms.uBoost.value +=
      (target - uniforms.uBoost.value) * Math.min(1, dt * 8)
    if (trim.current)
      trim.current.color
        .copy(trimColor)
        .multiplyScalar(2 + uniforms.uBoost.value * 3)
  })

  const fontVar = lang === "fa" ? "--font-fa" : "--font-display"
  return (
    <Hotspot id={id} onActivate={onActivate}>
      <group position={position} rotation-y={rotation}>
        {/* Body */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[1.1, 2.1, 0.85]} />
          <meshStandardMaterial
            color={palette.body}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        {/* Side trims */}
        {[-0.56, 0.56].map((x) => (
          <mesh key={x} position={[x, 1.05, 0.1]}>
            <boxGeometry args={[0.03, 2.12, 0.7]} />
            <meshBasicMaterial
              ref={x < 0 ? trim : undefined}
              color={trimColor}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Screen */}
        <mesh position={[0, 1.5, 0.43]} rotation-x={-0.12}>
          <planeGeometry args={[0.86, 0.7]} />
          {broken ? (
            <meshStandardMaterial color="#050308" roughness={0.2} />
          ) : (
            <shaderMaterial
              vertexShader={screenVertex}
              fragmentShader={attractFragment}
              uniforms={uniforms}
              toneMapped={false}
            />
          )}
        </mesh>
        {/* Control panel + buttons */}
        <mesh position={[0, 0.98, 0.52]} rotation-x={-0.5}>
          <boxGeometry args={[1.05, 0.08, 0.35]} />
          <meshStandardMaterial color={palette.body} />
        </mesh>
        {[-0.25, 0.05, 0.25].map((x, i) => (
          <mesh key={x} position={[x, 1.03, 0.55]} rotation-x={-0.5}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
            <meshBasicMaterial
              color={
                i === 0 ? palette.yellow : i === 1 ? palette.cyan : palette.pink
              }
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Marquee */}
        <Label
          text={label}
          size={[1.04, 0.3]}
          position={[0, 2.0, 0.43]}
          options={{
            color,
            fontSize: 52,
            height: 150,
            fontVar,
            dir: lang === "fa" ? "rtl" : "ltr",
            background: "#0a0514",
          }}
        />
        {broken && (
          <Label
            text={dict.games.outOfOrder}
            size={[0.8, 0.2]}
            position={[0, 1.5, 0.45]}
            rotation-z={0.15}
            options={{
              color: "#ff5c5c",
              fontSize: 40,
              height: 100,
              fontVar,
              background: "#1a0606",
            }}
          />
        )}
      </group>
    </Hotspot>
  )
}

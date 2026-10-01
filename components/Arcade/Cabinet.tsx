"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import Hotspot, { useIsHovered } from "./Hotspot"
import Label from "./Label"
import { ACCENTS, MARQUEE_BG, usePalette } from "./palette"
import { attractFragment, screenVertex } from "./shaders"

export type CabinetProps = {
  id: string
  label: string
  /** Body color (hex). Projects pass their tone; games have fixed tones. */
  color: string
  position: [number, number, number]
  rotation?: number
  onActivate: () => void
  /** Dead screen with an "OUT OF ORDER" sign. */
  broken?: boolean
}

/** Procedural arcade cabinet: colored body, dark bezel, calm attract screen, marquee. */
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
  const group = useRef<THREE.Group>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: (id.length * 7.3) % 10 },
      uColor: { value: new THREE.Color() },
      uBoost: { value: 0 },
    }),
    [id.length]
  )
  uniforms.uColor.value.set(color)
  const sideColor = useMemo(
    () => new THREE.Color(color).multiplyScalar(0.78),
    [color]
  )

  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    uniforms.uBoost.value +=
      ((hovered ? 1 : 0) - uniforms.uBoost.value) * Math.min(1, dt * 8)
    // Hover: a gentle lift in size, no glow.
    group.current?.scale.setScalar(1 + uniforms.uBoost.value * 0.03)
  })

  const fontVar = lang === "fa" ? "--font-fa" : "--font-sans"
  const dir = lang === "fa" ? "rtl" : "ltr"
  return (
    <Hotspot id={id} onActivate={onActivate}>
      <group position={position} rotation-y={rotation}>
        <group ref={group}>
          {/* Body */}
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 2.1, 0.85]} />
            <meshStandardMaterial color={color} roughness={0.45} />
          </mesh>
          {/* Side panels */}
          {[-0.56, 0.56].map((x) => (
            <mesh key={x} position={[x, 1.05, 0.1]} castShadow>
              <boxGeometry args={[0.03, 2.12, 0.7]} />
              <meshStandardMaterial color={sideColor} roughness={0.5} />
            </mesh>
          ))}
          {/* Screen bezel + screen */}
          <mesh position={[0, 1.5, 0.41]} rotation-x={-0.12}>
            <boxGeometry args={[0.98, 0.82, 0.06]} />
            <meshStandardMaterial color={palette.body} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.5, 0.445]} rotation-x={-0.12}>
            <planeGeometry args={[0.86, 0.7]} />
            {broken ? (
              <meshStandardMaterial color={palette.screen} roughness={0.2} />
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
          <mesh position={[0, 0.98, 0.52]} rotation-x={-0.5} castShadow>
            <boxGeometry args={[1.05, 0.08, 0.35]} />
            <meshStandardMaterial color={palette.body} roughness={0.6} />
          </mesh>
          {[-0.25, 0.05, 0.25].map((x, i) => (
            <mesh key={x} position={[x, 1.03, 0.55]} rotation-x={-0.5}>
              <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
              <meshStandardMaterial color={ACCENTS[i]} roughness={0.4} />
            </mesh>
          ))}
          {/* Marquee */}
          <Label
            text={label}
            size={[1.06, 0.34]}
            position={[0, 2.0, 0.435]}
            options={{
              color: "#ffffff",
              fontSize: 58,
              height: 160,
              fontVar,
              weight: 700,
              dir,
              background: MARQUEE_BG,
            }}
          />
          {broken && (
            <Label
              text={dict.games.outOfOrder}
              size={[0.8, 0.2]}
              position={[0, 1.5, 0.48]}
              rotation-z={0.15}
              options={{
                color: "#ffffff",
                fontSize: 44,
                height: 100,
                fontVar,
                weight: 700,
                dir,
                background: "#8f1d18",
              }}
            />
          )}
        </group>
      </group>
    </Hotspot>
  )
}

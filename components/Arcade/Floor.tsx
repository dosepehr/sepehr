"use client"

import { MeshReflectorMaterial } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import { useStage } from "@/lib/store/stage"
import { usePalette } from "./palette"
import { gridFragment, gridVertex } from "./shaders"

export default function Floor() {
  const palette = usePalette()
  const tier = useStage((s) => s.tier)
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uScroll: { value: 0 },
      uSize: { value: 1 },
      uFade: { value: 16 },
    }),
    []
  )
  uniforms.uColor.value.set(palette.pink)

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[18, 16]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            color={palette.floor}
            resolution={512}
            blur={[300, 60]}
            mixBlur={1}
            mixStrength={6}
            roughness={0.9}
            metalness={0.4}
            mirror={0.5}
          />
        ) : (
          <meshStandardMaterial color={palette.floor} roughness={0.6} metalness={0.3} />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0.5]}>
        <planeGeometry args={[18, 16]} />
        <shaderMaterial
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

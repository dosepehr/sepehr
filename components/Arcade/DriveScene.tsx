"use client"

import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { driveRef } from "@/components/Games/NeonDrive"
import { LANES, MAX_OBSTACLES } from "@/components/Games/NeonDrive/logic"
import { TONE_HEX } from "@/lib/tone"
import { usePalette } from "./palette"
import { roadFragment, roadVertex } from "./shaders"

const FOG_NEAR = 35
const FOG_FAR = 100

/** Sunny Drive: the room unmounts and this daytime road trip takes over the same canvas. */
export default function DriveScene() {
  const palette = usePalette()
  const car = useRef<THREE.Group>(null)
  const obstacles = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Vector3(), [])

  const road = useMemo(
    () => ({
      uRoad: { value: new THREE.Color() },
      uLine: { value: new THREE.Color("#fffaf0") },
      uScroll: { value: 0 },
      uFogColor: { value: new THREE.Color() },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
    }),
    []
  )

  useLayoutEffect(() => {
    road.uRoad.value.set(palette.road)
    road.uFogColor.value.set(palette.sky)
  }, [palette, road])

  // Rolling hills: static instanced squashed spheres on both sides.
  const hills = useMemo(() => {
    const list: { position: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 24; i++) {
      const side = i % 2 === 0 ? -1 : 1
      list.push({
        position: [side * (14 + (i % 5) * 4), 0, -20 - i * 3.5],
        scale: 4 + ((i * 7) % 5),
      })
    }
    return list
  }, [])
  const hillRef = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = hillRef.current
    if (!m) return
    hills.forEach((h, i) => {
      dummy.position.set(...h.position)
      dummy.scale.set(h.scale, h.scale * 0.55, h.scale)
      dummy.rotation.set(0, i, 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [hills, dummy])

  useFrame(({ camera }, dt) => {
    const state = driveRef.current
    if (!state) return
    road.uScroll.value = state.distance
    if (car.current) {
      car.current.position.x = state.x
      car.current.rotation.z = (LANES[state.lane] - state.x) * -0.15
    }
    const mesh = obstacles.current
    if (mesh) {
      for (let i = 0; i < MAX_OBSTACLES; i++) {
        const o = state.obstacles[i]
        if (o) {
          dummy.position.set(LANES[o.lane], 0.5, o.z)
          dummy.scale.setScalar(1)
        } else {
          dummy.scale.setScalar(0)
        }
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
    // Chase camera.
    camera.position.lerp(target.set(state.x * 0.6, 2.3, 6), Math.min(1, dt * 4))
    camera.lookAt(state.x * 0.3, 0.6, -12)
  })

  return (
    <group>
      <color attach="background" args={[palette.sky]} />
      <fog attach="fog" args={[palette.sky, FOG_NEAR, FOG_FAR]} />
      <hemisphereLight args={[palette.sky, palette.ground, palette.hemi]} />
      <directionalLight
        position={[6, 9, 4]}
        color={palette.sunColor}
        intensity={palette.sunIntensity}
      />

      {/* Grass, then the road on top */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[120, 140]} />
        <meshStandardMaterial color={palette.grass} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -40]}>
        <planeGeometry args={[8, 140]} />
        <shaderMaterial
          vertexShader={roadVertex}
          fragmentShader={roadFragment}
          uniforms={road}
          toneMapped={false}
        />
      </mesh>

      {/* Sun on the horizon */}
      <mesh position={[18, 14, -105]}>
        <circleGeometry args={[6, 48]} />
        <meshBasicMaterial color="#fff6d6" fog={false} toneMapped={false} />
      </mesh>

      <instancedMesh ref={hillRef} args={[undefined, undefined, hills.length]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={palette.hills} roughness={1} />
      </instancedMesh>

      {/* Crates on the road */}
      <instancedMesh
        ref={obstacles}
        args={[undefined, undefined, MAX_OBSTACLES]}
        frustumCulled={false}
      >
        <boxGeometry args={[1.4, 1, 0.6]} />
        <meshStandardMaterial color={TONE_HEX.coral} roughness={0.6} />
      </instancedMesh>

      <group ref={car}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.1, 0.35, 2]} />
          <meshStandardMaterial color={TONE_HEX.teal} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, 0.15]}>
          <boxGeometry args={[0.8, 0.3, 0.9]} />
          <meshStandardMaterial color={palette.light} roughness={0.5} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.35, 1.01]}>
            <boxGeometry args={[0.25, 0.08, 0.02]} />
            <meshStandardMaterial color={TONE_HEX.coral} />
          </mesh>
        ))}
        {[-0.62, 0.62].flatMap((x) =>
          [-0.65, 0.65].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.16, z]}>
              <boxGeometry args={[0.16, 0.32, 0.4]} />
              <meshStandardMaterial color="#24272e" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}

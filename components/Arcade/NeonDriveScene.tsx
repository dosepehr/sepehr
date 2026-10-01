"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { driveRef } from "@/components/Games/NeonDrive"
import { LANES, MAX_OBSTACLES } from "@/components/Games/NeonDrive/logic"
import { MODELS } from "./models"
import { usePalette } from "./palette"
import { gridFragment, gridVertex, screenVertex, sunFragment } from "./shaders"

/** Neon Drive: the room unmounts and this synthwave road takes over the same canvas. */
export default function NeonDriveScene() {
  const palette = usePalette()
  const car = useRef<THREE.Group>(null)
  const truck = useGLTF(MODELS.truck).scene
  // Soft radial falloff for the underglow.
  const glowMap = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext("2d")!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, "rgba(255,255,255,0.9)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])
  useEffect(() => () => glowMap.dispose(), [glowMap])
  const obstacles = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Vector3(), [])

  const grid = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uScroll: { value: 0 },
      uSize: { value: 2 },
      uFade: { value: 80 },
    }),
    []
  )
  const sun = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uTime: { value: 0 },
    }),
    []
  )

  useLayoutEffect(() => {
    grid.uColor.value.set(palette.pink)
    sun.uTop.value.set(palette.sunTop)
    sun.uBottom.value.set(palette.sunBottom)
  }, [palette, grid, sun])

  // Mountains: static instanced cones on both sides.
  const mountains = useMemo(() => {
    const list: { position: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 24; i++) {
      const side = i % 2 === 0 ? -1 : 1
      list.push({
        position: [side * (12 + (i % 5) * 4), 0, -20 - i * 3.5],
        scale: 4 + ((i * 7) % 5),
      })
    }
    return list
  }, [])
  const mountainRef = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = mountainRef.current
    if (!m) return
    mountains.forEach((mt, i) => {
      dummy.position.set(...mt.position)
      dummy.scale.set(mt.scale, mt.scale * 0.8, mt.scale)
      dummy.rotation.set(0, i, 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [mountains, dummy])

  useFrame(({ camera }, dt) => {
    const state = driveRef.current
    sun.uTime.value += dt
    if (!state) return
    grid.uScroll.value = state.distance
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
      <color attach="background" args={["#05010d"]} />
      <fog attach="fog" args={["#05010d", 30, 95]} />
      <ambientLight intensity={0.6} />
      <pointLight
        position={[0, 3, 3]}
        intensity={30}
        color={palette.pink}
        distance={12}
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[60, 120]} />
        <meshBasicMaterial color="#090316" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -40]}>
        <planeGeometry args={[60, 120]} />
        <shaderMaterial
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          uniforms={grid}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 12, -95]}>
        <planeGeometry args={[40, 40]} />
        <shaderMaterial
          vertexShader={screenVertex}
          fragmentShader={sunFragment}
          uniforms={sun}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <instancedMesh
        ref={mountainRef}
        args={[undefined, undefined, mountains.length]}
      >
        <coneGeometry args={[1, 1, 4]} />
        <meshBasicMaterial
          color={palette.purple}
          wireframe
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={obstacles}
        args={[undefined, undefined, MAX_OBSTACLES]}
        frustumCulled={false}
      >
        <boxGeometry args={[1.4, 1, 0.6]} />
        <meshBasicMaterial
          color={new THREE.Color(palette.cyan).multiplyScalar(2)}
          toneMapped={false}
        />
      </instancedMesh>
      <group ref={car}>
        {/* Kenney truck faces +z; the road runs toward -z. */}
        <group rotation-y={Math.PI} scale={0.72}>
          <primitive object={truck} />
        </group>
        {/* Underglow. */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <planeGeometry args={[2.2, 3]} />
          <meshBasicMaterial
            map={glowMap}
            color={new THREE.Color(palette.cyan).multiplyScalar(2)}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload(MODELS.truck)

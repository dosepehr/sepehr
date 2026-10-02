"use client"

import { MeshReflectorMaterial } from "@react-three/drei"
import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useStage } from "@/lib/store/stage"
import { usePalette, type PaletteColors } from "./palette"
import { gridFragment, gridVertex } from "./shaders"

const W = 18
const D = 16
const TILE = 3

/** Seeded PRNG so every visit gets the same carpet. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/**
 * Classic blacklight arcade carpet, drawn once on a canvas: neon squiggles,
 * triangles, rings and zigzags on a deep purple pile. It tiles seamlessly
 * (shapes that cross an edge are drawn again on the other side).
 */
function drawCarpet(palette: PaletteColors) {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = palette.floor
  ctx.fillRect(0, 0, size, size)

  // Pile noise.
  const rand = rng(7)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rand() * 0.035})`
    ctx.fillRect(rand() * size, rand() * size, 2, 2)
  }

  const colors = [palette.pink, palette.cyan, palette.yellow, palette.purple]
  const shapes: ((x: number, y: number, s: number, r: number) => void)[] = [
    // Squiggle
    (x, y, s) => {
      ctx.beginPath()
      for (let t = 0; t <= 1; t += 0.05) {
        const px = x - s + t * s * 2
        const py = y + Math.sin(t * Math.PI * 3) * s * 0.35
        if (t === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    },
    // Triangle
    (x, y, s, r) => {
      ctx.beginPath()
      for (let k = 0; k < 3; k++) {
        const a = r + (k * Math.PI * 2) / 3
        ctx.lineTo(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6)
      }
      ctx.closePath()
      ctx.stroke()
    },
    // Ring
    (x, y, s) => {
      ctx.beginPath()
      ctx.arc(x, y, s * 0.4, 0, Math.PI * 2)
      ctx.stroke()
    },
    // Zigzag
    (x, y, s, r) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(r)
      ctx.beginPath()
      for (let k = 0; k <= 5; k++)
        ctx.lineTo(-s + (k * s * 2) / 5, k % 2 ? -s * 0.2 : s * 0.2)
      ctx.stroke()
      ctx.restore()
    },
    // Plus
    (x, y, s) => {
      ctx.beginPath()
      ctx.moveTo(x - s * 0.3, y)
      ctx.lineTo(x + s * 0.3, y)
      ctx.moveTo(x, y - s * 0.3)
      ctx.lineTo(x, y + s * 0.3)
      ctx.stroke()
    },
  ]

  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  for (let i = 0; i < 46; i++) {
    const x = rand() * size
    const y = rand() * size
    const s = 22 + rand() * 30
    const r = rand() * Math.PI * 2
    const shape = shapes[Math.floor(rand() * shapes.length)]
    ctx.strokeStyle = colors[i % colors.length]
    ctx.lineWidth = 5
    ctx.globalAlpha = 0.55 + rand() * 0.45
    ctx.shadowColor = ctx.strokeStyle
    ctx.shadowBlur = 10
    for (const dx of [-size, 0, size])
      for (const dy of [-size, 0, size]) shape(x + dx, y + dy, s, r)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(W / TILE, D / TILE)
  tex.anisotropy = 8
  return tex
}

export default function Floor() {
  const palette = usePalette()
  const tier = useStage((s) => s.tier)
  const carpet = useMemo(() => drawCarpet(palette), [palette])
  useEffect(() => () => carpet.dispose(), [carpet])

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uScroll: { value: 0 },
      uSize: { value: 2 },
      uFade: { value: 5.5 },
    }),
    []
  )
  uniforms.uColor.value.set(palette.cyan)

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[W, D]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            map={carpet}
            emissiveMap={carpet}
            emissive="#ffffff"
            emissiveIntensity={0.13}
            resolution={512}
            blur={[400, 100]}
            mixBlur={1}
            mixStrength={2.2}
            roughness={0.85}
            metalness={0.2}
            mirror={0.35}
          />
        ) : (
          <meshStandardMaterial
            map={carpet}
            emissiveMap={carpet}
            emissive="#ffffff"
            emissiveIntensity={0.13}
            roughness={0.85}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Center "stage": a glowing grid disc the mascot and the aisle sit on. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0.5]}>
        <circleGeometry args={[5.5, 64]} />
        <shaderMaterial
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Diorama base: the room sits on a thick slab with a neon lip. */}
      <mesh position={[0, -0.26, 0]}>
        <boxGeometry args={[W + 0.6, 0.5, D + 0.6]} />
        <meshStandardMaterial
          color={palette.wall}
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
      {[
        [0, D / 2 + 0.31, W + 0.6, 0],
        [-(W / 2 + 0.31), 0, D + 0.6, Math.PI / 2],
        [W / 2 + 0.31, 0, D + 0.6, Math.PI / 2],
      ].map(([x, z, len, rot]) => (
        <mesh key={`${x}${z}`} position={[x, -0.04, z]} rotation-y={rot}>
          <boxGeometry args={[len, 0.04, 0.02]} />
          <meshBasicMaterial
            color={new THREE.Color(palette.pink).multiplyScalar(2)}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

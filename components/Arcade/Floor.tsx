"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { usePalette } from "./palette"

/** Deterministic pseudo-random so the boards look the same on every load. */
function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** Procedural wood boards: low-contrast grain, seams and staggered butt joints. */
function usePlankTexture(base: string, seam: string) {
  const texture = useMemo(() => {
    const size = 1024
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size
    const ctx = canvas.getContext("2d")!
    const rand = rng(7)
    const boards = 16
    const h = size / boards

    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < boards; i++) {
      const y = i * h
      // Each board is a touch lighter or darker than its neighbours.
      const shade = (rand() - 0.5) * 0.1
      ctx.fillStyle =
        shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`
      ctx.fillRect(0, y, size, h)
      // Faint grain.
      ctx.strokeStyle = "rgba(70,45,20,0.07)"
      ctx.lineWidth = 1
      for (let k = 0; k < 10; k++) {
        const gy = y + rand() * h
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.bezierCurveTo(
          size * 0.3,
          gy + (rand() - 0.5) * 5,
          size * 0.65,
          gy + (rand() - 0.5) * 5,
          size,
          gy + (rand() - 0.5) * 3
        )
        ctx.stroke()
      }
      // Seams between boards, and one staggered butt joint per board.
      ctx.fillStyle = seam
      ctx.fillRect(0, y, size, 2)
      ctx.fillRect(rand() * size, y, 2, h)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    tex.anisotropy = 8
    return tex
  }, [base, seam])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function Floor() {
  const palette = usePalette()
  const map = usePlankTexture(palette.floor, palette.plank)

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[18, 16]} />
      <meshStandardMaterial map={map} roughness={0.7} metalness={0} />
    </mesh>
  )
}

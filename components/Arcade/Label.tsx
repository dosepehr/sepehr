"use client"

import type { ThreeElements } from "@react-three/fiber"
import { useCanvasTexture, type LabelOptions } from "./useCanvasTexture"

/** A flat in-scene text label drawn via a canvas texture. */
export default function Label({
  text,
  size,
  options,
  ...props
}: {
  text: string
  size: [number, number]
  options?: LabelOptions
} & ThreeElements["mesh"]) {
  const aspect = size[0] / size[1]
  const height = options?.height ?? 128
  const map = useCanvasTexture(text, {
    width: Math.round(height * aspect),
    height,
    ...options,
  })
  return (
    <mesh {...props}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={map} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

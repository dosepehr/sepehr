"use client"

import type { ThreeEvent } from "@react-three/fiber"
import type { ReactNode } from "react"
import { sfx } from "@/lib/audio/sfx"
import { useStage } from "@/lib/store/stage"

/** Pointer wrapper: pointer cursor + hover feedback, click to activate. */
export default function Hotspot({
  id,
  onActivate,
  children,
  disabled,
}: {
  id: string
  onActivate: () => void
  children: ReactNode
  disabled?: boolean
}) {
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (disabled || useStage.getState().hovered === id) return
    useStage.getState().setHovered(id)
    document.body.style.cursor = "pointer"
    sfx.hover()
  }
  const out = () => {
    if (useStage.getState().hovered !== id) return
    useStage.getState().setHovered(null)
    document.body.style.cursor = ""
  }
  return (
    <group
      onPointerOver={over}
      onPointerOut={out}
      onClick={(e) => {
        e.stopPropagation()
        if (disabled) return
        sfx.select()
        onActivate()
      }}
    >
      {children}
    </group>
  )
}

export const useIsHovered = (id: string) => useStage((s) => s.hovered === id)

"use client"

import type { ThreeEvent } from "@react-three/fiber"
import { useEffect, useRef, type ReactNode } from "react"
import type * as THREE from "three"
import { registerInteractable } from "@/components/World/interactables"
import { sfx } from "@/lib/audio/sfx"
import { useStage } from "@/lib/store/stage"

/** Pointer wrapper: hover glow + pointer cursor, click to activate. */
export default function Hotspot({
  id,
  onActivate,
  children,
  disabled,
  label,
}: {
  id: string
  onActivate: () => void
  children: ReactNode
  disabled?: boolean
  /** Shown in the explore-mode "press E" prompt. */
  label?: string
}) {
  const group = useRef<THREE.Group>(null)
  const activate = useRef(onActivate)
  useEffect(() => {
    activate.current = onActivate
  })
  useEffect(() => {
    if (!group.current) return
    return registerInteractable(
      id,
      group.current,
      () => {
        sfx.select()
        activate.current()
      },
      label
    )
  }, [id, label])
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
      ref={group}
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

"use client"

import { useSyncExternalStore } from "react"

const MQ = "(max-width: 767px), (pointer: coarse)"

function capable() {
  if (window.matchMedia(MQ).matches) return false
  try {
    return !!document.createElement("canvas").getContext("webgl2")
  } catch {
    return false
  }
}

let cached: boolean | null = null

/** Whether this device could run the 3D arcade (used to offer "Enter 3D" in Lite). */
export function useCapable() {
  return useSyncExternalStore(
    () => () => {},
    () => (cached ??= capable()),
    () => false
  )
}

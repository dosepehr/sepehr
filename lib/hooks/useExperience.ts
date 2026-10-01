"use client"

import { useSyncExternalStore } from "react"
import { usePrefs } from "@/lib/store/prefs"

export type Experience = "pending" | "full" | "lite"

let webgl2: boolean | null = null
function hasWebGL2() {
  if (webgl2 !== null) return webgl2
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get("webgl") === "off") return (webgl2 = false)
    webgl2 = !!document.createElement("canvas").getContext("webgl2")
  } catch {
    webgl2 = false
  }
  return webgl2
}

const MQ = "(max-width: 767px), (pointer: coarse)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MQ)
  mql.addEventListener("change", onChange)
  const unsub = usePrefs.subscribe(onChange)
  return () => {
    mql.removeEventListener("change", onChange)
    unsub()
  }
}

function getSnapshot(): Experience {
  const forced = new URLSearchParams(window.location.search).get("view")
  if (forced === "2d") return "lite"
  if (forced === "3d") return hasWebGL2() ? "full" : "lite"
  if (usePrefs.getState().classic) return "lite"
  if (window.matchMedia(MQ).matches) return "lite"
  return hasWebGL2() ? "full" : "lite"
}

/**
 * `pending` during SSR and hydration, so only the server hero renders first;
 * then `lite` (small viewport, coarse pointer, no WebGL2, ?view=2d or Classic
 * view) or `full`.
 */
export function useExperience() {
  return useSyncExternalStore(subscribe, getSnapshot, () => "pending" as const)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

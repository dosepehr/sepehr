"use client"

import { useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"

/** True once the element has scrolled into view (stays true). */
export function useInView<T extends Element>(margin = "0px") {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setSeen(true),
      { rootMargin: margin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, margin])
  return [ref, seen] as const
}

/** Counts from 0 to `to` once visible. */
export function CountUp({
  to,
  duration = 1400,
}: {
  to: number
  duration?: number
}) {
  const [ref, seen] = useInView<HTMLSpanElement>()
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen || reduced) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, reduced, to, duration])
  return <span ref={ref}>{reduced ? to : n}</span>
}

/** Types `text` out character by character once `start` is true. */
export function useTypewriter(text: string, speed = 45, start = true) {
  const reduced = usePrefersReducedMotion()
  // Progress is stored per text, so a new text starts over without a reset effect.
  const [progress, setProgress] = useState({ text, count: 0 })
  useEffect(() => {
    if (!start || reduced) return
    const id = setInterval(
      () =>
        setProgress((p) => {
          const count = p.text === text ? p.count : 0
          if (count >= text.length) clearInterval(id)
          return { text, count: Math.min(text.length, count + 1) }
        }),
      speed
    )
    return () => clearInterval(id)
  }, [text, speed, start, reduced])
  if (reduced) return text
  return text.slice(0, progress.text === text ? progress.count : 0)
}

/** Years since the earliest "YYYY" found in the experience periods. */
export function yearsOfExperience(periods: string[]) {
  const years = periods
    .map((p) => p.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)))
    .flatMap((p) => p.match(/\d{4}/g) ?? [])
    .map(Number)
  if (!years.length) return 0
  return new Date().getFullYear() - Math.min(...years)
}

export const NEON = [
  "var(--neon-pink)",
  "var(--neon-cyan)",
  "var(--neon-purple)",
  "var(--neon-yellow)",
  "var(--neon-orange)",
]

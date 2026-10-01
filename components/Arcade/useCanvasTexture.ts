"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"

export type LabelOptions = {
  width?: number
  height?: number
  fontSize?: number
  color?: string
  background?: string
  /** CSS custom property holding the font family (set by next/font on <html>). */
  fontVar?: "--font-sans" | "--font-fa" | "--font-mono"
  weight?: number
  dir?: "ltr" | "rtl"
  align?: CanvasTextAlign
  lineHeight?: number
}

/** Backing-store scale: labels stay crisp when the camera moves in. */
const SCALE = 2

function fontFamily(fontVar: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(fontVar)
    .trim()
  return value || "sans-serif"
}

/**
 * Draw text on a 2D canvas and use it as a texture. The browser does Persian
 * shaping and bidi, so in-scene labels work in both locales without SDF fonts.
 * Multi-line text: separate lines with "\n".
 */
export function useCanvasTexture(text: string, options: LabelOptions = {}) {
  const {
    width = 512,
    height = 128,
    fontSize = 64,
    color = "#261d16",
    background = "transparent",
    fontVar = "--font-sans",
    weight = 700,
    dir = "ltr",
    align = "center",
    lineHeight = 1.25,
  } = options

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = width * SCALE
    canvas.height = height * SCALE
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [width, height])

  useEffect(() => {
    let cancelled = false
    const draw = () => {
      if (cancelled) return
      const canvas = texture.image as HTMLCanvasElement
      const ctx = canvas.getContext("2d")!
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
      ctx.clearRect(0, 0, width, height)
      if (background !== "transparent") {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, width, height)
      }
      ctx.direction = dir
      ctx.textAlign = align
      ctx.textBaseline = "middle"
      ctx.font = `${weight} ${fontSize}px ${fontFamily(fontVar)}`
      ctx.fillStyle = color
      const lines = text.split("\n")
      const x =
        align === "center"
          ? width / 2
          : align === "right" || align === "end"
            ? width - 16
            : 16
      const total = lines.length * fontSize * lineHeight
      lines.forEach((line, i) => {
        const y = height / 2 - total / 2 + fontSize * lineHeight * (i + 0.5)
        ctx.fillText(line, x, y, width - 24)
      })
      texture.needsUpdate = true
    }
    draw()
    // Redraw once web fonts are ready so the first frame isn't a fallback font.
    void document.fonts?.ready.then(draw)
    return () => {
      cancelled = true
    }
  }, [
    texture,
    text,
    width,
    height,
    fontSize,
    color,
    background,
    fontVar,
    weight,
    dir,
    align,
    lineHeight,
  ])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}

import * as THREE from "three"

/** 16×16 pixel-art textures drawn on a canvas, sampled with nearest filtering. */
function pixelTexture(
  draw: (px: (x: number, y: number, c: string) => void) => void,
  size = 16
) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  draw((x, y, c) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, 1, 1)
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestMipMapNearestFilter
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

const fill = (
  px: (x: number, y: number, c: string) => void,
  c: string,
  size = 16
) => {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px(x, y, c)
}

// "?" glyph, 6×8, drawn from rows.
const QMARK = [
  "011110",
  "110011",
  "000011",
  "000110",
  "001100",
  "001100",
  "000000",
  "001100",
]

function question(empty: boolean) {
  return pixelTexture((px) => {
    const face = empty ? "#a0522d" : "#f8b800"
    const shade = empty ? "#6b3416" : "#c84c0c"
    fill(px, face)
    for (let i = 0; i < 16; i++) {
      px(i, 15, shade)
      px(15, i, shade)
      px(i, 0, empty ? "#c07040" : "#ffd870")
      px(0, i, empty ? "#c07040" : "#ffd870")
    }
    // Rivets in the corners.
    for (const [x, y] of [
      [2, 2],
      [13, 2],
      [2, 13],
      [13, 13],
    ])
      px(x, y, shade)
    if (empty) return
    QMARK.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== "1") return
        px(5 + x, 4 + y, "#ffffff")
        px(6 + x, 5 + y, shade)
      })
    )
    QMARK.forEach((row, y) =>
      [...row].forEach((c, x) => c === "1" && px(5 + x, 4 + y, "#ffffff"))
    )
  })
}

function brick() {
  return pixelTexture((px) => {
    fill(px, "#c84c0c")
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const row = Math.floor(y / 4)
        const offset = row % 2 ? 4 : 0
        if (y % 4 === 3 || (x + offset) % 8 === 7) px(x, y, "#5a1e02")
        else if (y % 4 === 0) px(x, y, "#f0a070")
      }
  })
}

function ground() {
  return pixelTexture((px) => {
    fill(px, "#c8742c")
    const dark = "#8a4416"
    const light = "#f0b070"
    for (let i = 0; i < 16; i++) {
      px(i, 15, dark)
      px(15, i, dark)
      px(i, 7, dark)
      px(7, i < 8 ? i : 15, dark)
      px(0, i, light)
      px(i, 0, light)
    }
    for (let i = 8; i < 15; i++) px(11, i, dark)
  })
}

function grass() {
  return pixelTexture((px) => {
    fill(px, "#5ac54f")
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++)
        if ((x * 7 + y * 13) % 11 === 0) px(x, y, "#3e9b3a")
        else if ((x * 5 + y * 3) % 17 === 0) px(x, y, "#8ee07a")
  })
}

function pipe() {
  return pixelTexture((px) => {
    const cols = [
      "#1e7a2e",
      "#2f9e3c",
      "#7ce07a",
      "#c8ffc0",
      "#7ce07a",
      "#43b047",
      "#43b047",
      "#2f9e3c",
      "#2f9e3c",
      "#1e7a2e",
      "#1e7a2e",
      "#155a22",
      "#155a22",
      "#0c3d16",
      "#0c3d16",
      "#0c3d16",
    ]
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, cols[x])
  })
}

function castle() {
  return pixelTexture((px) => {
    fill(px, "#b85c28")
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const offset = Math.floor(y / 4) % 2 ? 4 : 0
        if (y % 4 === 3 || (x + offset) % 8 === 7) px(x, y, "#3a1a08")
      }
  })
}

let cache: ReturnType<typeof make> | null = null
function make() {
  return {
    question: question(false),
    used: question(true),
    brick: brick(),
    ground: ground(),
    grass: grass(),
    pipe: pipe(),
    castle: castle(),
  }
}

/** Shared textures, created once on first use (client only). */
export function textures() {
  cache ??= make()
  return cache
}

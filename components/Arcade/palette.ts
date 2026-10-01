import { useTheme } from "next-themes"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useStage } from "@/lib/store/stage"
import { TONE_HEX } from "@/lib/tone"

/**
 * Colors of the 3D room (hex: three.js can't parse oklch). Two themes follow
 * the site theme; "golden hour" (Konami code) warms whichever is active.
 * Cabinet bodies use TONE_HEX per project; everything else comes from here.
 */
export type PaletteColors = {
  /** Scene background and fog. */
  bg: string
  wall: string
  /** Wainscot (lower wall). */
  wainscot: string
  /** Skirting, shelves, desk tops: painted wood. */
  trim: string
  /** Floor boards and the darker seams between them. */
  floor: string
  plank: string
  /** Neutral plastic and metal on props. */
  body: string
  /** Dark CRT glass behind game screens. */
  screen: string
  /** Text painted on the wall, and its softer sibling. */
  ink: string
  inkSoft: string
  /** Text and paper on dark surfaces. */
  light: string
  /** Chalkboard (skills) and its text. */
  board: string
  boardInk: string
  /** Wall mural sun and its stripes. */
  mural: string
  sky: string
  ground: string
  hemi: number
  sunColor: string
  sunIntensity: number
  /** Road trip (Sunny Drive). */
  road: string
  grass: string
  hills: string
}

const DAY: PaletteColors = {
  bg: "#fbf4e6",
  wall: "#f3ead9",
  wainscot: "#cfe3df",
  trim: "#d8c8ae",
  floor: "#d5b087",
  plank: "#b98b60",
  body: "#2d333d",
  screen: "#11161f",
  ink: "#261d16",
  inkSoft: "#005b5c",
  light: "#fffdf5",
  board: "#1d2a25",
  boardInk: "#f3efe6",
  mural: "#f0b27a",
  sky: "#fff7e8",
  ground: "#efe0c6",
  hemi: 1.75,
  sunColor: "#fff0d6",
  sunIntensity: 1.9,
  road: "#4b4f58",
  grass: "#b9d99a",
  hills: "#9cc79a",
}

const NIGHT: PaletteColors = {
  bg: "#1b1715",
  wall: "#4a4038",
  wainscot: "#3f5a58",
  trim: "#6b5a49",
  floor: "#6a4f38",
  plank: "#4a3626",
  body: "#2a303a",
  screen: "#0b0f16",
  ink: "#f1ece3",
  inkSoft: "#73d1ca",
  light: "#f1ece3",
  board: "#121a17",
  boardInk: "#f3efe6",
  mural: "#c98a5b",
  sky: "#a9b8d0",
  ground: "#6b5a4a",
  hemi: 2.2,
  sunColor: "#d3def5",
  sunIntensity: 2.0,
  road: "#3a3e46",
  grass: "#47623f",
  hills: "#3c5a3c",
}

const GOLDEN_DAY: PaletteColors = {
  ...DAY,
  bg: "#fee3c5",
  wall: "#f7dfbf",
  mural: "#f08a5d",
  sky: "#ffd9a8",
  ground: "#e0b88c",
  sunColor: "#ffc27a",
  sunIntensity: 2.1,
  grass: "#cfd68a",
}

const GOLDEN_NIGHT: PaletteColors = {
  ...NIGHT,
  bg: "#2b2018",
  wall: "#5a4332",
  sky: "#c9a070",
  ground: "#6a5038",
  sunColor: "#ffb66b",
  sunIntensity: 1.8,
}

export const PALETTES = {
  day: DAY,
  night: NIGHT,
  goldenDay: GOLDEN_DAY,
  goldenNight: GOLDEN_NIGHT,
}

export const usePalette = (): PaletteColors => {
  const { resolvedTheme } = useTheme()
  const hydrated = useHydrated()
  const golden = useStage((s) => s.palette === "golden")
  const dark = hydrated && resolvedTheme === "dark"
  if (dark) return golden ? PALETTES.goldenNight : PALETTES.night
  return golden ? PALETTES.goldenDay : PALETTES.day
}

/** Marquee and sign panels are always dark with white text: high contrast in both themes. */
export const MARQUEE_BG = "#1b1f27"

/** The four cabinet-button / prop accents, in a fixed order. */
export const ACCENTS = [
  TONE_HEX.amber,
  TONE_HEX.teal,
  TONE_HEX.coral,
  TONE_HEX.indigo,
] as const

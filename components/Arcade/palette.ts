import { useStage } from "@/lib/store/stage"

export const PALETTES = {
  synthwave: {
    pink: "#ff2d95",
    cyan: "#22e5ff",
    purple: "#b45cff",
    yellow: "#ffe14d",
    bg: "#0b0618",
    floor: "#0e0820",
    wall: "#150b2c",
    body: "#1a1030",
    sunTop: "#ffe14d",
    sunBottom: "#ff2d95",
  },
  // Konami code: vaporwave sunset.
  vaporwave: {
    pink: "#ff71ce",
    cyan: "#01cdfe",
    purple: "#b967ff",
    yellow: "#fffb96",
    bg: "#2a0f3a",
    floor: "#26103a",
    wall: "#3a1648",
    body: "#3b1a52",
    sunTop: "#ffb86c",
    sunBottom: "#ff71ce",
  },
}

export type PaletteColors = (typeof PALETTES)["synthwave"]

export const usePalette = () => PALETTES[useStage((s) => s.palette)]

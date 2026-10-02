import type { HotspotId } from "@/components/Arcade/hotspots"
import type { GameId } from "./scores"
import { createStore } from "./createStore"

export type PerfTier = "high" | "medium" | "low"
/** Explore: walk the robot around. Tour: the hotspot camera. */
export type ViewMode = "explore" | "tour"
export type Palette = "synthwave" | "vaporwave"
export type PanelId =
  "project" | "blog" | "about" | "skills" | "contact" | "resume" | "games"

type StageState = {
  /** Where the camera is (or is heading). */
  focus: HotspotId
  /** Overlay panel currently open over the room. */
  panel: PanelId | null
  /** Slug of the project whose cabinet is focused. */
  projectSlug: string | null
  /** A 2D game covering the canvas, or Neon Drive replacing the room. */
  game: GameId | null
  terminalOpen: boolean
  tier: PerfTier
  palette: Palette
  hovered: string | null
  mode: ViewMode
  /** Interactable the player is standing next to (explore mode). */
  nearby: string | null
  setMode: (mode: ViewMode) => void
  setNearby: (id: string | null) => void
  focusOn: (
    focus: HotspotId,
    panel?: PanelId | null,
    projectSlug?: string | null
  ) => void
  back: () => void
  setPanel: (panel: PanelId | null) => void
  setGame: (game: GameId | null) => void
  setTerminal: (open: boolean) => void
  setTier: (tier: PerfTier) => void
  setPalette: (palette: Palette) => void
  setHovered: (id: string | null) => void
}

export const useStage = createStore<StageState>(
  (set, get) => ({
    focus: "overview",
    panel: null,
    projectSlug: null,
    game: null,
    terminalOpen: false,
    tier: "medium",
    palette: "synthwave",
    hovered: null,
    mode: "explore",
    nearby: null,
    setMode: (mode) =>
      set({ mode, focus: "overview", panel: null }, false, `mode/${mode}`),
    setNearby: (nearby) => set({ nearby }, false, "setNearby"),
    focusOn: (focus, panel = null, projectSlug = null) =>
      set({ focus, panel, projectSlug }, false, `focus/${focus}`),
    back: () => {
      const { game, terminalOpen, panel, focus } = get()
      if (game) return set({ game: null }, false, "back/game")
      if (terminalOpen)
        return set({ terminalOpen: false }, false, "back/terminal")
      if (panel) return set({ panel: null }, false, "back/panel")
      if (focus !== "overview")
        return set(
          { focus: "overview", projectSlug: null },
          false,
          "back/focus"
        )
    },
    setPanel: (panel) => set({ panel }, false, "setPanel"),
    setGame: (game) => set({ game, panel: null }, false, "setGame"),
    setTerminal: (terminalOpen) => set({ terminalOpen }, false, "setTerminal"),
    setTier: (tier) => set({ tier }, false, "setTier"),
    setPalette: (palette) => set({ palette }, false, "setPalette"),
    setHovered: (hovered) => set({ hovered }, false, "setHovered"),
  }),
  "stage"
)

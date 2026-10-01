import type { GameId } from "@/lib/store/scores"
import BugBlaster from "./BugBlaster"
import type { BaseState, GameDef, GameOptions } from "./engine/types"
import NeonDrive from "./NeonDrive"
import TechCatcher from "./TechCatcher"

export type GameEntry = {
  def: GameDef<BaseState>
  options?: GameOptions
  /** 3D games render in the arcade canvas and are hidden in Lite. */
  is3d?: boolean
  color: string
}

export const GAMES: Record<GameId, GameEntry> = {
  "tech-catcher": { def: TechCatcher as unknown as GameDef<BaseState>, color: "#22e5ff" },
  "bug-blaster": { def: BugBlaster as unknown as GameDef<BaseState>, color: "#b45cff" },
  "neon-drive": { def: NeonDrive as unknown as GameDef<BaseState>, is3d: true, color: "#ff2d95" },
  "friday-night": {
    def: BugBlaster as unknown as GameDef<BaseState>,
    options: { hard: true },
    color: "#ffe14d",
  },
}

export const GAME_IDS = Object.keys(GAMES) as GameId[]

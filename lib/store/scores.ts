import { createPersistedStore } from "./createPersistedStore"

export type GameId =
  | "tech-catcher"
  | "bug-blaster"
  | "neon-drive"
  | "neon-snake"
  | "brick-breaker"
  | "pixel-pong"
  | "friday-night"

type ScoreState = {
  best: Partial<Record<GameId, number>>
  /** Skills caught in Tech Catcher; they light up on the skills board. */
  unlockedSkills: string[]
  submit: (game: GameId, score: number) => boolean
  unlockSkill: (skill: string) => void
}

export const useScores = createPersistedStore<ScoreState>(
  (set, get) => ({
    best: {},
    unlockedSkills: [],
    submit: (game, score) => {
      const prev = get().best[game] ?? 0
      if (score <= prev) return false
      set({ best: { ...get().best, [game]: score } }, false, `submit/${game}`)
      return true
    },
    unlockSkill: (skill) => {
      if (get().unlockedSkills.includes(skill)) return
      set(
        { unlockedSkills: [...get().unlockedSkills, skill] },
        false,
        "unlockSkill"
      )
    },
  }),
  "scores",
  { partialize: (s) => ({ best: s.best, unlockedSkills: s.unlockedSkills }) }
)

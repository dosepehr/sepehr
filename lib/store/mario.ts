import { createPersistedStore } from "./createPersistedStore"

export const POWERUP_IDS = [
  "mystery-mushroom",
  "one-up",
  "fire-flower",
  "super-star",
  "cloud-coin",
  "golden-key",
] as const
export type PowerUpId = (typeof POWERUP_IDS)[number]

export type Costume = "8bit" | "3d"

type MarioState = {
  coins: string[]
  powerUps: PowerUpId[]
  score: number
  costume: Costume
  /** The flagpole has been reached at least once. */
  cleared: boolean
  collectCoin: (id: string) => boolean
  findPowerUp: (id: PowerUpId) => boolean
  addScore: (points: number) => void
  setCostume: (costume: Costume) => void
  clear: () => void
}

/** Progress in the mushroom-kingdom world. Persisted so a visit can be continued. */
export const useMario = createPersistedStore<MarioState>(
  (set, get) => ({
    coins: [],
    powerUps: [],
    score: 0,
    costume: "8bit",
    cleared: false,
    collectCoin: (id) => {
      if (get().coins.includes(id)) return false
      set(
        { coins: [...get().coins, id], score: get().score + 200 },
        false,
        "coin"
      )
      return true
    },
    findPowerUp: (id) => {
      if (get().powerUps.includes(id)) return false
      set(
        { powerUps: [...get().powerUps, id], score: get().score + 1000 },
        false,
        `powerup/${id}`
      )
      return true
    },
    addScore: (points) => set({ score: get().score + points }, false, "score"),
    setCostume: (costume) => set({ costume }, false, "costume"),
    clear: () => set({ cleared: true }, false, "clear"),
  }),
  "mario",
  {
    partialize: (s) => ({
      coins: s.coins,
      powerUps: s.powerUps,
      score: s.score,
      costume: s.costume,
      cleared: s.cleared,
    }),
  }
)

export const allPowerUpsFound = (found: PowerUpId[]) =>
  POWERUP_IDS.every((id) => found.includes(id))

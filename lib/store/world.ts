import { createPersistedStore } from "./createPersistedStore"

export const RELIC_IDS = [
  "rubber-duck",
  "floppy",
  "cassette",
  "ufo",
  "any-key",
  "cartridge",
] as const
export type RelicId = (typeof RELIC_IDS)[number]

type WorldState = {
  coins: number[]
  relics: RelicId[]
  collectCoin: (index: number) => boolean
  findRelic: (id: RelicId) => boolean
}

/** What the visitor has picked up in the explorable world. */
export const useWorld = createPersistedStore<WorldState>(
  (set, get) => ({
    coins: [],
    relics: [],
    collectCoin: (index) => {
      if (get().coins.includes(index)) return false
      set({ coins: [...get().coins, index] }, false, "coin")
      return true
    },
    findRelic: (id) => {
      if (get().relics.includes(id)) return false
      set({ relics: [...get().relics, id] }, false, `relic/${id}`)
      return true
    },
  }),
  "world",
  { partialize: (s) => ({ coins: s.coins, relics: s.relics }) }
)

export const allRelicsFound = (relics: RelicId[]) =>
  RELIC_IDS.every((id) => relics.includes(id))

import { QUEST_IDS, type QuestId } from "@/lib/quests"
import { createPersistedStore } from "./createPersistedStore"

type QuestState = {
  found: QuestId[]
  /** Returns true when this call discovered the quest for the first time. */
  discover: (id: QuestId) => boolean
  reset: () => void
}

export const useQuests = createPersistedStore<QuestState>(
  (set, get) => ({
    found: [],
    discover: (id) => {
      if (get().found.includes(id)) return false
      set({ found: [...get().found, id] }, false, `discover/${id}`)
      return true
    },
    reset: () => set({ found: [] }, false, "reset"),
  }),
  "quests",
  { partialize: (s) => ({ found: s.found }) }
)

export const allQuestsFound = (found: QuestId[]) =>
  QUEST_IDS.every((id) => found.includes(id))

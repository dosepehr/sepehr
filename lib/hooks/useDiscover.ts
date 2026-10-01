"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import type { QuestId } from "@/lib/quests"
import { allQuestsFound, useQuests } from "@/lib/store/quests"

/** Discover a quest with a toast + SFX. Safe to call repeatedly. */
export function useDiscover() {
  const { dict } = useDictionary()
  return useCallback(
    (id: QuestId) => {
      const isNew = useQuests.getState().discover(id)
      if (!isNew) return
      sfx.discover()
      toast.success(dict.quests.found, { description: dict.quests.list[id].name })
      if (allQuestsFound(useQuests.getState().found)) {
        setTimeout(() => toast.success(dict.quests.allFound), 1200)
      }
    },
    [dict]
  )
}

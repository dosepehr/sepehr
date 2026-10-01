"use client"

import { Gamepad2, Lock } from "lucide-react"
import { useDictionary } from "@/components/DictionaryProvider"
import { GAMES } from "@/components/Games/registry"
import { sfx } from "@/lib/audio/sfx"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { allQuestsFound, useQuests } from "@/lib/store/quests"
import type { GameId } from "@/lib/store/scores"
import { useScores } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"

export default function GamesList({ include3d }: { include3d: boolean }) {
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const best = useScores((s) => s.best)
  const unlocked = useQuests((s) => allQuestsFound(s.found)) && hydrated

  const ids = (Object.keys(GAMES) as GameId[]).filter(
    (id) => (include3d || !GAMES[id].is3d) && (id !== "friday-night" || unlocked)
  )

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ids.map((id) => {
        const info = dict.games.list[id]
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => {
                sfx.select()
                useStage.getState().setGame(id)
              }}
              style={{ color: GAMES[id].color }}
              className="flex h-full w-full flex-col items-start gap-1 rounded-lg bg-card/70 p-4 text-start neon-border transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2 font-display text-sm tracking-wide text-glow">
                <Gamepad2 className="size-4" aria-hidden />
                {info.name}
              </span>
              <span className="text-sm text-card-foreground/90">{info.blurb}</span>
              <span className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
                {dict.games.best}: {hydrated ? (best[id] ?? 0) : 0}
              </span>
            </button>
          </li>
        )
      })}
      {!unlocked && (
        <li className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <Lock className="size-4" aria-hidden /> ???
        </li>
      )}
    </ul>
  )
}

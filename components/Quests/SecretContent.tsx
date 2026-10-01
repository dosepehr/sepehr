"use client"

import { Lock, Trophy } from "lucide-react"
import { useDictionary } from "@/components/DictionaryProvider"
import Spinner from "@/components/ui/Spinner"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { QUEST_IDS } from "@/lib/quests"
import { allQuestsFound, useQuests } from "@/lib/store/quests"
import { useScores, type GameId } from "@/lib/store/scores"

export default function SecretContent() {
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const found = useQuests((s) => s.found)
  const best = useScores((s) => s.best)

  if (!hydrated) return <Spinner />

  if (!allQuestsFound(found)) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="flex items-center gap-2 text-neon-yellow">
          <Lock className="size-5" aria-hidden />
          {dict.secret.locked}
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          {dict.secret.progress}: {found.length}/{QUEST_IDS.length}
        </p>
        <ul className="flex flex-col gap-1 text-sm">
          {QUEST_IDS.map((id) => (
            <li
              key={id}
              className={
                found.includes(id) ? "text-neon-cyan" : "text-muted-foreground"
              }
            >
              {found.includes(id)
                ? "✔ " + dict.quests.list[id].name
                : "? " + dict.quests.list[id].clue}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const scores = Object.entries(best) as [GameId, number][]
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <p className="leading-7">{dict.secret.body}</p>
      <section aria-labelledby="hof">
        <h2
          id="hof"
          className="mb-3 flex items-center gap-2 font-display text-xl text-neon-yellow"
        >
          <Trophy className="size-5" aria-hidden />
          {dict.secret.hallOfFame}
        </h2>
        {scores.length === 0 ? (
          <p className="text-muted-foreground">{dict.secret.noScores}</p>
        ) : (
          <ol className="flex flex-col gap-2 font-mono">
            {scores
              .sort((a, b) => b[1] - a[1])
              .map(([game, score]) => (
                <li
                  key={game}
                  className="flex justify-between rounded-md bg-card/70 px-3 py-2"
                >
                  <span>{dict.games.list[game].name}</span>
                  <span className="text-neon-yellow" dir="ltr">
                    {score.toString().padStart(6, "0")}
                  </span>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  )
}

"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useDictionary } from "@/components/DictionaryProvider"
import Popover, {
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { cn } from "@/lib/funcs/cn"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { QUEST_IDS } from "@/lib/quests"
import { allQuestsFound, useQuests } from "@/lib/store/quests"

export default function QuestTracker({ className }: { className?: string }) {
  const { dict, lang } = useDictionary()
  const hydrated = useHydrated()
  const stored = useQuests((s) => s.found)
  const found = hydrated ? stored : []
  const done = allQuestsFound(found)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-3 font-mono text-sm text-foreground shadow-sm hover:bg-muted",
            className
          )}
        >
          <Sparkles className="size-4" aria-hidden />
          {dict.hud.secrets} {found.length}/{QUEST_IDS.length}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 border-border bg-popover p-4">
        <p className="mb-2 text-sm font-semibold">
          {dict.quests.title}
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {QUEST_IDS.map((id) => {
            const got = found.includes(id)
            return (
              <li
                key={id}
                className={got ? "text-primary-text" : "text-muted-foreground"}
              >
                {got
                  ? `✔ ${dict.quests.list[id].name}`
                  : `? ${dict.quests.list[id].clue}`}
              </li>
            )
          })}
        </ul>
        {done && (
          <Link
            href={`/${lang}/secret`}
            className="mt-3 inline-block text-sm text-primary-text underline underline-offset-4"
          >
            {dict.nav.secret} →
          </Link>
        )}
      </PopoverContent>
    </Popover>
  )
}

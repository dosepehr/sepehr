"use client"

import { Star } from "lucide-react"
import type { Skill } from "@/lib/content/types"
import { useHydrated } from "@/lib/hooks/useHydrated"
import type { Dictionary } from "@/lib/i18n/dictionary"
import { useScores } from "@/lib/store/scores"

export default function SkillsBoard({
  skills,
  dict,
}: {
  skills: Skill[]
  dict: Dictionary
}) {
  const hydrated = useHydrated()
  const unlocked = useScores((s) => s.unlockedSkills)

  return (
    <ol className="grid gap-2 font-mono text-sm sm:grid-cols-2" dir="ltr">
      {skills.map((skill, i) => {
        const caught = hydrated && unlocked.includes(skill.name)
        return (
          <li
            key={skill.name}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
          >
            <span className="w-6 text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-foreground">{skill.name}</span>
            {caught && (
              <Star
                className="size-4 fill-warning-text text-warning-text"
                aria-label={dict.about.unlocked}
              />
            )}
            <span
              className="h-2 w-24 overflow-hidden rounded-full bg-muted"
              aria-hidden
            >
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${skill.level}%` }}
              />
            </span>
            <span className="sr-only">{skill.level}%</span>
          </li>
        )
      })}
    </ol>
  )
}

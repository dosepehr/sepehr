"use client"

import { Monitor, Terminal as TerminalIcon } from "lucide-react"
import { useEffect } from "react"
import { go, type NavTarget } from "@/components/Arcade/actions"
import { useDictionary } from "@/components/DictionaryProvider"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import ThemeToggle from "@/components/Site/ThemeToggle"
import Kbd from "@/components/ui/Kbd"
import { sfx } from "@/lib/audio/sfx"
import { cn } from "@/lib/funcs/cn"
import { usePrefs } from "@/lib/store/prefs"
import type { GameId } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"
import SoundToggle from "./SoundToggle"

const NAV: NavTarget[] = [
  "overview",
  "projects",
  "games",
  "blog",
  "about",
  "skills",
  "contact",
  "resume",
  "physics",
]

const isActive = (target: NavTarget, focus: string) =>
  target === "about"
    ? focus === "desk"
    : target === "projects"
      ? focus === "projects" || focus.startsWith("project:")
      : focus === target

// Every control sits on a solid surface: nothing is text-over-scene, so
// contrast never depends on what the 3D camera happens to show behind it.
const surface =
  "border border-border bg-card text-card-foreground shadow-sm"
const control =
  "inline-flex h-11 items-center justify-center rounded-md px-3 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"

export default function Hud({
  projectTitles,
}: {
  /** slug -> title, for the hover label over project cabinets. */
  projectTitles: Record<string, string>
}) {
  const { dict } = useDictionary()
  const focus = useStage((s) => s.focus)
  const game = useStage((s) => s.game)
  const hovered = useStage((s) => s.hovered)

  // Esc steps back (game > terminal > panel > focus). Radix dialogs handle their own Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return
      if (e.key === "Escape") {
        if (document.querySelector('[role="dialog"][data-state="open"]')) return
        if (useStage.getState().focus !== "overview") sfx.back()
        useStage.getState().back()
      } else if (e.key === "`") {
        e.preventDefault()
        const open = !useStage.getState().terminalOpen
        if (open) go("terminal")
        else useStage.getState().setTerminal(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (game === "neon-drive") return null

  const labels: Record<NavTarget, string> = {
    overview: dict.nav.overview,
    projects: dict.nav.projects,
    games: dict.nav.games,
    blog: dict.nav.blog,
    about: dict.nav.about,
    skills: dict.nav.skills,
    contact: dict.nav.contact,
    resume: dict.nav.resume,
    physics: dict.nav.physics,
    terminal: dict.nav.terminal,
  }

  // In-scene text is small at overview distance, so name the hovered object here.
  const hoverLabel = (() => {
    if (!hovered) return null
    if (hovered.startsWith("project:")) {
      return projectTitles[hovered.slice("project:".length)] ?? null
    }
    if (hovered.startsWith("game:")) {
      return dict.games.list[hovered.slice("game:".length) as GameId]?.name
    }
    const byId: Record<string, string> = {
      "out-of-order": dict.games.outOfOrder,
      desk: dict.nav.about,
      crt: dict.nav.terminal,
      skills: dict.nav.skills,
      blog: dict.nav.blog,
      contact: dict.nav.contact,
      resume: dict.nav.resume,
    }
    return byId[hovered] ?? null
  })()

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
      <header className="pointer-events-auto flex flex-wrap items-start justify-between gap-3 p-4">
        <div className={cn("rounded-lg px-3 py-2", surface)}>
          <h1 className="text-lg leading-tight font-semibold">
            {dict.site.name}
          </h1>
          <p className="text-sm text-muted-foreground">{dict.site.role}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuestTracker />
          <button
            type="button"
            className={cn(control, surface, "w-11 px-0")}
            onClick={() => go("terminal")}
            aria-label={dict.hud.openTerminal}
            title={dict.hud.openTerminal}
          >
            <TerminalIcon className="size-5" />
          </button>
          <SoundToggle className={cn(control, surface, "w-11 px-0")} />
          <ThemeToggle className={cn(surface, "hover:bg-muted")} />
          <LocaleSwitch className="h-11" />
          <button
            type="button"
            className={cn(control, surface, "gap-2")}
            onClick={() => usePrefs.getState().setClassic(true)}
          >
            <Monitor className="size-4" aria-hidden />
            {dict.hub.classicView}
          </button>
        </div>
      </header>

      {hoverLabel && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-32 flex justify-center"
        >
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              surface
            )}
          >
            {hoverLabel}
          </span>
        </div>
      )}

      <footer className="pointer-events-auto flex flex-col items-center gap-2 p-4">
        <nav
          aria-label={dict.hud.menu}
          className={cn("max-w-full overflow-x-auto rounded-xl p-1", surface)}
        >
          <ul className="flex items-center gap-1">
            {NAV.map((target) => (
              <li key={target}>
                <button
                  type="button"
                  aria-current={isActive(target, focus) ? "true" : undefined}
                  onClick={() => {
                    sfx.select()
                    go(target)
                  }}
                  className={cn(
                    control,
                    "font-medium whitespace-nowrap aria-[current]:bg-primary aria-[current]:text-primary-foreground"
                  )}
                >
                  {labels[target]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <p
          className={cn(
            "rounded-md px-3 py-1 text-xs text-muted-foreground",
            surface
          )}
        >
          {dict.hub.clickHint} · <Kbd>Esc</Kbd>{" "}
          {dict.hub.escHint.replace(/^Esc\s*/, "")} · <Kbd>`</Kbd>{" "}
          {dict.nav.terminal}
        </p>
      </footer>
    </div>
  )
}

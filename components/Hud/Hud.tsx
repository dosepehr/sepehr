"use client"

import {
  Footprints,
  Monitor,
  Terminal as TerminalIcon,
  Video,
} from "lucide-react"
import { useEffect } from "react"
import { go, type NavTarget } from "@/components/Arcade/actions"
import { useDictionary } from "@/components/DictionaryProvider"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import Kbd from "@/components/ui/Kbd"
import { sfx } from "@/lib/audio/sfx"
import { cn } from "@/lib/funcs/cn"
import { usePrefs } from "@/lib/store/prefs"
import { useStage } from "@/lib/store/stage"
import MarioHud from "@/components/Mario3D/MarioHud"
import WorldHud from "@/components/World/WorldHud"
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

export default function Hud() {
  const { dict } = useDictionary()
  const focus = useStage((s) => s.focus)
  const game = useStage((s) => s.game)
  const mode = useStage((s) => s.mode)
  const world = useStage((s) => s.world)

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
  if (world === "mario") return <MarioHud />

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

  const button =
    "inline-flex h-11 items-center justify-center rounded-md px-3 text-sm hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div className="theme-night pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
      <header className="pointer-events-auto flex flex-wrap items-start justify-between gap-3 bg-linear-to-b from-background/80 to-transparent p-4">
        <div>
          <h1 className="font-display text-xl tracking-[0.25em] text-neon-pink uppercase text-glow">
            {dict.site.name}
          </h1>
          <p className="text-sm text-neon-cyan">{dict.site.role}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={dict.world.explore}
            className="flex rounded-md border border-white/10 bg-background/60 p-0.5"
          >
            {(["explore", "tour"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  sfx.select()
                  useStage.getState().setMode(m)
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded px-3 text-sm",
                  mode === m
                    ? "bg-neon-cyan/15 text-neon-cyan"
                    : "text-foreground/80 hover:bg-white/10"
                )}
              >
                {m === "explore" ? (
                  <Footprints className="size-4" aria-hidden />
                ) : (
                  <Video className="size-4" aria-hidden />
                )}
                {dict.world[m]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={cn(button, "bg-background/60 text-neon-yellow")}
            onClick={() => useStage.getState().setWorld("mario")}
          >
            {dict.mario.toMario}
          </button>
          <QuestTracker className="bg-background/60" />
          <button
            type="button"
            className={cn(button, "text-[#5dff9d]")}
            onClick={() => go("terminal")}
            aria-label={dict.hud.openTerminal}
            title={dict.hud.openTerminal}
          >
            <TerminalIcon className="size-5" />
          </button>
          <SoundToggle className={button} />
          <LocaleSwitch className="h-11 bg-background/60" />
          <button
            type="button"
            className={cn(
              button,
              "gap-2 bg-background/60 text-neon-yellow neon-border"
            )}
            onClick={() => usePrefs.getState().setClassic(true)}
          >
            <Monitor className="size-4" aria-hidden />
            {dict.hub.classicView}
          </button>
        </div>
      </header>

      {mode === "explore" ? (
        <WorldHud />
      ) : (
        <footer className="pointer-events-auto flex flex-col items-center gap-2 bg-linear-to-t from-background/85 to-transparent p-4">
          <nav
            aria-label={dict.hud.menu}
            className="max-w-full overflow-x-auto"
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
                      button,
                      "whitespace-nowrap text-foreground/90 aria-[current]:bg-neon-pink/15 aria-[current]:text-neon-pink"
                    )}
                  >
                    {labels[target]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs text-muted-foreground">
            {dict.hub.clickHint} · <Kbd>Esc</Kbd>{" "}
            {dict.hub.escHint.replace(/^Esc\s*/, "")} · <Kbd>`</Kbd>{" "}
            {dict.nav.terminal}
          </p>
        </footer>
      )}
    </div>
  )
}

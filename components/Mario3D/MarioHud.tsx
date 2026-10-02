"use client"

import {
  Monitor,
  Shirt,
  Sparkles,
  Terminal as TerminalIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { go } from "@/components/Arcade/actions"
import { useDictionary } from "@/components/DictionaryProvider"
import SoundToggle from "@/components/Hud/SoundToggle"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import Kbd from "@/components/ui/Kbd"
import { interactables } from "@/components/World/interactables"
import { startMusic, stopMusic } from "@/lib/audio/mario"
import { marioSfx } from "@/lib/audio/mario"
import { cn } from "@/lib/funcs/cn"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useAudio } from "@/lib/store/audio"
import { POWERUP_IDS, useMario } from "@/lib/store/mario"
import { usePrefs } from "@/lib/store/prefs"
import { useStage } from "@/lib/store/stage"
import { hero } from "./events"
import { ZONES } from "./level"

/** Current zone from the hero's position, plus a banner flag that shows for a moment after a change. */
function useZone() {
  const [zone, setZone] = useState(ZONES[0].name)
  const [banner, setBanner] = useState(true)
  useEffect(() => {
    let current = ZONES[0].name
    let hide = setTimeout(() => setBanner(false), 2200)
    const id = setInterval(() => {
      const x = hero.body.x
      const z = [...ZONES].reverse().find((z) => x >= z.from)
      const name = hero.body.y < -20 ? "1-?" : (z?.name ?? "1-1")
      if (name === current) return
      current = name
      setZone(name)
      setBanner(true)
      clearTimeout(hide)
      hide = setTimeout(() => setBanner(false), 2200)
    }, 250)
    return () => {
      clearInterval(id)
      clearTimeout(hide)
    }
  }, [])
  return { zone, showBanner: banner }
}

/** NES-style status bar, zone banner, the "press E" prompt and controls. */
export default function MarioHud() {
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const score = useMario((s) => s.score)
  const coins = useMario((s) => s.coins.length)
  const found = useMario((s) => s.powerUps.length)
  const muted = useAudio((s) => s.muted)
  const nearby = useStage((s) => s.nearby)
  const panel = useStage((s) => s.panel)
  const game = useStage((s) => s.game)
  const { zone, showBanner } = useZone()
  const [clear, setClear] = useState<number | null>(null)

  // Music while the world is visible and sound is on.
  useEffect(() => {
    if (muted || game) return
    startMusic()
    return () => stopMusic()
  }, [muted, game])

  const zoneNames: Record<string, string> = {
    "1-1": dict.mario.zones.start,
    "1-2": dict.mario.zones.skills,
    "1-3": dict.mario.zones.projects,
    "1-4": dict.mario.zones.experience,
    "1-5": dict.mario.zones.contact,
    "1-?": dict.mario.zones.bonus,
  }
  const banner = showBanner ? zoneNames[zone] : null

  useEffect(() => {
    const onClear = (e: Event) => {
      setClear((e as CustomEvent<number>).detail)
      setTimeout(() => setClear(null), 3200)
    }
    window.addEventListener("mario:clear", onClear)
    return () => window.removeEventListener("mario:clear", onClear)
  }, [])

  useEffect(() => () => useStage.getState().setNearby(null), [])

  if (game === "neon-drive") return null
  const labels = dict.world.labels as Record<string, string>
  const label = nearby
    ? (interactables.get(nearby)?.label ?? labels[nearby] ?? nearby)
    : null
  const button =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-card px-3 text-sm text-foreground pixel-border-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
  const stat = (title: string, value: string) => (
    <div className="flex flex-col gap-1">
      <span>{title}</span>
      <span>{value}</span>
    </div>
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
      <header className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div
          className="grid grid-cols-4 gap-x-6 gap-y-1 font-display text-[10px] leading-4 text-outline sm:gap-x-10 sm:text-xs"
          dir="ltr"
          aria-label={dict.mario.status}
        >
          {stat(
            dict.site.name.toUpperCase(),
            String(hydrated ? score : 0).padStart(6, "0")
          )}
          {stat(
            dict.mario.coins,
            `🪙×${String(hydrated ? coins : 0).padStart(2, "0")}`
          )}
          {stat(dict.mario.world, zone)}
          {stat("★", `${hydrated ? found : 0}/${POWERUP_IDS.length}`)}
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <QuestTracker className="h-10 bg-card text-foreground pixel-border-sm" />
          <button
            type="button"
            className={button}
            onClick={() => {
              const next =
                useMario.getState().costume === "8bit" ? "3d" : "8bit"
              useMario.getState().setCostume(next)
              marioSfx.powerUpAppear()
            }}
            title={dict.mario.costume}
            aria-label={dict.mario.costume}
          >
            <Shirt className="size-4" />
          </button>
          <button
            type="button"
            className={button}
            onClick={() => go("terminal")}
            aria-label={dict.hud.openTerminal}
          >
            <TerminalIcon className="size-4" />
          </button>
          <SoundToggle className={button} />
          <LocaleSwitch className="h-10 bg-card text-foreground pixel-border-sm" />
          <button
            type="button"
            className={button}
            onClick={() => useStage.getState().setWorld("arcade")}
            title={dict.mario.toArcade}
          >
            <Sparkles className="size-4" aria-hidden />
            <span className="hidden sm:inline">{dict.mario.toArcade}</span>
          </button>
          <button
            type="button"
            className={button}
            onClick={() => usePrefs.getState().setClassic(true)}
          >
            <Monitor className="size-4" aria-hidden />
            <span className="hidden sm:inline">{dict.hub.classicView}</span>
          </button>
        </div>
      </header>

      {banner && !panel && (
        <div className="flex justify-center" role="status">
          <p className="rounded-md bg-black/70 px-6 py-3 font-display text-sm text-white sm:text-base">
            {dict.mario.world} {zone} · {banner}
          </p>
        </div>
      )}
      {clear !== null && (
        <div className="flex justify-center" role="status">
          <p className="font-display text-2xl text-outline sm:text-4xl">
            {dict.mario.courseClear} +{clear}
          </p>
        </div>
      )}

      <footer className="flex flex-col items-center gap-3 p-4">
        {label && !panel && (
          <p className="flex items-center gap-2 rounded-md bg-card px-4 py-2 text-sm text-foreground pixel-border-sm">
            {dict.world.press} <Kbd>E</Kbd> {dict.world.use}:{" "}
            <span className="font-semibold text-primary-text">{label}</span>
          </p>
        )}
        <p
          className={cn(
            "max-w-3xl rounded-md bg-black/55 px-3 py-1.5 text-center text-xs leading-5 text-white"
          )}
        >
          {dict.mario.controls}
        </p>
      </footer>
    </div>
  )
}

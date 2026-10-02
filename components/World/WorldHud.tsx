"use client"

import { Coins, Gem } from "lucide-react"
import { useEffect } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import Kbd from "@/components/ui/Kbd"
import Popover, {
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { sfx } from "@/lib/audio/sfx"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useAudio } from "@/lib/store/audio"
import { useStage } from "@/lib/store/stage"
import { RELIC_IDS, useWorld } from "@/lib/store/world"
import { interactables } from "./interactables"
import { COINS } from "./layout"

/** Explore-mode overlay: the "press E" prompt, collection counters and controls. */
export default function WorldHud() {
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const nearby = useStage((s) => s.nearby)
  const panel = useStage((s) => s.panel)
  const coins = useWorld((s) => s.coins.length)
  const relics = useWorld((s) => s.relics)
  const muted = useAudio((s) => s.muted)

  // Ambient pad while exploring with sound on.
  useEffect(() => {
    if (muted) return
    sfx.ambient.start()
    return () => sfx.ambient.stop()
  }, [muted])

  useEffect(() => () => useStage.getState().setNearby(null), [])

  const labels = dict.world.labels as Record<string, string>
  const label = nearby
    ? (interactables.get(nearby)?.label ?? labels[nearby] ?? nearby)
    : null

  return (
    <>
      {label && !panel && (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-28 z-20 flex justify-center"
        >
          <p className="flex items-center gap-2 rounded-full border border-white/15 bg-background/85 px-4 py-2 text-sm text-foreground shadow-lg backdrop-blur">
            {dict.world.press} <Kbd>E</Kbd> {dict.world.use}:{" "}
            <span className="font-semibold text-neon-cyan">{label}</span>
          </p>
        </div>
      )}

      <div className="pointer-events-auto fixed start-4 bottom-4 z-20 flex flex-col items-start gap-2">
        <div className="flex gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-background/80 px-3 font-mono text-sm text-neon-yellow backdrop-blur">
            <Coins className="size-4" aria-hidden />
            <span className="sr-only">{dict.world.coins}</span>
            {hydrated ? coins : 0}/{COINS.length}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-background/80 px-3 font-mono text-sm text-neon-cyan backdrop-blur hover:bg-white/10"
              >
                <Gem className="size-4" aria-hidden />
                {dict.world.relicsTitle} {hydrated ? relics.length : 0}/
                {RELIC_IDS.length}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-border bg-popover/95 p-4">
              <p className="mb-1 text-sm font-semibold">
                {dict.world.relicsTitle}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                {dict.world.hint}
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {RELIC_IDS.map((id) => {
                  const info = dict.world.relics[id]
                  const got = hydrated && relics.includes(id)
                  return (
                    <li
                      key={id}
                      className={
                        got ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {got ? `✔ ${info.name}` : `? ${info.hint}`}
                    </li>
                  )
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
        <p className="max-w-md rounded-lg bg-background/70 px-3 py-1.5 text-xs leading-5 text-muted-foreground backdrop-blur">
          {dict.world.controls}
        </p>
      </div>
    </>
  )
}

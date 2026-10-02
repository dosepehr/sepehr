"use client"

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import Kbd from "@/components/ui/Kbd"
import { sfx } from "@/lib/audio/sfx"
import { cn } from "@/lib/funcs/cn"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { LEET_SCORE } from "@/lib/quests"
import { useScores, type GameId } from "@/lib/store/scores"
import SoundToggle from "@/components/Hud/SoundToggle"
import { createInput } from "../engine/input"
import { startLoop } from "../engine/loop"
import type { BaseState, InputState } from "../engine/types"
import { driveRef } from "../NeonDrive"
import { GAMES } from "../registry"

type Phase = "ready" | "playing" | "paused" | "over"

export default function GameShell({
  game,
  onExit,
}: {
  game: GameId
  onExit: () => void
}) {
  const { dict } = useDictionary()
  const entry = GAMES[game]
  const info = dict.games.list[game]
  const discover = useDiscover()
  const best = useScores((s) => s.best[game] ?? 0)

  const [phase, setPhase] = useState<Phase>("ready")
  const [runId, setRunId] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const livesRef = useRef<HTMLSpanElement>(null)
  const [input] = useState(createInput)
  const stateRef = useRef<BaseState | null>(null)

  const start = useCallback(() => {
    setRunId((n) => n + 1)
    setPhase("playing")
    sfx.coin()
  }, [])

  // Input lifetime = shell lifetime.
  useEffect(() => {
    input.attach()
    rootRef.current?.focus()
    return () => input.detach()
  }, [input])

  // Shell-level keys: Esc exits, P pauses, Space starts.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === "escape") {
        event.stopPropagation()
        onExit()
      } else if (key === "p") {
        setPhase((p) =>
          p === "playing" ? "paused" : p === "paused" ? "playing" : p
        )
      } else if (
        (key === " " || key === "enter") &&
        (phase === "ready" || phase === "over")
      ) {
        event.preventDefault()
        start()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [onExit, phase, start])

  // Auto-pause when the tab or window loses focus.
  useEffect(() => {
    const pause = () => setPhase((p) => (p === "playing" ? "paused" : p))
    const onVisibility = () => document.hidden && pause()
    window.addEventListener("blur", pause)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("blur", pause)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  // New run: fresh state.
  useEffect(() => {
    if (runId === 0) return
    stateRef.current = entry.def.init(
      (Math.random() * 2 ** 31) | 0,
      entry.options
    )
    if (entry.is3d)
      driveRef.current = stateRef.current as typeof driveRef.current
    return () => {
      if (entry.is3d) driveRef.current = null
    }
  }, [runId, entry])

  // The loop runs only while playing.
  useEffect(() => {
    if (phase !== "playing" || !stateRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d") ?? null
    const { def } = entry
    let lastScore = -1
    let lastLives = -1

    const update = (dt: number) => {
      const state = def.step(stateRef.current!, input.state, dt)
      stateRef.current = state
      if (entry.is3d) driveRef.current = state as typeof driveRef.current
      for (const event of state.events) {
        if (event.type === "catch") {
          sfx.catch()
          if (event.label) useScores.getState().unlockSkill(event.label)
        } else if (event.type === "shoot") sfx.shoot()
        else if (event.type === "hit") sfx.hit()
        else if (event.type === "explode") sfx.explode()
        else if (event.type === "lose") sfx.lose()
      }
      if (state.status === "over") {
        useScores.getState().submit(game, state.score)
        if (!entry.is3d && state.score >= LEET_SCORE) discover("leet-score")
        setFinalScore(state.score)
        setPhase("over")
      }
    }
    const draw = (time: number) => {
      const state = stateRef.current!
      if (state.score !== lastScore && scoreRef.current) {
        lastScore = state.score
        scoreRef.current.textContent = String(state.score)
      }
      if (state.lives !== lastLives && livesRef.current) {
        lastLives = state.lives
        livesRef.current.textContent = "♥".repeat(Math.max(0, state.lives))
      }
      if (ctx && def.render) def.render(ctx, state, time)
    }
    return startLoop(update, draw)
  }, [phase, entry, game, discover, input])

  // DPR-aware canvas sizing: logical size stays fixed, backing store scales.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || entry.is3d) return
    const { width, height } = entry.def
    const resize = () => {
      const parent = canvas.parentElement!
      const scale = Math.min(
        parent.clientWidth / width,
        parent.clientHeight / height
      )
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.style.width = `${width * scale}px`
      canvas.style.height = `${height * scale}px`
      canvas.width = Math.round(width * scale * dpr)
      canvas.height = Math.round(height * scale * dpr)
      canvas
        .getContext("2d")
        ?.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)
      if (stateRef.current && entry.def.render) {
        entry.def.render(
          canvas.getContext("2d")!,
          stateRef.current,
          performance.now() / 1000
        )
      }
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [entry])

  const press = (key: keyof InputState) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      input.press(key, true)
    },
    onPointerUp: () => input.press(key, false),
    onPointerLeave: () => input.press(key, false),
    onPointerCancel: () => input.press(key, false),
  })

  const iconButton =
    "inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={info.name}
      className={cn(
        "fixed inset-0 z-50 flex flex-col outline-none",
        entry.is3d ? "bg-transparent" : "bg-background/95 backdrop-blur-sm"
      )}
    >
      <header
        className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-background/80 px-3 py-2"
        style={{ color: entry.color }}
      >
        <h2 className="font-display text-xs tracking-widest uppercase text-glow sm:text-sm">
          {info.name}
        </h2>
        <dl
          className="ms-auto flex items-center gap-3 font-mono text-xs text-foreground sm:gap-4 sm:text-sm"
          dir="ltr"
        >
          <div className="flex gap-1">
            <dt className="text-muted-foreground">{dict.games.score}</dt>
            <dd ref={scoreRef} aria-live="off">
              0
            </dd>
          </div>
          <div className="hidden gap-1 sm:flex">
            <dt className="text-muted-foreground">{dict.games.best}</dt>
            <dd>{best}</dd>
          </div>
          {!entry.is3d && (
            <div className="flex gap-1 text-neon-pink">
              <dt className="sr-only">{dict.games.lives}</dt>
              <dd ref={livesRef} />
            </div>
          )}
        </dl>
        <div className="flex items-center">
          <SoundToggle className={iconButton} />
          <button
            type="button"
            className={iconButton}
            onClick={() =>
              setPhase((p) =>
                p === "playing" ? "paused" : p === "paused" ? "playing" : p
              )
            }
            disabled={phase !== "playing" && phase !== "paused"}
            aria-label={
              phase === "paused" ? dict.games.resume : dict.games.pause
            }
          >
            {phase === "paused" ? (
              <Play className="size-5" />
            ) : (
              <Pause className="size-5" />
            )}
          </button>
          <button
            type="button"
            className={iconButton}
            onClick={start}
            aria-label={dict.games.restart}
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            type="button"
            className={iconButton}
            onClick={onExit}
            aria-label={dict.games.exit}
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2">
        {!entry.is3d && (
          <canvas
            ref={canvasRef}
            className="touch-none rounded-md neon-border"
            style={{ color: entry.color }}
            onPointerDown={() =>
              (phase === "ready" || phase === "over") && start()
            }
          />
        )}
        {phase !== "playing" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <div
              className="pointer-events-auto flex max-w-sm flex-col items-center gap-3 rounded-lg bg-background/90 p-6 text-center neon-border"
              style={{ color: entry.color }}
            >
              <p className="font-display text-xl text-glow">
                {phase === "over"
                  ? dict.games.gameOver
                  : phase === "paused"
                    ? dict.games.paused
                    : info.name}
              </p>
              {phase === "over" && (
                <p className="font-mono text-foreground" dir="ltr">
                  {dict.games.score}: {finalScore}
                </p>
              )}
              {phase === "ready" && (
                <p className="text-sm text-foreground/90">{info.blurb}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {dict.games.controls}: {info.controls} · <Kbd>Esc</Kbd>{" "}
                {dict.games.exit}
              </p>
              <button
                type="button"
                onClick={phase === "paused" ? () => setPhase("playing") : start}
                className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-md px-5 font-display text-sm tracking-wider uppercase neon-border hover:bg-white/10"
              >
                <Play className="size-4" />
                {phase === "paused"
                  ? dict.games.resume
                  : phase === "over"
                    ? dict.games.restart
                    : dict.hub.enter}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch D-pad, only on coarse pointers. */}
      <div
        className="hidden items-center justify-between gap-4 p-4 pointer-coarse:flex"
        dir="ltr"
      >
        <div className="flex gap-3">
          {game === "neon-snake" && (
            <>
              <button
                type="button"
                aria-label="Up"
                className="size-16 touch-none rounded-full text-neon-cyan neon-border select-none"
                {...press("up")}
              >
                <ArrowUp className="mx-auto size-7" />
              </button>
              <button
                type="button"
                aria-label="Down"
                className="size-16 touch-none rounded-full text-neon-cyan neon-border select-none"
                {...press("down")}
              >
                <ArrowDown className="mx-auto size-7" />
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Left"
            className="size-16 touch-none rounded-full text-neon-cyan neon-border select-none"
            {...press("left")}
          >
            <ArrowLeft className="mx-auto size-7" />
          </button>
          <button
            type="button"
            aria-label="Right"
            className="size-16 touch-none rounded-full text-neon-cyan neon-border select-none"
            {...press("right")}
          >
            <ArrowRight className="mx-auto size-7" />
          </button>
        </div>
        {(game === "bug-blaster" ||
          game === "friday-night" ||
          game === "brick-breaker") && (
          <button
            type="button"
            aria-label="Fire"
            className="size-16 touch-none rounded-full text-neon-pink neon-border select-none"
            {...press("fire")}
          >
            <Crosshair className="mx-auto size-7" />
          </button>
        )}
      </div>
    </div>
  )
}

"use client"

import { useCallback } from "react"
import { useStage } from "@/lib/store/stage"
import GameShell from "./GameShell"

/** Mounts the fullscreen game shell for whatever game the stage says is running. */
export default function GameHost() {
  const game = useStage((s) => s.game)
  const exit = useCallback(() => useStage.getState().setGame(null), [])
  if (!game) return null
  return <GameShell key={game} game={game} onExit={exit} />
}

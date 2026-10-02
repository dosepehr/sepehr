"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, type ReactNode } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import GameHost from "@/components/Games/GameHost"
import Hud from "@/components/Hud/Hud"
import Terminal from "@/components/Hud/Terminal"
import LiteHub from "@/components/Lite/LiteHub"
import PanelHost from "@/components/Panels/PanelHost"
import ErrorBoundary from "@/components/ui/ErrorBoundary"
import { useCapable } from "@/lib/hooks/useCapable"
import { useExperience } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"
import { go, type NavTarget } from "./actions"
import type { ArcadeData } from "./arcade.types"
import Loader from "./Loader"

// ssr:false must live in a Client Component. three.js never reaches Lite or the 2D pages.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <Loader />,
})

function liteNavigate(target: NavTarget) {
  const id = target === "resume" ? "contact" : target
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  useStage.getState().setTerminal(false)
}

function TerminalHost({
  data,
  navigate,
}: {
  data: ArcadeData
  navigate: (t: NavTarget) => void
}) {
  const open = useStage((s) => s.terminalOpen)
  if (!open) return null
  return (
    <Terminal
      skills={data.skills}
      projects={data.projects.map((p) => p.title)}
      navigate={navigate}
      onClose={() => useStage.getState().setTerminal(false)}
    />
  )
}

function Arcade3D({ data }: { data: ArcadeData }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    void import("./Scene").then((m) =>
      useStage.getState().setTier(m.initialTier())
    )
    return () => {
      document.body.style.cursor = ""
    }
  }, [])
  return (
    <div className="fixed inset-0 bg-background">
      <Scene data={data} onReady={() => setReady(true)} />
      {ready && <Hud />}
      <PanelHost data={data} />
      <TerminalHost data={data} navigate={go} />
      <GameHost />
    </div>
  )
}

function Lite({ data, notice }: { data: ArcadeData; notice?: string }) {
  const canEnter3d = useCapable()
  return (
    <>
      <LiteHub data={data} canEnter3d={canEnter3d && !notice} notice={notice} />
      <TerminalHost data={data} navigate={liteNavigate} />
      <GameHost />
    </>
  )
}

/** Picks the full 3D arcade or the Lite hub. `hero` is the server-rendered first paint. */
export default function Experience({
  data,
  hero,
}: {
  data: ArcadeData
  hero: ReactNode
}) {
  const { dict } = useDictionary()
  const experience = useExperience()

  // Leaving a mode resets the stage so nothing stays focused or open.
  useEffect(() => {
    useStage.setState({
      focus: "overview",
      panel: null,
      game: null,
      terminalOpen: false,
    })
  }, [experience])

  if (experience === "pending") return hero
  if (experience === "lite") return <Lite data={data} />
  return (
    <ErrorBoundary
      fallback={() => <Lite data={data} notice={dict.hub.fallback} />}
    >
      <Arcade3D data={data} />
    </ErrorBoundary>
  )
}

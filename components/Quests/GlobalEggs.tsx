"use client"

import { useEffect } from "react"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { advanceSequence, KONAMI } from "@/lib/quests"
import { useStage } from "@/lib/store/stage"

const ART = String.raw`
 ____  _____ ____  _   _ _____ ____
/ ___|| ____|  _ \| | | | ____|  _ \
\___ \|  _| | |_) | |_| |  _| | |_) |
 ___) | |___|  __/|  _  | |___|  _ <
|____/|_____|_|   |_| |_|_____|_| \_\
`

declare global {
  interface Window {
    secret?: () => string
  }
}

/** Site-wide eggs: the console clue and the Konami code. Renders nothing. */
export default function GlobalEggs() {
  const discover = useDiscover()

  useEffect(() => {
    console.log(`%c${ART}`, "color:#e45e4d;font-family:monospace")
    console.log(
      "%cHey, developer. Type secret() to claim something.",
      "color:#008c8d"
    )
    window.secret = () => {
      discover("console")
      return "🕹  Secret found. Check the HUD."
    }
    return () => {
      delete window.secret
    }
  }, [discover])

  useEffect(() => {
    let progress = 0
    const onKey = (event: KeyboardEvent) => {
      progress = advanceSequence(KONAMI, progress, event.key)
      if (progress === KONAMI.length) {
        progress = 0
        const next =
          useStage.getState().palette === "golden" ? "normal" : "golden"
        useStage.getState().setPalette(next)
        discover("konami")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [discover])

  // Mirror "golden hour" onto <html> so DOM overlays warm up with the room.
  const palette = useStage((s) => s.palette)
  useEffect(() => {
    if (palette === "golden") document.documentElement.dataset.palette = "golden"
    else delete document.documentElement.dataset.palette
  }, [palette])

  return null
}

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
    console.log(`%c${ART}`, "color:#ff2d95;font-family:monospace")
    console.log("%cHey, developer. Type secret() to claim something.", "color:#22e5ff")
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
        const next = useStage.getState().palette === "vaporwave" ? "synthwave" : "vaporwave"
        useStage.getState().setPalette(next)
        discover("konami")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [discover])

  // Mirror the palette onto <html> so DOM overlays recolor with the room.
  const palette = useStage((s) => s.palette)
  useEffect(() => {
    document.documentElement.dataset.palette = palette
  }, [palette])

  return null
}

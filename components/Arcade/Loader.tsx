"use client"

import { useEffect, useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import Progress from "@/components/ui/Progress"

/** Boot splash while the three.js chunk downloads and the first frame renders. */
export default function Loader() {
  const { dict } = useDictionary()
  const [value, setValue] = useState(8)
  // This only covers the JS chunk download, which has no progress events: fake a
  // quick ramp. GLB model progress is shown by ModelProgress inside Scene.
  useEffect(() => {
    const id = setInterval(
      () => setValue((v) => Math.min(92, v + (100 - v) * 0.12)),
      120
    )
    return () => clearInterval(id)
  }, [])
  return (
    <div
      role="status"
      className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 neon-grid"
    >
      <p className="animate-flicker font-display text-2xl tracking-[0.2em] text-outline uppercase">
        {dict.site.name}
      </p>
      <Progress
        value={value}
        className="h-3 w-64 bg-card pixel-border-sm"
        aria-label={dict.hub.loading}
      />
      <p className="font-display text-xs text-outline">{dict.hub.loading}</p>
    </div>
  )
}

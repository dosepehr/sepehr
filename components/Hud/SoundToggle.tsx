"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useAudio } from "@/lib/store/audio"

export default function SoundToggle({ className }: { className?: string }) {
  const { dict } = useDictionary()
  const hydrated = useHydrated()
  const muted = useAudio((s) => s.muted) || !hydrated
  return (
    <button
      type="button"
      className={className}
      aria-pressed={!muted}
      aria-label={muted ? dict.hud.soundOff : dict.hud.soundOn}
      title={dict.hud.sound}
      onClick={() => {
        useAudio.getState().toggle()
        sfx.select()
      }}
    >
      {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
    </button>
  )
}

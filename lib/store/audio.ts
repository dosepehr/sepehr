import { createPersistedStore } from "./createPersistedStore"

type AudioState = {
  muted: boolean
  toggle: () => void
}

// Muted by default: autoplay policy, and courtesy.
export const useAudio = createPersistedStore<AudioState>(
  (set, get) => ({
    muted: true,
    toggle: () => set({ muted: !get().muted }, false, "toggle"),
  }),
  "audio",
  { partialize: (s) => ({ muted: s.muted }) }
)

import { createPersistedStore } from "./createPersistedStore"

type PrefsState = {
  /** "Classic view": the visitor asked for the 2D hub even on a capable device. */
  classic: boolean
  setClassic: (classic: boolean) => void
}

export const usePrefs = createPersistedStore<PrefsState>(
  (set) => ({
    classic: false,
    setClassic: (classic) => set({ classic }, false, "setClassic"),
  }),
  "prefs",
  { partialize: (s) => ({ classic: s.classic }) }
)

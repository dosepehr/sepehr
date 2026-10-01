import type { StateCreator } from "zustand"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/** Same as `createStore`, but persisted to localStorage under `sepehr:<name>`. */
export function createPersistedStore<T>(
  initializer: StateCreator<
    T,
    [["zustand/devtools", never], ["zustand/persist", unknown]]
  >,
  name: string,
  options: { partialize?: (state: T) => Partial<T>; version?: number } = {}
) {
  return create<T>()(
    devtools(
      persist(initializer, {
        name: `sepehr:${name}`,
        storage: createJSONStorage(() => localStorage),
        partialize: options.partialize as ((state: T) => T) | undefined,
        version: options.version ?? 1,
      }),
      { name, enabled: process.env.NODE_ENV === "development" }
    )
  )
}

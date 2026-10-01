import type { InputState } from "./types"

const KEYMAP: Record<string, keyof InputState> = {
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  " ": "fire",
  enter: "fire",
}

/** Keyboard + virtual (touch D-pad) input sharing one mutable state object. */
export function createInput() {
  const state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
  }

  const onKey = (down: boolean) => (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest("input, textarea, [contenteditable]")) return
    const key = KEYMAP[event.key.toLowerCase()]
    if (!key) return
    event.preventDefault()
    state[key] = down
  }
  const keydown = onKey(true)
  const keyup = onKey(false)
  const clear = () => {
    for (const key of Object.keys(state) as (keyof InputState)[])
      state[key] = false
  }

  return {
    state,
    press: (key: keyof InputState, down: boolean) => {
      state[key] = down
    },
    clear,
    attach() {
      window.addEventListener("keydown", keydown)
      window.addEventListener("keyup", keyup)
      window.addEventListener("blur", clear)
    },
    detach() {
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("keyup", keyup)
      window.removeEventListener("blur", clear)
    },
  }
}

export type Input = ReturnType<typeof createInput>

export type InputState = {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  fire: boolean
}

export type GameEvent =
  | { type: "catch"; label: string }
  | { type: "hit" }
  | { type: "shoot" }
  | { type: "explode" }
  | { type: "lose" }

export type GameStatus = "playing" | "over"

/** Common fields every game state carries so the shell can read them. */
export type BaseState = {
  status: GameStatus
  score: number
  lives: number
  seed: number
  events: GameEvent[]
}

export type GameOptions = { hard?: boolean }

export type GameDef<S extends BaseState> = {
  width: number
  height: number
  init: (seed: number, options?: GameOptions) => S
  /** Pure: returns the next state. `dt` is a fixed step in seconds. */
  step: (state: S, input: InputState, dt: number) => S
  render?: (ctx: CanvasRenderingContext2D, state: S, time: number) => void
}

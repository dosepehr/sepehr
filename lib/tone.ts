/**
 * Decorative accent colors for projects, games and sections: cabinet bodies,
 * bars and dots. They are NOT text colors; text always uses the semantic
 * tokens (`text-foreground`, `text-primary-text`, ...), which are contrast-safe.
 */
export const TONES = [
  "teal",
  "coral",
  "amber",
  "indigo",
  "plum",
  "forest",
] as const

export type Tone = (typeof TONES)[number]

/** CSS color for DOM use, e.g. `style={{ backgroundColor: toneVar(tone) }}`. */
export const toneVar = (tone: Tone) => `var(--tone-${tone})`

/**
 * sRGB hex of the `--tone-*` tokens in globals.css, for WebGL (three.js cannot
 * parse oklch). Keep in sync with the CSS variables.
 */
export const TONE_HEX: Record<Tone, string> = {
  teal: "#008c8d",
  coral: "#e45e4d",
  amber: "#e9ab2b",
  indigo: "#4860be",
  plum: "#974391",
  forest: "#33854a",
}

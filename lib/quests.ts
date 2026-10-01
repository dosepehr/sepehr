export const QUEST_IDS = [
  "konami",
  "out-of-order",
  "sudo-hire-me",
  "golden-coin",
  "leet-score",
  "console",
  "neon-cat",
] as const

export type QuestId = (typeof QUEST_IDS)[number]

export const LEET_SCORE = 1337

/** Konami code, matched against KeyboardEvent.key (lower-cased). */
export const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
]

/** Pure: feed keys one by one; returns the new progress index (or full length on success). */
export function advanceSequence(
  sequence: string[],
  progress: number,
  key: string
) {
  const k = key.toLowerCase()
  if (sequence[progress] === k) return progress + 1
  return sequence[0] === k ? 1 : 0
}

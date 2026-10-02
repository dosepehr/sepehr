"use client"

import { useAudio } from "@/lib/store/audio"
import { audio, noise, play } from "./sfx"

// Original 8-bit sound effects in the style of classic platformers.
// Everything is synthesized; no melodies are borrowed from any game.

const N = (name: string) => {
  const notes: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  }
  const m = name.match(/^([A-G])(#?)(\d)$/)!
  const semis = notes[m[1]] + (m[2] ? 1 : 0) + (Number(m[3]) - 4) * 12 - 9
  return 440 * Math.pow(2, semis / 12)
}

export const marioSfx = {
  jump: () => play([{ f: 300, d: 0.16, slide: 900, type: "square", v: 0.045 }]),
  highJump: () =>
    play([{ f: 260, d: 0.22, slide: 1200, type: "square", v: 0.045 }]),
  coin: () =>
    play([
      { f: N("B5"), d: 0.06, type: "square", v: 0.04 },
      { f: N("E6"), d: 0.22, type: "square", v: 0.04 },
    ]),
  bump: () => play([{ f: 140, d: 0.09, slide: 90, type: "square", v: 0.07 }]),
  brick: () => {
    noise(0.18, 0.09, { type: "bandpass", f: 1200 })
    play([{ f: 220, d: 0.08, slide: 110, type: "square", v: 0.04 }])
  },
  blockOpen: () =>
    play(
      [
        { f: N("C5"), d: 0.05, type: "square", v: 0.04 },
        { f: N("G5"), d: 0.05, type: "square", v: 0.04 },
        { f: N("C6"), d: 0.09, type: "square", v: 0.04 },
      ],
      0.01
    ),
  powerUp: () =>
    play(
      [
        "C5",
        "E5",
        "G5",
        "C6",
        "D5",
        "F#5",
        "A5",
        "D6",
        "E5",
        "G#5",
        "B5",
        "E6",
      ].map((n) => ({
        f: N(n),
        d: 0.04,
        type: "square" as const,
        v: 0.035,
      }))
    ),
  powerUpAppear: () =>
    play(
      ["G4", "D5", "G5", "A5", "B5"].map((n) => ({
        f: N(n),
        d: 0.05,
        type: "triangle" as const,
        v: 0.06,
      }))
    ),
  extraLife: () =>
    play(
      ["E5", "A5", "C#6", "E6", "A6"].map((n, i) => ({
        f: N(n),
        d: i === 4 ? 0.2 : 0.08,
        type: "square" as const,
        v: 0.04,
      }))
    ),
  pipe: () =>
    play(
      [0, 1, 2].map((i) => ({
        f: 420 - i * 90,
        d: 0.09,
        slide: 160 - i * 30,
        type: "square" as const,
        v: 0.05,
      })),
      0.03
    ),
  stomp: () => {
    play([{ f: 500, d: 0.08, slide: 120, type: "square", v: 0.06 }])
    noise(0.06, 0.06, { type: "lowpass", f: 600 })
  },
  hurt: () =>
    play([
      { f: N("E5"), d: 0.07, type: "square", v: 0.05 },
      { f: N("B4"), d: 0.07, type: "square", v: 0.05 },
      { f: N("F4"), d: 0.14, type: "square", v: 0.05 },
    ]),
  fall: () =>
    play(
      ["B4", "F5", "F5", "F5", "E5", "D5", "C5"].map((n, i) => ({
        f: N(n),
        d: i === 0 ? 0.12 : 0.1,
        type: "square" as const,
        v: 0.04,
      })),
      0.02
    ),
  flagpole: () =>
    play([{ f: 1400, d: 1.1, slide: 180, type: "square", v: 0.035 }]),
  fanfare: () =>
    play(
      [
        "G4",
        "C5",
        "E5",
        "G5",
        "C6",
        "E6",
        "G6",
        "E6",
        "G#4",
        "C5",
        "D#5",
        "G#5",
        "C6",
        "D#6",
        "G#6",
      ].map((n, i) => ({
        f: N(n),
        d: i === 6 || i === 14 ? 0.32 : 0.09,
        type: "square" as const,
        v: 0.04,
      }))
    ),
  step: () =>
    noise(0.035, 0.03, { type: "lowpass", f: 700 + Math.random() * 300 }),
  land: () => noise(0.08, 0.06, { type: "lowpass", f: 300 }),
  select: () => play([{ f: N("A5"), d: 0.05, type: "square", v: 0.03 }]),
  pause: () =>
    play(
      ["E6", "C6", "E6", "C6"].map((n) => ({
        f: N(n),
        d: 0.06,
        type: "square" as const,
        v: 0.03,
      })),
      0.02
    ),
}

// ---------- Background music: an original, cheerful 16-bar loop. ----------

type Track = {
  notes: (string | null)[]
  type: OscillatorType
  v: number
  len: number
}

// Melody (eighth notes), C major with a I–vi–IV–V feel. Written for this site.
const LEAD: (string | null)[] = [
  "E5",
  null,
  "G5",
  "E5",
  "C5",
  null,
  "D5",
  "E5",
  "F5",
  null,
  "A5",
  "F5",
  "D5",
  null,
  "E5",
  "F5",
  "G5",
  "G5",
  "E5",
  "C5",
  "D5",
  null,
  "B4",
  "G4",
  "C5",
  null,
  "E5",
  null,
  "G5",
  "F5",
  "E5",
  "D5",
  "E5",
  null,
  "G5",
  "C6",
  "B5",
  null,
  "A5",
  "G5",
  "F5",
  null,
  "A5",
  "F5",
  "E5",
  null,
  "D5",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "G5",
  "F5",
  "D5",
  "C5",
  null,
  "G4",
  null,
  "C5",
  null,
  null,
  null,
]
const BASS: (string | null)[] = [
  "C3",
  null,
  "G3",
  null,
  "C3",
  null,
  "G3",
  null,
  "A2",
  null,
  "E3",
  null,
  "A2",
  null,
  "E3",
  null,
  "F2",
  null,
  "C3",
  null,
  "F2",
  null,
  "C3",
  null,
  "G2",
  null,
  "D3",
  null,
  "G2",
  null,
  "B2",
  null,
  "C3",
  null,
  "G3",
  null,
  "C3",
  null,
  "G3",
  null,
  "A2",
  null,
  "E3",
  null,
  "A2",
  null,
  "E3",
  null,
  "F2",
  null,
  "C3",
  null,
  "G2",
  null,
  "D3",
  null,
  "C3",
  null,
  "G2",
  null,
  "C3",
  null,
  null,
  null,
]

let music: { stop: () => void } | null = null

/** Start the loop (no-op when muted or already playing). Lookahead scheduler on the AudioContext clock. */
export function startMusic() {
  const ac = audio()
  if (!ac || music) return
  const out = ac.createGain()
  out.gain.value = 0.5
  out.connect(ac.destination)
  const tracks: Track[] = [
    { notes: LEAD, type: "square", v: 0.03, len: 0.85 },
    { notes: BASS, type: "triangle", v: 0.07, len: 0.9 },
  ]
  const eighth = 60 / 140 / 2
  let step = 0
  let next = ac.currentTime + 0.1
  const tick = () => {
    if (useAudio.getState().muted) return stopMusic()
    while (next < ac.currentTime + 0.25) {
      for (const t of tracks) {
        const n = t.notes[step % t.notes.length]
        if (!n) continue
        const o = ac.createOscillator()
        const g = ac.createGain()
        o.type = t.type
        o.frequency.value = N(n)
        g.gain.setValueAtTime(t.v, next)
        g.gain.exponentialRampToValueAtTime(0.0001, next + eighth * t.len * 1.6)
        o.connect(g).connect(out)
        o.start(next)
        o.stop(next + eighth * 2)
      }
      // A soft hi-hat on the off-beats.
      if (step % 2 === 1) {
        const len = Math.floor(ac.sampleRate * 0.03)
        const buf = ac.createBuffer(1, len, ac.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * (1 - i / len)
        const src = ac.createBufferSource()
        const hp = ac.createBiquadFilter()
        const g = ac.createGain()
        hp.type = "highpass"
        hp.frequency.value = 7000
        g.gain.value = 0.02
        src.buffer = buf
        src.connect(hp).connect(g).connect(out)
        src.start(next)
      }
      step++
      next += eighth
    }
  }
  const id = setInterval(tick, 50)
  tick()
  music = {
    stop: () => {
      clearInterval(id)
      out.gain.setTargetAtTime(0, ac.currentTime, 0.1)
      setTimeout(() => out.disconnect(), 600)
      music = null
    },
  }
}

export function stopMusic() {
  music?.stop()
}

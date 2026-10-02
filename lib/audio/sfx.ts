"use client"

import { useAudio } from "@/lib/store/audio"

// Procedural chiptune SFX on WebAudio. No asset files.
let ctx: AudioContext | null = null

export function audio() {
  if (typeof window === "undefined") return null
  if (useAudio.getState().muted) return null
  ctx ??= new AudioContext()
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

export type Note = {
  f: number
  d: number
  type?: OscillatorType
  slide?: number
  v?: number
}

export function play(notes: Note[], gap = 0) {
  const ac = audio()
  if (!ac) return
  let t = ac.currentTime
  for (const n of notes) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = n.type ?? "square"
    osc.frequency.setValueAtTime(n.f, t)
    if (n.slide) osc.frequency.exponentialRampToValueAtTime(n.slide, t + n.d)
    gain.gain.setValueAtTime(n.v ?? 0.06, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + n.d)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + n.d + 0.02)
    t += n.d + gap
  }
}

export function noise(
  duration: number,
  volume = 0.08,
  filter?: { type: BiquadFilterType; f: number }
) {
  const ac = audio()
  if (!ac) return
  const buffer = ac.createBuffer(
    1,
    Math.floor(ac.sampleRate * duration),
    ac.sampleRate
  )
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ac.createBufferSource()
  const gain = ac.createGain()
  gain.gain.value = volume
  src.buffer = buffer
  if (filter) {
    const bq = ac.createBiquadFilter()
    bq.type = filter.type
    bq.frequency.value = filter.f
    src.connect(bq).connect(gain).connect(ac.destination)
  } else src.connect(gain).connect(ac.destination)
  src.start()
}

// ---------- Ambient pad for the explorable world ----------

let pad: { stop: () => void } | null = null

/** A slow detuned synth drone with a filter sweep. Quiet, loops until stopped. */
function startAmbient() {
  const ac = audio()
  if (!ac || pad) return
  const out = ac.createGain()
  out.gain.setValueAtTime(0.0001, ac.currentTime)
  out.gain.exponentialRampToValueAtTime(0.035, ac.currentTime + 3)
  const lp = ac.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 700
  const lfo = ac.createOscillator()
  const lfoGain = ac.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 420
  lfo.connect(lfoGain).connect(lp.frequency)
  // A minor 9 chord, two slightly detuned saws per note.
  const oscs = [110, 130.81, 164.81, 246.94].flatMap((f) =>
    [-4, 4].map((cents) => {
      const o = ac.createOscillator()
      o.type = "sawtooth"
      o.frequency.value = f
      o.detune.value = cents
      o.connect(lp)
      o.start()
      return o
    })
  )
  lp.connect(out).connect(ac.destination)
  lfo.start()
  pad = {
    stop: () => {
      const t = ac.currentTime
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8)
      ;[...oscs, lfo].forEach((o) => o.stop(t + 0.9))
      pad = null
    },
  }
}

export const sfx = {
  hover: () => play([{ f: 880, d: 0.03, v: 0.02 }]),
  select: () =>
    play([
      { f: 523, d: 0.05 },
      { f: 784, d: 0.07 },
    ]),
  back: () =>
    play([
      { f: 659, d: 0.05 },
      { f: 392, d: 0.07 },
    ]),
  coin: () =>
    play([
      { f: 988, d: 0.06 },
      { f: 1319, d: 0.18 },
    ]),
  catch: () =>
    play([
      { f: 660, d: 0.05, type: "triangle" },
      { f: 990, d: 0.06, type: "triangle" },
    ]),
  shoot: () => play([{ f: 900, d: 0.08, slide: 200, v: 0.03 }]),
  hit: () => noise(0.12, 0.06),
  explode: () => noise(0.4, 0.1),
  lose: () =>
    play([
      { f: 392, d: 0.12 },
      { f: 330, d: 0.12 },
      { f: 262, d: 0.3 },
    ]),
  discover: () =>
    play([
      { f: 523, d: 0.08 },
      { f: 659, d: 0.08 },
      { f: 784, d: 0.08 },
      { f: 1047, d: 0.25, type: "triangle" },
    ]),
  type: () => play([{ f: 1200 + Math.random() * 200, d: 0.015, v: 0.015 }]),

  // ---------- World ----------
  /** One footstep; running steps are crisper and louder. */
  step: (run = false) =>
    noise(run ? 0.07 : 0.06, run ? 0.07 : 0.045, {
      type: "bandpass",
      f: (run ? 1400 : 900) + Math.random() * 400,
    }),
  jump: () =>
    play([{ f: 220, d: 0.16, slide: 660, type: "triangle", v: 0.05 }]),
  land: () => noise(0.12, 0.09, { type: "lowpass", f: 380 }),
  kick: () => {
    noise(0.1, 0.1, { type: "lowpass", f: 900 })
    play([{ f: 140, d: 0.12, slide: 70, type: "sine", v: 0.12 }])
  },
  bump: () => noise(0.05, 0.035, { type: "lowpass", f: 500 }),
  pickup: () =>
    play([
      { f: 1319, d: 0.05, type: "triangle", v: 0.05 },
      { f: 1760, d: 0.12, type: "triangle", v: 0.05 },
    ]),
  prompt: () => play([{ f: 1047, d: 0.03, type: "sine", v: 0.03 }]),
  teleport: () =>
    play([
      { f: 300, d: 0.25, slide: 1800, type: "sawtooth", v: 0.03 },
      { f: 1800, d: 0.2, slide: 400, type: "sine", v: 0.04 },
    ]),
  quack: () =>
    play([{ f: 620, d: 0.12, slide: 380, type: "sawtooth", v: 0.05 }]),
  /** Arcade attract-mode bleeps, scaled by distance (0..1). */
  attract: (volume: number) => {
    const base = [523, 659, 784, 988, 1175][Math.floor(Math.random() * 5)]
    play(
      [
        { f: base, d: 0.06, v: 0.03 * volume },
        { f: base * 1.5, d: 0.06, v: 0.03 * volume },
        { f: base * 2, d: 0.09, v: 0.025 * volume },
      ],
      0.02
    )
  },
  ambient: { start: startAmbient, stop: () => pad?.stop() },
}

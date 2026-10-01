"use client"

import { useAudio } from "@/lib/store/audio"

// Procedural chiptune SFX on WebAudio. No asset files.
let ctx: AudioContext | null = null

function audio() {
  if (typeof window === "undefined") return null
  if (useAudio.getState().muted) return null
  ctx ??= new AudioContext()
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

type Note = { f: number; d: number; type?: OscillatorType; slide?: number; v?: number }

function play(notes: Note[], gap = 0) {
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

function noise(duration: number, volume = 0.08) {
  const ac = audio()
  if (!ac) return
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * duration), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ac.createBufferSource()
  const gain = ac.createGain()
  gain.gain.value = volume
  src.buffer = buffer
  src.connect(gain).connect(ac.destination)
  src.start()
}

export const sfx = {
  hover: () => play([{ f: 880, d: 0.03, v: 0.02 }]),
  select: () => play([{ f: 523, d: 0.05 }, { f: 784, d: 0.07 }]),
  back: () => play([{ f: 659, d: 0.05 }, { f: 392, d: 0.07 }]),
  coin: () => play([{ f: 988, d: 0.06 }, { f: 1319, d: 0.18 }]),
  catch: () => play([{ f: 660, d: 0.05, type: "triangle" }, { f: 990, d: 0.06, type: "triangle" }]),
  shoot: () => play([{ f: 900, d: 0.08, slide: 200, v: 0.03 }]),
  hit: () => noise(0.12, 0.06),
  explode: () => noise(0.4, 0.1),
  lose: () => play([{ f: 392, d: 0.12 }, { f: 330, d: 0.12 }, { f: 262, d: 0.3 }]),
  discover: () =>
    play([
      { f: 523, d: 0.08 },
      { f: 659, d: 0.08 },
      { f: 784, d: 0.08 },
      { f: 1047, d: 0.25, type: "triangle" },
    ]),
  type: () => play([{ f: 1200 + Math.random() * 200, d: 0.015, v: 0.015 }]),
}

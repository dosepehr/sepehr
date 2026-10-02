"use client"

import { Flag, Star } from "lucide-react"
import { useMemo, useState } from "react"
import type { LabData } from "./types"
import { NEON, useInView } from "./shared"

/** 31: alternating glowing timeline. */
export function GlowTimeline({ data }: { data: LabData }) {
  const [ref, seen] = useInView<HTMLOListElement>()
  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl">
      <span className="absolute start-4 top-0 bottom-0 w-px bg-linear-to-b from-neon-pink via-neon-purple to-neon-cyan md:start-1/2" />
      {data.profile.experience.map((job, i) => (
        <li
          key={job.company + job.period}
          className={`relative mb-10 ps-12 transition-all duration-700 md:w-1/2 md:ps-0 ${i % 2 ? "md:ms-auto md:ps-10" : "md:pe-10 md:text-end"}`}
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? "none" : "translateY(20px)",
            transitionDelay: `${i * 150}ms`,
          }}
        >
          <span
            className={`absolute start-2.5 top-1.5 size-3.5 rounded-full ring-4 ring-background ${i % 2 ? "md:-start-[7px]" : "md:start-auto md:-end-[7px]"}`}
            style={{
              background: NEON[i % NEON.length],
              boxShadow: `0 0 14px ${NEON[i % NEON.length]}`,
            }}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {job.period}
          </span>
          <h3 className="mt-1 text-lg font-semibold">{job.role}</h3>
          <p className="text-sm" style={{ color: NEON[i % NEON.length] }}>
            {job.company}
          </p>
          <p className="mt-2 text-sm text-foreground/80">{job.summary}</p>
        </li>
      ))}
    </ol>
  )
}

/** 32: career as a platformer world map; each job is a level. */
export function LevelMap({ data }: { data: LabData }) {
  const jobs = [
    {
      company: "Hello, world",
      role: "Player 1",
      period: "start",
      summary: "Spawned at a keyboard. First bug squashed.",
    },
    ...[...data.profile.experience].reverse(),
  ]
  const [sel, setSel] = useState(jobs.length - 1)
  const pts = jobs.map((_, i) => ({
    x: 10 + (i * 80) / Math.max(1, jobs.length - 1),
    y: i % 2 ? 30 : 70,
  }))
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ")
  const job = jobs[sel]
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-black bg-[#2b1055] shadow-[6px_6px_0_black]">
      <div className="relative h-56 bg-[linear-gradient(to_bottom,#2b1055,#7597de)]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth={1.2}
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-[repeating-linear-gradient(90deg,#3c8d2f_0_16px,#2f7524_16px_32px)] shadow-[inset_0_4px_0_#62c94a]" />
        {pts.map((p, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            aria-label={jobs[i].company}
            className="absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-black font-mono text-xs font-bold transition-transform hover:scale-110"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: i === sel ? "var(--neon-yellow)" : "white",
              color: "black",
            }}
          >
            {i === jobs.length - 1 ? <Flag className="size-4" /> : `${i + 1}`}
          </button>
        ))}
      </div>
      <div className="border-t-4 border-black bg-black p-5 font-mono text-sm text-white">
        <p className="text-neon-yellow">
          WORLD 1-{sel + 1} · {job.period}
        </p>
        <p className="mt-1 text-lg">
          {job.role} @ {job.company}
        </p>
        <p className="mt-1 text-white/70">{job.summary}</p>
      </div>
    </div>
  )
}

/** 33: GitHub-style activity heatmap (decorative, seeded). */
export function ActivityHeatmap({ data }: { data: LabData }) {
  const weeks = 52
  const cells = useMemo(() => {
    const base = data.profile.name.length * 977
    // Cheap deterministic hash so the heatmap is stable between renders.
    const rand = (i: number) => {
      const x = Math.sin(base + i * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const wave = Math.sin(i / 30) * 0.3 + 0.5
      const r = rand(i)
      return r < 0.18 ? 0 : Math.min(4, Math.floor(r * wave * 6))
    })
  }, [data.profile.name])
  const total = cells.reduce((a, c) => a + c * 3, 0)
  const shades = [
    "rgba(255,255,255,0.05)",
    "color-mix(in oklch, var(--neon-pink) 30%, transparent)",
    "color-mix(in oklch, var(--neon-pink) 55%, transparent)",
    "color-mix(in oklch, var(--neon-pink) 80%, transparent)",
    "var(--neon-pink)",
  ]
  return (
    <div
      className="rounded-2xl border border-white/10 bg-card/50 p-5"
      dir="ltr"
    >
      <p className="mb-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {total.toLocaleString()}
        </span>{" "}
        contributions in the last year
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
          {cells.map((c, i) => (
            <span
              key={i}
              className="size-[11px] rounded-[2px]"
              style={{
                background: shades[c],
                boxShadow: c === 4 ? "0 0 6px var(--neon-pink)" : undefined,
              }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        Less{" "}
        {shades.map((s) => (
          <span
            key={s}
            className="size-[11px] rounded-[2px]"
            style={{ background: s }}
          />
        ))}{" "}
        More
      </div>
    </div>
  )
}

/** 34: experience as `git log --graph`. */
export function GitLog({ data }: { data: LabData }) {
  const hash = (s: string) => {
    let h = 0
    for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    return h.toString(16).padStart(7, "0").slice(0, 7)
  }
  const entries = [
    ...data.projects.map((p) => ({
      msg: `feat: ship ${p.title}`,
      ref: p.date.slice(0, 7),
      branch: false,
    })),
    ...data.profile.experience.map((e) => ({
      msg: `merge: ${e.role} @ ${e.company}`,
      ref: e.period,
      branch: true,
    })),
  ]
  return (
    <div
      className="overflow-x-auto rounded-2xl border border-white/10 bg-[#07040f] p-5 font-mono text-sm"
      dir="ltr"
    >
      <p className="mb-3 text-muted-foreground">
        $ git log --graph --oneline career
      </p>
      <ol>
        {entries.map((e, i) => (
          <li
            key={i}
            className="flex items-center gap-3 py-1 whitespace-nowrap"
          >
            <span className="w-8 text-neon-pink">{e.branch ? "*─╮" : "*"}</span>
            <span className="text-neon-yellow">{hash(e.msg)}</span>
            {i === 0 && (
              <span className="rounded bg-neon-cyan/20 px-1.5 text-neon-cyan">
                (HEAD → main)
              </span>
            )}
            <span className="text-foreground/90">{e.msg}</span>
            <span className="text-muted-foreground">{e.ref}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 py-1 text-muted-foreground">
          <span className="w-8 text-neon-pink">*</span>
          <Star className="size-3.5" /> initial commit: hello, world
        </li>
      </ol>
    </div>
  )
}

"use client"

import { useState } from "react"
import type { Skill } from "@/lib/content/types"
import type { LabData } from "./types"
import { NEON, useInView } from "./shared"

/** 16: radar chart of the top skills. */
export function SkillRadar({ data }: { data: LabData }) {
  const skills = data.profile.skills.slice(0, 8)
  const [ref, seen] = useInView<HTMLDivElement>()
  const R = 120
  const pt = (i: number, r: number) => {
    const a = (i / skills.length) * Math.PI * 2 - Math.PI / 2
    return [Math.cos(a) * r, Math.sin(a) * r] as const
  }
  const poly = skills
    .map((s, i) => pt(i, seen ? (s.level / 100) * R : 0).join(","))
    .join(" ")
  return (
    <div ref={ref} className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
      <svg
        viewBox="-170 -150 340 300"
        className="mx-auto w-full max-w-sm"
        role="img"
        aria-label="Skill radar"
      >
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon
            key={k}
            points={skills.map((_, i) => pt(i, R * k).join(",")).join(" ")}
            fill="none"
            stroke="var(--neon-purple)"
            strokeOpacity={0.3}
          />
        ))}
        {skills.map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={pt(i, R)[0]}
            y2={pt(i, R)[1]}
            stroke="var(--neon-purple)"
            strokeOpacity={0.25}
          />
        ))}
        <polygon
          points={poly}
          fill="color-mix(in oklch, var(--neon-pink) 30%, transparent)"
          stroke="var(--neon-pink)"
          strokeWidth={2}
          style={{
            transition: "all 1s cubic-bezier(.2,.8,.2,1)",
            filter: "drop-shadow(0 0 8px var(--neon-pink))",
          }}
        />
        {skills.map((s, i) => {
          const [x, y] = pt(i, R + 22)
          return (
            <text
              key={s.name}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-neon-cyan font-mono text-[11px]"
            >
              {s.name}
            </text>
          )
        })}
      </svg>
      <ul className="grid gap-2 text-sm" dir="ltr">
        {skills.map((s, i) => (
          <li
            key={s.name}
            className="flex items-center justify-between gap-6 border-b border-white/5 pb-2"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ background: NEON[i % NEON.length] }}
              />
              {s.name}
            </span>
            <span className="font-mono text-muted-foreground">{s.level}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 17: skills orbiting a core, inner ring = strongest. */
export function SkillOrbit({ data }: { data: LabData }) {
  const sorted = [...data.profile.skills].sort((a, b) => b.level - a.level)
  const rings = [sorted.slice(0, 4), sorted.slice(4, 10)]
  return (
    <div
      className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center overflow-hidden"
      dir="ltr"
    >
      {[110, 190].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-dashed border-neon-purple/30"
          style={{ width: r * 2, height: r * 2 }}
        />
      ))}
      <div className="grid size-24 place-items-center rounded-full bg-[radial-gradient(circle,var(--neon-pink),color-mix(in_oklch,var(--neon-purple)_60%,transparent))] font-display text-3xl font-black shadow-[0_0_60px_var(--neon-pink)]">
        {data.profile.name.slice(0, 1)}
      </div>
      {rings.map((ring, ri) =>
        ring.map((s, i) => (
          <span
            key={s.name}
            className="absolute animate-orbit rounded-full border border-white/15 bg-card/90 px-3 py-1 text-xs whitespace-nowrap shadow-[0_0_12px_rgba(0,0,0,0.5)]"
            style={
              {
                "--orbit-r": `${ri ? 190 : 110}px`,
                "--orbit-duration": `${ri ? 46 : 28}s`,
                "--orbit-delay": `${-(i / ring.length) * (ri ? 46 : 28)}s`,
                color: NEON[(i + ri) % NEON.length],
              } as React.CSSProperties
            }
          >
            {s.name}
          </span>
        ))
      )}
    </div>
  )
}

/** 18: a graphic equalizer where each band is a skill. */
export function SkillEqualizer({ data }: { data: LabData }) {
  const skills = data.profile.skills
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#05020c] p-6"
      dir="ltr"
    >
      <div className="flex h-56 items-end gap-2 sm:gap-3">
        {skills.map((s, i) => (
          <div
            key={s.name}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className="flex w-full animate-eq flex-col-reverse gap-0.5"
              style={
                {
                  height: `${s.level}%`,
                  "--eq-speed": `${0.8 + (i % 4) * 0.25}s`,
                  "--eq-lo": 0.55 + (i % 3) * 0.1,
                } as React.CSSProperties
              }
            >
              {Array.from({ length: 12 }, (_, k) => (
                <span
                  key={k}
                  className="flex-1 rounded-[2px]"
                  style={{
                    background:
                      k > 9
                        ? "var(--neon-pink)"
                        : k > 6
                          ? "var(--neon-yellow)"
                          : "var(--neon-cyan)",
                    boxShadow: "0 0 6px currentColor",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {skills.map((s) => (
          <span
            key={s.name}
            className="flex-1 truncate text-center font-mono text-[10px] text-muted-foreground sm:text-xs"
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

/** 19: weighted tag cloud; hover lights a tag up. */
export function SkillCloud({ data }: { data: LabData }) {
  const extra: Skill[] = data.projects
    .flatMap((p) => p.stack)
    .filter(
      (t, i, a) =>
        a.indexOf(t) === i && !data.profile.skills.some((s) => s.name === t)
    )
    .map((name) => ({ name, level: 45, group: "tools" }))
  const all = [...data.profile.skills, ...extra]
  const shuffled = all
    .map((s, i) => ({ s, k: (i * 7919) % all.length }))
    .sort((a, b) => a.k - b.k)
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl bg-card/40 px-6 py-12"
      dir="ltr"
    >
      {shuffled.map(({ s }, i) => (
        <span
          key={s.name}
          className="cursor-default font-display font-bold text-foreground/40 transition-all duration-300 hover:scale-110 hover:text-glow"
          style={{ fontSize: `${0.8 + (s.level / 100) * 1.8}rem` }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = NEON[i % NEON.length])
          }
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          {s.name}
        </span>
      ))}
    </div>
  )
}

/** 20: circular progress rings grouped by area. */
export function SkillRings({ data }: { data: LabData }) {
  const [ref, seen] = useInView<HTMLUListElement>()
  const [active, setActive] = useState<"all" | Skill["group"]>("all")
  const list = data.profile.skills.filter(
    (s) => active === "all" || s.group === active
  )
  const C = 2 * Math.PI * 34
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {(["all", "frontend", "backend", "tools"] as const).map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={active === g}
            onClick={() => setActive(g)}
            className={`min-h-9 rounded-full px-4 text-sm capitalize transition-colors ${active === g ? "bg-neon-cyan text-background" : "bg-white/5 hover:bg-white/10"}`}
          >
            {g}
          </button>
        ))}
      </div>
      <ul
        ref={ref}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        dir="ltr"
      >
        {list.map((s, i) => (
          <li
            key={s.name}
            className="flex flex-col items-center gap-2 rounded-xl bg-card/50 p-4"
          >
            <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
              <circle
                cx={40}
                cy={40}
                r={34}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={6}
              />
              <circle
                cx={40}
                cy={40}
                r={34}
                fill="none"
                stroke={NEON[i % NEON.length]}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={seen ? C * (1 - s.level / 100) : C}
                style={{
                  transition: "stroke-dashoffset 1.2s ease-out",
                  filter: `drop-shadow(0 0 4px ${NEON[i % NEON.length]})`,
                }}
              />
            </svg>
            <span className="-mt-14 mb-6 font-mono text-sm">{s.level}%</span>
            <span className="text-sm font-medium">{s.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 21: two infinite rows of tech chips. */
export function TechMarquee({ data }: { data: LabData }) {
  const names = [
    ...new Set([
      ...data.profile.skills.map((s) => s.name),
      ...data.projects.flatMap((p) => p.stack),
    ]),
  ]
  const row = (items: string[], reverse: boolean) => (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <ul
        className={`flex w-max gap-3 py-2 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": "35s" } as React.CSSProperties}
      >
        {[...items, ...items].map((n, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-card/70 px-4 py-3 text-sm whitespace-nowrap"
          >
            <span
              className="size-2 rounded-full"
              style={{
                background: NEON[i % NEON.length],
                boxShadow: `0 0 8px ${NEON[i % NEON.length]}`,
              }}
            />
            {n}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="flex flex-col gap-2" dir="ltr">
      {row(names, false)}
      {row([...names].reverse(), true)}
    </div>
  )
}

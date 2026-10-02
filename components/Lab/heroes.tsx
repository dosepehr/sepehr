"use client"

import { ArrowRight, Download, MapPin } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { LabData } from "./types"
import { NEON, useInView, useTypewriter } from "./shared"

function Ctas({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href="#projects"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-neon-pink px-5 font-medium text-background shadow-[0_0_24px_var(--neon-pink)] transition-transform hover:-translate-y-0.5"
      >
        {dict.nav.projects}
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
      </a>
      <a
        href={`/resume/${data.lang}.pdf`}
        download
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-background/70 px-5 text-neon-cyan neon-border backdrop-blur-sm hover:bg-neon-cyan/10"
      >
        <Download className="size-4" aria-hidden />
        {dict.nav.resume}
      </a>
    </div>
  )
}

/** 01: the classic outrun sunset with a racing grid. */
export function SunsetHero({
  data,
  extra,
}: {
  data: LabData
  /** Rendered under the CTAs (the Lite hub puts its 3D switch and notice here). */
  extra?: ReactNode
}) {
  const { dict } = useDictionary()
  return (
    <div className="relative isolate flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(to_bottom,#0b0618,#2a0b3d_55%,#3d0b3a)] px-6 pt-10 pb-40 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(1px_1px_at_20%_30%,white,transparent),radial-gradient(1px_1px_at_70%_20%,white,transparent),radial-gradient(1px_1px_at_40%_15%,white,transparent),radial-gradient(1px_1px_at_85%_40%,white,transparent),radial-gradient(1px_1px_at_10%_10%,white,transparent)]" />
      {/* The sun sets behind the horizon: clip it at the grid line. */}
      <div className="absolute inset-x-0 top-0 bottom-[42%] -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 size-72 -translate-x-1/2 translate-y-[12%] synth-sun sm:size-96" />
      </div>
      <div className="absolute inset-x-[-50%] bottom-0 -z-10 h-[42%] synth-floor" />
      <div className="absolute inset-x-0 bottom-[42%] -z-10 h-px bg-neon-pink shadow-[0_0_20px_4px_var(--neon-pink)]" />
      <p className="rounded-full bg-black/45 px-4 py-1.5 font-mono text-xs tracking-[0.3em] text-neon-cyan uppercase backdrop-blur-sm">
        {data.profile.location} · {data.profile.role}
      </p>
      <h1 className="mt-4 font-display text-6xl font-black tracking-[0.2em] text-neon-pink uppercase text-glow sm:text-8xl">
        {data.profile.name}
      </h1>
      <p className="mt-4 max-w-lg rounded-xl bg-black/45 px-4 py-1.5 text-lg text-white backdrop-blur-sm">
        {dict.site.tagline}
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <Ctas data={data} />
        {extra}
      </div>
    </div>
  )
}

/** 02: a shell that introduces you by running commands. */
export function TerminalHero({ data }: { data: LabData }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const script = `$ whoami\n${data.profile.name} — ${data.profile.role}\n$ cat stack.txt\n${data.profile.skills
    .slice(0, 6)
    .map((s) => s.name)
    .join(" · ")}\n$ ./hire --now\n> opening a direct line…`
  const typed = useTypewriter(script, 28, seen)
  return (
    <div
      ref={ref}
      className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center"
    >
      <div className="flex flex-col gap-5">
        <h1 className="font-display text-5xl leading-tight font-black text-foreground sm:text-6xl">
          Hi, I&apos;m <span className="text-shine">{data.profile.name}</span>
        </h1>
        <p className="text-lg text-muted-foreground">{data.profile.bio[0]}</p>
        <Ctas data={data} />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#07040f] shadow-[0_30px_80px_-20px_var(--neon-purple)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ms-3 font-mono text-xs text-muted-foreground">
            sepehr@arcade: ~
          </span>
        </div>
        <pre
          dir="ltr"
          className="min-h-64 p-5 font-mono text-sm leading-7 whitespace-pre-wrap text-[#5dff9d]"
        >
          {typed}
          <span className="animate-blink">█</span>
        </pre>
      </div>
    </div>
  )
}

/** 03: chromatic glitch name on a scanlined slab. */
export function GlitchHero({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  return (
    <div className="scanlines relative overflow-hidden rounded-2xl border border-white/10 bg-[#05020c] px-6 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--neon-purple)_30%,transparent),transparent_70%)]" />
      <p className="relative font-mono text-sm text-neon-yellow">
        {"//"} {data.profile.role}
      </p>
      <h1
        data-text={data.profile.name.toUpperCase()}
        className="glitch relative mt-3 font-display text-6xl font-black tracking-widest text-white sm:text-8xl"
      >
        {data.profile.name.toUpperCase()}
      </h1>
      <p className="relative mx-auto mt-6 max-w-md text-muted-foreground">
        {dict.site.tagline}
      </p>
    </div>
  )
}

/** 04: a flashlight that follows the pointer and reveals a hidden grid. */
export function SpotlightHero({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`)
  }
  return (
    <div
      ref={ref}
      onPointerMove={move}
      style={{ "--x": "50%", "--y": "40%" } as React.CSSProperties}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#07040f] px-6 py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--neon-cyan)_1px,transparent_1px),linear-gradient(90deg,var(--neon-cyan)_1px,transparent_1px)] [mask-image:radial-gradient(220px_at_var(--x)_var(--y),black,transparent)] bg-size-[40px_40px] opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_at_var(--x)_var(--y),color-mix(in_oklch,var(--neon-pink)_25%,transparent),transparent)]" />
      <div className="relative flex flex-col items-start gap-4">
        <span className="rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1 font-mono text-xs text-neon-cyan">
          ● available for work
        </span>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-7xl">
          {data.profile.name}{" "}
          <span className="text-muted-foreground">builds</span>{" "}
          <span className="text-neon-pink">
            {dict.site.tagline.split(" ").slice(-3).join(" ")}
          </span>
        </h1>
        <p className="text-muted-foreground">{data.profile.role}</p>
      </div>
    </div>
  )
}

/** 05: oversized marquee bands sliding against each other. */
export function MarqueeHero({ data }: { data: LabData }) {
  const words = data.profile.skills.map((s) => s.name)
  const band = (
    items: string[],
    reverse: boolean,
    color: string,
    tilt: string
  ) => (
    <div
      className={`overflow-hidden border-y border-white/10 bg-background/60 py-3 ${tilt}`}
    >
      <div
        className={`flex w-max gap-10 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": "40s" } as React.CSSProperties}
        dir="ltr"
      >
        {[...items, ...items].map((w, i) => (
          <span
            key={i}
            className="font-display text-4xl font-black tracking-wider uppercase sm:text-5xl"
            style={{
              color: i % 2 ? color : "transparent",
              WebkitTextStroke: `1px ${color}`,
            }}
          >
            {w} ✦
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="flex flex-col gap-6 overflow-hidden rounded-2xl py-10">
      <div className="px-6">
        <h1 className="font-display text-5xl font-black text-foreground sm:text-7xl">
          {data.profile.name}
          <span className="text-neon-pink">.</span>
        </h1>
        <p className="mt-2 text-lg text-neon-cyan">{data.profile.role}</p>
      </div>
      {band(words, false, "var(--neon-pink)", "-rotate-2")}
      {band([...words].reverse(), true, "var(--neon-cyan)", "rotate-1")}
    </div>
  )
}

/** 06: arcade attract mode, complete with a high score table. */
export function AttractHero({ data }: { data: LabData }) {
  const scores = [
    [data.profile.name.toUpperCase(), 999990],
    ...data.projects
      .slice(0, 4)
      .map((p, i) => [p.title.toUpperCase(), 524000 - i * 81230]),
  ] as const
  return (
    <div className="scanlines relative overflow-hidden rounded-2xl border-4 border-neon-purple/60 bg-black px-6 py-12 text-center shadow-[inset_0_0_80px_color-mix(in_oklch,var(--neon-purple)_40%,transparent)]">
      <p className="font-mono text-sm text-neon-yellow">
        1UP 999990 · HI-SCORE 999990
      </p>
      <h1 className="mt-6 font-display text-5xl font-black tracking-[0.25em] text-neon-pink uppercase text-glow sm:text-7xl">
        {data.profile.name}
      </h1>
      <p className="mt-2 font-display text-sm tracking-[0.3em] text-neon-cyan uppercase">
        {data.profile.role}
      </p>
      <ol className="mx-auto mt-8 max-w-md font-mono text-sm" dir="ltr">
        {scores.map(([name, score], i) => (
          <li
            key={name}
            className="grid grid-cols-[3rem_1fr_auto] gap-2 py-1"
            style={{ color: NEON[i % NEON.length] }}
          >
            <span>{["1ST", "2ND", "3RD", "4TH", "5TH"][i]}</span>
            <span className="truncate text-start">{name}</span>
            <span>{String(score).padStart(6, "0")}</span>
          </li>
        ))}
      </ol>
      <p className="mt-8 animate-blink font-display text-xl tracking-[0.3em] text-neon-yellow">
        INSERT COIN
      </p>
    </div>
  )
}

const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ/-."

/** 07: airport split-flap board cycling through roles. */
export function SplitFlapHero({ data }: { data: LabData }) {
  const phrases = [
    data.profile.name.toUpperCase(),
    "FRONTEND",
    "FULLSTACK",
    "WEBGL",
    "DESIGN SYSTEMS",
  ]
  const width = Math.max(...phrases.map((p) => p.length))
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(phrases[0].padEnd(width))
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      3200
    )
    return () => clearInterval(id)
  }, [phrases.length])
  useEffect(() => {
    const target = phrases[index].padEnd(width)
    const id = setInterval(() => {
      setShown((cur) => {
        if (cur === target) {
          clearInterval(id)
          return cur
        }
        return cur
          .split("")
          .map((c, i) => {
            if (c === target[i]) return c
            const k = FLAP_CHARS.indexOf(c)
            return FLAP_CHARS[(k + 1) % FLAP_CHARS.length]
          })
          .join("")
      })
    }, 35)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width])
  return (
    <div className="flex flex-col items-center gap-8 rounded-2xl bg-[#0d0a14] px-4 py-16">
      <p className="font-mono text-xs tracking-[0.4em] text-muted-foreground">
        NOW BOARDING · {data.profile.location.toUpperCase()}
      </p>
      <div
        className="flex flex-wrap justify-center gap-1"
        dir="ltr"
        aria-label={phrases[index]}
      >
        {shown.split("").map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="relative grid h-14 w-9 place-items-center overflow-hidden rounded-md bg-[#1b1626] font-mono text-3xl font-bold text-neon-yellow shadow-[inset_0_-2px_0_rgba(0,0,0,0.6)] sm:h-16 sm:w-11 sm:text-4xl"
          >
            {c}
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
          </span>
        ))}
      </div>
      <Ctas data={data} />
    </div>
  )
}

/** 08: holographic trading card that tilts with the pointer. */
export function HoloCardHero({ data }: { data: LabData }) {
  const card = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `rotateY(${(x - 0.5) * 22}deg) rotateX(${(0.5 - y) * 18}deg)`
    el.style.setProperty("--hx", `${x * 100}%`)
    el.style.setProperty("--hy", `${y * 100}%`)
  }
  const reset = () => {
    if (card.current) card.current.style.transform = ""
  }
  return (
    <div className="grid items-center gap-10 py-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm text-neon-cyan">player select</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          {data.profile.name}
        </h1>
        <p className="text-muted-foreground">{data.profile.bio[0]}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden /> {data.profile.location}
        </p>
      </div>
      <div
        className="mx-auto perspective-[1000px]"
        onPointerMove={move}
        onPointerLeave={reset}
      >
        <div
          ref={card}
          className="relative aspect-[5/7] w-72 rounded-2xl border border-white/20 bg-[linear-gradient(160deg,#2a0b3d,#0b0618)] p-5 shadow-[0_30px_80px_-20px_var(--neon-pink)] transition-transform duration-200 ease-out transform-3d"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 mix-blend-color-dodge [background:radial-gradient(circle_at_var(--hx,50%)_var(--hy,50%),rgba(255,255,255,0.6),transparent_40%),linear-gradient(115deg,transparent_20%,var(--neon-cyan)_35%,var(--neon-pink)_50%,var(--neon-yellow)_65%,transparent_80%)]" />
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-neon-yellow">★ LEGENDARY</span>
            <span className="text-neon-cyan">HP 999</span>
          </div>
          <div className="mt-4 grid aspect-square place-items-center rounded-xl bg-[radial-gradient(circle,var(--neon-purple),transparent_70%)] font-display text-7xl font-black text-white text-glow">
            {data.profile.name.slice(0, 1)}
          </div>
          <p className="mt-4 font-display text-lg font-bold">
            {data.profile.name}
          </p>
          <p className="text-xs text-muted-foreground">{data.profile.role}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {data.profile.skills.slice(0, 4).map((s) => (
              <span
                key={s.name}
                className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

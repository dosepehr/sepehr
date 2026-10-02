"use client"

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import Link from "next/link"
import { useRef, useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { Project } from "@/lib/content/types"
import type { LabData } from "./types"

const href = (data: LabData, p: Project) => `/${data.lang}/projects/${p.slug}`

function Stack({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" dir="ltr">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs"
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

/** Procedural "screenshot": a mini synthwave scene tinted with the project color. */
function Thumb({ color, seed = 0 }: { color: string; seed?: number }) {
  return (
    <div
      className="relative aspect-video overflow-hidden rounded-lg bg-[#07040f]"
      style={{ "--c": color } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklch,var(--c)_35%,transparent))]" />
      <div
        className="absolute start-1/2 top-[22%] size-20 -translate-x-1/2 rounded-full rtl:translate-x-1/2"
        style={{
          background: `linear-gradient(var(--neon-yellow), ${color})`,
          boxShadow: `0 0 40px ${color}`,
        }}
      />
      <div
        className="absolute inset-x-[-40%] bottom-0 h-1/2 synth-floor opacity-70"
        style={{ animationDelay: `${-seed * 0.3}s` }}
      />
      <div className="absolute inset-x-3 top-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 rounded-full bg-white/30"
            style={{ width: `${20 + (((seed + i) * 17) % 40)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/** 22: snap-scrolling carousel with arrows. */
export function ProjectCarousel({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: number) => {
    const el = track.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.8, behavior: "smooth" })
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => scroll(d)}
            aria-label={d < 0 ? "Previous" : "Next"}
            className="grid size-11 place-items-center rounded-full border border-white/15 hover:bg-white/10"
          >
            {d < 0 ? (
              <ChevronLeft className="size-5 rtl:rotate-180" />
            ) : (
              <ChevronRight className="size-5 rtl:rotate-180" />
            )}
          </button>
        ))}
      </div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-4"
      >
        {[...data.projects, ...data.projects].map((p, i) => (
          <li
            key={i}
            className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[32%]"
          >
            <Link
              href={href(data, p)}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-card/60 p-3 transition-colors hover:border-[var(--c)]"
              style={{ "--c": p.color } as React.CSSProperties}
            >
              <Thumb color={p.color} seed={i} />
              <div className="flex items-start justify-between gap-2 px-1">
                <h3 className="font-semibold">{p.title}</h3>
                <ArrowUpRight
                  className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: p.color }}
                />
              </div>
              <p className="line-clamp-2 px-1 text-sm text-muted-foreground">
                {p.summary}
              </p>
              <span className="sr-only">{dict.projects.readCase}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 23: cards shaped like arcade cabinets. */
export function CabinetCards({ data }: { data: LabData }) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {data.projects.map((p, i) => (
        <li key={p.slug} style={{ "--c": p.color } as React.CSSProperties}>
          <Link
            href={href(data, p)}
            className="group block transition-transform hover:-translate-y-1"
          >
            <div className="rounded-t-2xl border-x-4 border-t-4 border-[var(--c)] bg-black px-3 py-2 text-center font-display text-sm tracking-widest text-[var(--c)] uppercase shadow-[0_0_20px_var(--c)] text-glow">
              {p.title}
            </div>
            <div className="border-x-4 border-[var(--c)]/60 bg-[#120a24] p-4">
              <div className="scanlines overflow-hidden rounded-[1.2rem] border-4 border-black shadow-[inset_0_0_30px_black]">
                <Thumb color={p.color} seed={i} />
              </div>
              <div className="mt-4 flex items-center justify-between px-2">
                <span className="relative size-8">
                  <span className="absolute start-1/2 bottom-0 h-6 w-1.5 -translate-x-1/2 rounded bg-white/60 transition-transform group-hover:rotate-12" />
                  <span className="absolute start-1/2 top-0 size-4 -translate-x-1/2 rounded-full bg-[var(--c)]" />
                </span>
                <span className="flex gap-2">
                  {[
                    "var(--neon-pink)",
                    "var(--neon-cyan)",
                    "var(--neon-yellow)",
                  ].map((c) => (
                    <span
                      key={c}
                      className="size-4 rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)]"
                      style={{ background: c }}
                    />
                  ))}
                </span>
              </div>
            </div>
            <div className="rounded-b-lg border-x-4 border-b-4 border-[var(--c)]/60 bg-[#0b0618] p-4 text-sm text-muted-foreground">
              {p.summary}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 24: flip cards — summary on the front, stack and links on the back. */
export function FlipCards({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.projects.map((p) => (
        <li key={p.slug} className="group h-72 perspective-[1200px]">
          <div className="relative size-full transition-transform duration-700 transform-3d group-focus-within:rotate-y-180 group-hover:rotate-y-180">
            <div
              className="absolute inset-0 flex flex-col justify-end gap-2 rounded-2xl p-6 backface-hidden"
              style={{
                background: `linear-gradient(160deg, color-mix(in oklch, ${p.color} 45%, #0b0618), #0b0618 70%)`,
              }}
            >
              <span className="font-mono text-xs text-white/60" dir="ltr">
                {p.date.slice(0, 4)}
              </span>
              <h3 className="font-display text-2xl font-bold">{p.title}</h3>
              <p className="text-sm text-white/80">{p.summary}</p>
            </div>
            <div
              className="absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-2xl border p-6 backface-hidden"
              style={{ borderColor: p.color, background: "#0b0618" }}
            >
              <div>
                <p className="text-xs text-muted-foreground">{p.role}</p>
                <h3
                  className="mt-1 font-display text-lg"
                  style={{ color: p.color }}
                >
                  {p.title}
                </h3>
              </div>
              <Stack items={p.stack} />
              <Link
                href={href(data, p)}
                className="inline-flex min-h-11 items-center gap-2 font-medium"
                style={{ color: p.color }}
              >
                {dict.projects.readCase} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** 26: horizontal accordion — hover/focus expands a panel. */
export function ProjectAccordion({ data }: { data: LabData }) {
  const [open, setOpen] = useState(0)
  return (
    <ul className="flex h-[420px] flex-col gap-2 md:flex-row">
      {data.projects.map((p, i) => (
        <li
          key={p.slug}
          onMouseEnter={() => setOpen(i)}
          onFocus={() => setOpen(i)}
          className="relative min-h-16 overflow-hidden rounded-2xl transition-[flex-grow] duration-500"
          style={{
            flexGrow: open === i ? 5 : 1,
            flexBasis: 0,
            background: `linear-gradient(200deg, color-mix(in oklch, ${p.color} 50%, #0b0618), #07040f 75%)`,
          }}
        >
          <Link
            href={href(data, p)}
            className="absolute inset-0 flex flex-col justify-end p-5"
          >
            <span
              className={`font-display font-bold whitespace-nowrap transition-all duration-500 ${open === i ? "text-3xl" : "text-lg md:origin-bottom-left md:translate-x-6 md:-translate-y-4 md:-rotate-90 rtl:md:rotate-90"}`}
            >
              {p.title}
            </span>
            <span
              className={`mt-2 max-w-md text-sm text-white/80 transition-opacity duration-300 ${open === i ? "opacity-100" : "opacity-0"}`}
            >
              {p.summary}
            </span>
            <span
              className={`mt-4 transition-opacity duration-300 ${open === i ? "opacity-100" : "opacity-0"}`}
            >
              <Stack items={p.stack} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 27: list on one side, live preview on the other. */
export function SpotlightList({ data }: { data: LabData }) {
  const [active, setActive] = useState(0)
  const p = data.projects[active]
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <ol className="flex flex-col">
        {data.projects.map((proj, i) => (
          <li key={proj.slug}>
            <Link
              href={href(data, proj)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group flex items-baseline gap-4 border-b border-white/10 py-5"
            >
              <span
                className="font-mono text-sm text-muted-foreground"
                dir="ltr"
              >
                0{i + 1}
              </span>
              <span
                className="text-2xl font-semibold transition-all sm:text-3xl"
                style={{
                  color: active === i ? proj.color : undefined,
                  transform: active === i ? "translateX(8px)" : undefined,
                }}
              >
                {proj.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {p && (
        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/60 p-4"
          >
            <Thumb color={p.color} seed={active} />
            <p className="text-muted-foreground">{p.summary}</p>
            <Stack items={p.stack} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

/** 28: a deck of stacked cards that fans out on hover. */
export function StackedDeck({ data }: { data: LabData }) {
  const n = data.projects.length
  return (
    <div
      className="group relative mx-auto flex h-96 w-full max-w-3xl items-center justify-center"
      dir="ltr"
    >
      {data.projects.map((p, i) => {
        const off = i - (n - 1) / 2
        return (
          <Link
            key={p.slug}
            href={href(data, p)}
            className="absolute flex h-80 w-60 [transform:translateX(calc(var(--o)*12px))_rotate(calc(var(--o)*3deg))] flex-col justify-between rounded-2xl border border-white/15 p-5 shadow-2xl transition-all duration-500 group-hover:[transform:translateX(calc(var(--o)*200px))_rotate(calc(var(--o)*6deg))] hover:z-10 hover:-translate-y-6!"
            style={
              {
                "--o": off,
                background: `linear-gradient(170deg, color-mix(in oklch, ${p.color} 55%, #0b0618), #0b0618)`,
              } as React.CSSProperties
            }
          >
            <span className="font-mono text-xs text-white/70">
              {p.date.slice(0, 7)}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-white/80">
                {p.summary}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

/** 29: filter chips with animated re-layout. */
export function FilterGrid({ data }: { data: LabData }) {
  const tags = [
    "all",
    ...new Set(data.projects.flatMap((p) => [...p.tags, ...p.stack])),
  ].slice(0, 9)
  const [tag, setTag] = useState("all")
  const list = data.projects.filter(
    (p) => tag === "all" || p.tags.includes(tag) || p.stack.includes(tag)
  )
  return (
    <LayoutGroup>
      <div className="mb-5 flex flex-wrap gap-2" dir="ltr">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className="relative min-h-9 rounded-full px-4 text-sm"
          >
            {tag === t && (
              <motion.span
                layoutId="lab-filter"
                className="absolute inset-0 rounded-full bg-neon-pink"
              />
            )}
            <span
              className={`relative ${tag === t ? "text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </span>
          </button>
        ))}
      </div>
      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {list.map((p, i) => (
            <motion.li
              layout
              key={p.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl border border-white/10 bg-card/60 p-3"
            >
              <Link href={href(data, p)} className="flex flex-col gap-3">
                <Thumb color={p.color} seed={i + 3} />
                <h3 className="px-1 font-semibold">{p.title}</h3>
                <p className="px-1 pb-1 text-sm text-muted-foreground">
                  {p.summary}
                </p>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  )
}

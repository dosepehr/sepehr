"use client"

import { Check, Copy, Network } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import { CANDIDATES } from "./registry"
import type { LabCategory, LabData } from "./types"

const CATEGORIES: ("all" | LabCategory)[] = [
  "all",
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "blog",
  "contact",
]

/** Numbered showcase of every candidate section, with a picker to collect favourites. */
export default function LabGallery({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all")
  const [picked, setPicked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const list = useMemo(
    () =>
      CANDIDATES.map((c, i) => ({ ...c, n: i + 1 })).filter(
        (c) => cat === "all" || c.category === cat
      ),
    [cat]
  )
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const summary = CANDIDATES.map((c, i) => ({ ...c, n: i + 1 }))
    .filter((c) => picked.includes(c.id))
    .map((c) => `#${String(c.n).padStart(2, "0")} ${c.name}`)
    .join(", ")

  return (
    <div className="min-h-svh neon-grid">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href={`/${data.lang}`}
            className="font-display tracking-widest text-neon-pink uppercase text-glow"
          >
            {dict.site.name}
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            / lab · {CANDIDATES.length} candidates
          </span>
          <nav
            aria-label="Categories"
            className="order-last w-full overflow-x-auto md:order-none md:ms-auto md:w-auto"
          >
            <ul className="flex gap-1">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setCat(c)}
                    aria-pressed={cat === c}
                    className={`min-h-9 rounded-full px-3 text-sm capitalize transition-colors ${cat === c ? "bg-neon-cyan text-background" : "text-muted-foreground hover:bg-white/10 hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12"
      >
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-black tracking-wide text-neon-pink text-glow">
            Component lab
          </h1>
          <p className="mt-3 text-muted-foreground">
            Forty candidate sections for the 2D portfolio, all fed by the real
            content. Tick the ones you like; the tray at the bottom collects
            their numbers so you can paste your shortlist back.
          </p>
        </div>

        {list.map((c) => {
          const on = picked.includes(c.id)
          return (
            <section
              key={c.id}
              id={c.id}
              aria-labelledby={`${c.id}-title`}
              className="scroll-mt-24"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
                <span
                  className="font-display text-3xl font-black text-white/20"
                  dir="ltr"
                >
                  {String(c.n).padStart(2, "0")}
                </span>
                <div className="me-auto">
                  <h2
                    id={`${c.id}-title`}
                    className="flex items-center gap-2 font-semibold"
                  >
                    {c.name}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                      {c.category}
                    </span>
                    {c.flow && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neon-cyan/15 px-2 py-0.5 text-[10px] text-neon-cyan">
                        <Network className="size-3" /> React Flow
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">{c.note}</p>
                </div>
                <button
                  onClick={() => toggle(c.id)}
                  aria-pressed={on}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors ${on ? "bg-neon-pink text-background" : "border border-white/15 hover:bg-white/10"}`}
                >
                  <Check className="size-4" /> {on ? "Picked" : "Pick"}
                </button>
              </div>
              <c.Component data={data} />
            </section>
          )
        })}
      </main>

      {picked.length > 0 && (
        <div className="sticky bottom-4 z-40 mx-auto mb-4 flex w-[min(100%-2rem,48rem)] flex-wrap items-center gap-3 rounded-2xl border border-neon-pink/50 bg-background/90 p-3 shadow-[0_0_40px_color-mix(in_oklch,var(--neon-pink)_35%,transparent)] backdrop-blur">
          <p className="flex-1 text-sm">
            <span className="font-semibold text-neon-pink">
              {picked.length} picked:
            </span>{" "}
            <span className="text-muted-foreground" dir="ltr">
              {summary}
            </span>
          </p>
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(summary)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-neon-pink px-4 text-sm text-background"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}{" "}
            {copied ? "Copied" : "Copy list"}
          </button>
        </div>
      )}
    </div>
  )
}

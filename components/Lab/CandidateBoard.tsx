"use client"

import { Check, Copy, Network } from "lucide-react"
import { Fragment, useState, type ReactNode } from "react"
import { CANDIDATES } from "./registry"
import type { LabCategory, LabData } from "./types"

export const CATEGORY_ORDER: LabCategory[] = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "blog",
  "contact",
]

/** Section anchor per category; matches the ids the terminal and nav scroll to. */
export const CATEGORY_ANCHOR: Record<LabCategory, string> = {
  hero: "top",
  about: "about",
  skills: "skills",
  projects: "projects",
  experience: "experience",
  blog: "blog",
  contact: "contact",
}

const NUMBERED = CANDIDATES.map((c, i) => ({ ...c, n: i + 1 }))
const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Every candidate, grouped by category, each with a Pick toggle. A tray at the
 * bottom collects the picks so the shortlist can be copied and sent back.
 * `after` injects extra content at the end of a category (e.g. the real contact form).
 */
export default function CandidateBoard({
  data,
  only,
  titles,
  after,
}: {
  data: LabData
  /** Show a single category. */
  only?: LabCategory
  /** Category headings; omit to render without them. */
  titles?: Partial<Record<LabCategory, string>>
  after?: Partial<Record<LabCategory, ReactNode>>
}) {
  const [picked, setPicked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const summary = NUMBERED.filter((c) => picked.includes(c.id))
    .map((c) => `#${pad(c.n)} ${c.name}`)
    .join(", ")

  return (
    <>
      {CATEGORY_ORDER.filter((cat) => !only || cat === only).map((cat) => (
        <section
          key={cat}
          id={titles ? CATEGORY_ANCHOR[cat] : undefined}
          aria-label={titles?.[cat] ?? cat}
          className="flex scroll-mt-24 flex-col gap-16"
        >
          {titles?.[cat] && (
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">
                {titles[cat]}
              </h2>
              <span
                aria-hidden
                className="h-px flex-1 bg-linear-to-r from-white/25 to-transparent"
              />
            </div>
          )}
          {NUMBERED.filter((c) => c.category === cat).map((c) => {
            const on = picked.includes(c.id)
            return (
              <Fragment key={c.id}>
                <article
                  id={c.id}
                  aria-labelledby={`${c.id}-title`}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
                    <span
                      className="font-display text-3xl font-black text-white/25"
                      dir="ltr"
                    >
                      {pad(c.n)}
                    </span>
                    <div className="me-auto">
                      <h3
                        id={`${c.id}-title`}
                        className="flex flex-wrap items-center gap-2 font-semibold"
                      >
                        {c.name}
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                          {c.category}
                        </span>
                        {c.flow && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neon-cyan/15 px-2 py-0.5 text-[10px] text-neon-cyan">
                            <Network className="size-3" aria-hidden /> React
                            Flow
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{c.note}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors ${on ? "bg-neon-pink text-background" : "border border-white/15 hover:bg-white/10"}`}
                    >
                      <Check className="size-4" aria-hidden />{" "}
                      {on ? "Picked" : "Pick"}
                    </button>
                  </div>
                  <c.Component data={data} />
                </article>
              </Fragment>
            )
          })}
          {after?.[cat]}
        </section>
      ))}

      {picked.length > 0 && (
        <div className="sticky bottom-4 z-40 mx-auto flex w-full max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-neon-pink/50 bg-background/90 p-3 shadow-2xl backdrop-blur">
          <p className="flex-1 text-sm">
            <span className="font-semibold text-neon-pink">
              {picked.length} picked:
            </span>{" "}
            <span className="text-muted-foreground" dir="ltr">
              {summary}
            </span>
          </p>
          <button
            type="button"
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
    </>
  )
}

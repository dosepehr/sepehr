"use client"

import Link from "next/link"
import { useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import CandidateBoard, { CATEGORY_ORDER } from "./CandidateBoard"
import { CANDIDATES } from "./registry"
import type { LabCategory, LabData } from "./types"

/** Standalone gallery page for the candidates, with a category filter. */
export default function LabGallery({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const [cat, setCat] = useState<"all" | LabCategory>("all")
  return (
    <div className="min-h-svh neon-grid">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href={`/${data.lang}`}
            className="font-display tracking-widest text-neon-pink uppercase"
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
              {(["all", ...CATEGORY_ORDER] as const).map((c) => (
                <li key={c}>
                  <button
                    type="button"
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
          <h1 className="font-display text-4xl font-black tracking-wide text-neon-pink">
            Component lab
          </h1>
          <p className="mt-3 text-muted-foreground">
            Forty candidate sections for the 2D portfolio, all fed by the real
            content. Pick the ones you like; the tray at the bottom collects
            their numbers so you can paste your shortlist back.
          </p>
        </div>
        <CandidateBoard data={data} only={cat === "all" ? undefined : cat} />
      </main>
    </div>
  )
}

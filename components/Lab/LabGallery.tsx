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
      <header className="sticky top-0 z-40 border-b-[3px] border-[#1a1410] bg-[#1a1410]/85 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href={`/${data.lang}`}
            className="font-display text-sm tracking-widest text-white uppercase"
          >
            {dict.site.name}
          </Link>
          <span className="font-mono text-xs text-white/70">
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
                    className={`min-h-9 rounded-full px-3 text-sm capitalize transition-colors ${cat === c ? "bg-neon-cyan text-background" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
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
          <h1 className="font-display text-2xl text-outline sm:text-3xl">
            Component lab
          </h1>
          <p className="mt-4 font-medium text-white [text-shadow:1px_1px_0_#1a1410]">
            Every candidate section for the 2D portfolio (40 neon ones on dark
            islands, plus the platformer set), all fed by the real content. Pick
            the ones you like; the tray at the bottom collects their numbers so
            you can paste your shortlist back.
          </p>
        </div>
        <CandidateBoard data={data} only={cat === "all" ? undefined : cat} />
      </main>
    </div>
  )
}

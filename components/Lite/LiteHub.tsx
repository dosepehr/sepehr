"use client"

import { Cat, FlaskConical, Monitor } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import { useDictionary } from "@/components/DictionaryProvider"
import SoundToggle from "@/components/Hud/SoundToggle"
import CandidateBoard from "@/components/Lab/CandidateBoard"
import type { LabData } from "@/components/Lab/types"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { usePrefs } from "@/lib/store/prefs"

/** Tracks which section is in view, for the nav highlight. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

const NAV_IDS = [
  "top",
  "about",
  "skills",
  "projects",
  "games",
  "experience",
  "blog",
  "contact",
]

/** 2D neon hub: same content as the 3D room, no WebGL. Used on phones, Classic view and on WebGL failure. */
export default function LiteHub({
  data,
  canEnter3d,
  notice,
}: {
  data: ArcadeData
  canEnter3d: boolean
  notice?: string
}) {
  const { dict, lang } = useDictionary()
  const discover = useDiscover()
  const taps = useRef(0)
  const [booted, setBooted] = useState(false)
  const active = useActiveSection(NAV_IDS)
  const lab: LabData = {
    lang,
    profile: data.profile,
    projects: data.projects,
    posts: data.posts,
  }

  const nav = [
    { id: "top", label: dict.lab.hero },
    { id: "about", label: dict.lab.about },
    { id: "skills", label: dict.lab.skills },
    { id: "projects", label: dict.lab.projects },
    { id: "games", label: dict.nav.games },
    { id: "experience", label: dict.lab.experience },
    { id: "blog", label: dict.lab.blog },
    { id: "contact", label: dict.lab.contact },
  ]

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
          <a
            href="#main"
            className="font-display tracking-widest text-neon-pink uppercase text-glow"
          >
            {dict.site.name}
          </a>
          <nav
            aria-label="Sections"
            className="order-last w-full overflow-x-auto md:order-none md:mx-auto md:w-auto"
          >
            <ul className="flex gap-1 rounded-full p-1 text-sm md:bg-white/5">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "location" : undefined}
                    className={`inline-flex h-10 items-center rounded-full px-4 whitespace-nowrap transition-colors ${
                      active === item.id
                        ? "bg-neon-pink/15 text-neon-pink"
                        : "text-foreground/75 hover:text-neon-cyan"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-1 md:ms-0">
            <QuestTracker />
            <SoundToggle className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10" />
            <LocaleSwitch className="h-10 rounded-full" />
          </div>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-8"
      >
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-card/50 p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-foreground/85">
            {notice ?? dict.lab.intro}
          </p>
          {canEnter3d && (
            <button
              type="button"
              onClick={() => {
                sfx.coin()
                usePrefs.getState().setClassic(false)
                const url = new URL(window.location.href)
                url.searchParams.delete("view")
                window.history.replaceState(null, "", url)
                window.dispatchEvent(new Event("resize"))
              }}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 font-display text-sm tracking-wider text-neon-yellow uppercase neon-border hover:bg-neon-yellow/10"
            >
              <Monitor className="size-4" aria-hidden />
              {dict.hub.enter3d}
            </button>
          )}
        </div>

        <CandidateBoard
          data={lab}
          titles={{
            hero: dict.lab.hero,
            about: dict.lab.about,
            skills: dict.lab.skills,
            projects: dict.lab.projects,
            experience: dict.lab.experience,
            blog: dict.lab.blog,
            contact: dict.lab.contact,
          }}
          after={{
            projects: (
              <div id="games" className="scroll-mt-24">
                <h3 className="mb-6 font-display text-xl font-bold text-neon-cyan">
                  {dict.games.title}
                </h3>
                <GamesList include3d={false} />
                <button
                  type="button"
                  onClick={() => {
                    taps.current += 1
                    sfx.hit()
                    if (taps.current >= 5 && !booted) {
                      setBooted(true)
                      discover("out-of-order")
                    }
                  }}
                  className="mt-3 inline-flex min-h-11 items-center rounded-md border border-dashed border-destructive px-4 font-mono text-xs text-muted-foreground"
                >
                  {booted ? "▶ BOOTED" : dict.games.outOfOrder}
                </button>
              </div>
            ),
            contact: (
              <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
                {data.panels.contact}
              </div>
            ),
          }}
        />
      </main>

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-6">
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <Link
            href={`/${lang}/lab`}
            className="inline-flex min-h-11 items-center gap-2 hover:text-neon-cyan"
          >
            <FlaskConical className="size-4" aria-hidden />
            Component lab
          </Link>
          <button
            type="button"
            aria-label="Meow"
            onClick={() => discover("neon-cat")}
            className="size-11 opacity-30 hover:opacity-100 focus-visible:opacity-100"
          >
            <Cat className="mx-auto size-4 text-neon-pink" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

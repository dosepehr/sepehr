"use client"

import { Cat, FlaskConical, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import { useDictionary } from "@/components/DictionaryProvider"
import SoundToggle from "@/components/Hud/SoundToggle"
import type { LabData } from "@/components/Lab/types"
import { CoinIcon, Panel } from "@/components/Mario2D/parts"
import {
  AboutWorld,
  BlogWorld,
  ContactWorld,
  ExperienceWorld,
  MarioFooter,
  MarioHero,
  ProjectsWorld,
  SkillsWorld,
  World,
} from "@/components/Mario2D/sections"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import { marioSfx } from "@/lib/audio/mario"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useMario } from "@/lib/store/mario"
import { usePrefs } from "@/lib/store/prefs"

/** Tracks which section is in view, for the HUD's WORLD readout and the nav highlight. */
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

const SECTIONS = [
  "top",
  "about",
  "skills",
  "projects",
  "experience",
  "games",
  "blog",
  "contact",
]

/**
 * The 2D site, styled as a side-scrolling platformer: each section is a
 * "world", ? blocks navigate and pay out coins. Same content as the 3D world.
 */
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
  const hydrated = useHydrated()
  const taps = useRef(0)
  const [booted, setBooted] = useState(false)
  const active = useActiveSection(SECTIONS)
  const score = useMario((s) => s.score)
  const coins = useMario((s) => s.coins.length)
  const lab: LabData = {
    lang,
    profile: data.profile,
    projects: data.projects,
    posts: data.posts,
  }

  const nav = [
    { id: "about", label: dict.lab.about, world: "1-1" },
    { id: "skills", label: dict.lab.skills, world: "1-2" },
    { id: "projects", label: dict.lab.projects, world: "1-3" },
    { id: "experience", label: dict.lab.experience, world: "1-4" },
    { id: "games", label: dict.nav.games, world: "1-5" },
    { id: "blog", label: dict.lab.blog, world: "1-6" },
    { id: "contact", label: dict.lab.contact, world: "1-7" },
  ]
  const world = nav.find((n) => n.id === active)?.world ?? "1-1"
  // ? blocks pay out coins in 2D too (they share the 3D world's purse).
  const coin = () => useMario.getState().collectCoin(`lite-${Date.now()}`)

  return (
    <div className="min-h-svh neon-grid">
      <header className="sticky top-0 z-40 border-b-[3px] border-[#1a1410] bg-[#1a1410]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
          <dl
            className="grid grid-cols-3 gap-x-6 font-display text-[9px] leading-4 text-white sm:text-[10px]"
            dir="ltr"
          >
            <div>
              <dt>{dict.site.name.toUpperCase()}</dt>
              <dd>{String(hydrated ? score : 0).padStart(6, "0")}</dd>
            </div>
            <div>
              <dt>{dict.mario.coins}</dt>
              <dd className="flex items-center gap-1">
                <CoinIcon className="h-3 w-2.5" />×
                {String(hydrated ? coins : 0).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt>{dict.mario.world}</dt>
              <dd>{world}</dd>
            </div>
          </dl>
          <div className="ms-auto flex items-center gap-2">
            <QuestTracker className="h-10 bg-card text-foreground pixel-border-sm" />
            <SoundToggle className="inline-flex size-10 items-center justify-center rounded-md bg-card text-foreground pixel-border-sm" />
            <LocaleSwitch className="h-10 bg-card text-foreground pixel-border-sm" />
          </div>
          <nav aria-label="Worlds" className="w-full overflow-x-auto pb-1">
            <ul className="flex gap-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => marioSfx.select()}
                    aria-current={active === item.id ? "location" : undefined}
                    className={`inline-flex h-9 items-center gap-2 rounded-md px-3 font-display text-[9px] whitespace-nowrap pixel-border-sm transition-colors ${
                      active === item.id
                        ? "bg-[#f8b800] text-[#1a1410]"
                        : "bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="opacity-60" dir="ltr">
                      {item.world}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-8"
      >
        <MarioHero
          data={lab}
          onCoin={coin}
          extra={
            canEnter3d && !notice ? (
              <button
                type="button"
                onClick={() => {
                  marioSfx.powerUp()
                  usePrefs.getState().setClassic(false)
                  const url = new URL(window.location.href)
                  url.searchParams.delete("view")
                  window.history.replaceState(null, "", url)
                  window.dispatchEvent(new Event("resize"))
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#43b047] px-5 font-display text-[10px] text-white pixel-border-sm hover:brightness-110"
              >
                <Gamepad2 className="size-4" aria-hidden /> {dict.mario.enter3d}
              </button>
            ) : null
          }
        />
        {notice && <Panel className="text-sm">{notice}</Panel>}

        <World id="about" world="1-1" title={dict.lab.about}>
          <AboutWorld data={lab} />
        </World>
        <World id="skills" world="1-2" title={dict.lab.skills}>
          <SkillsWorld data={lab} />
        </World>
        <World id="projects" world="1-3" title={dict.lab.projects}>
          <ProjectsWorld data={lab} />
        </World>
        <World id="experience" world="1-4" title={dict.lab.experience}>
          <ExperienceWorld data={lab} />
        </World>
        <World id="games" world="1-5" title={dict.nav.games}>
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
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-card px-4 font-display text-[9px] text-destructive-text pixel-border-sm"
          >
            {booted ? "▶ BOOTED" : dict.games.outOfOrder}
          </button>
        </World>
        <World id="blog" world="1-6" title={dict.lab.blog}>
          <BlogWorld data={lab} />
        </World>
        <World id="contact" world="1-7" title={dict.lab.contact}>
          <ContactWorld data={lab} form={data.panels.contact} />
        </World>
      </main>

      <MarioFooter>
        <div className="flex items-center gap-3">
          <Link
            href={`/${lang}/lab`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-3 font-display text-[9px] text-foreground pixel-border-sm"
          >
            <FlaskConical className="size-4" aria-hidden />
            {dict.mario.lab}
          </Link>
          <button
            type="button"
            aria-label="Meow"
            onClick={() => discover("neon-cat")}
            className="size-11 opacity-40 hover:opacity-100 focus-visible:opacity-100"
          >
            <Cat className="mx-auto size-4 text-white" aria-hidden />
          </button>
        </div>
      </MarioFooter>
    </div>
  )
}

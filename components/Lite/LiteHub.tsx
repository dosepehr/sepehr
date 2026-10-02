"use client"

import { Cat, FlaskConical, Monitor } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import { useDictionary } from "@/components/DictionaryProvider"
import SoundToggle from "@/components/Hud/SoundToggle"
import { BentoAbout, StatsCounter } from "@/components/Lab/about"
import {
  BlogMagazine,
  MagneticCta,
  SkylineFooter,
} from "@/components/Lab/contact"
import { GlowTimeline } from "@/components/Lab/experience"
import { SunsetHero } from "@/components/Lab/heroes"
import { CabinetCards } from "@/components/Lab/projects"
import { SkillRings } from "@/components/Lab/skills"
import type { LabData } from "@/components/Lab/types"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { usePrefs } from "@/lib/store/prefs"

function Section({
  id,
  index,
  title,
  color,
  children,
}: {
  id: string
  index: number
  title: string
  color: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-8 flex items-center gap-4">
        <span className="font-mono text-sm" style={{ color }} dir="ltr">
          {String(index).padStart(2, "0")}
        </span>
        <h2
          id={`${id}-title`}
          className="font-display text-2xl font-bold tracking-wide sm:text-3xl"
        >
          {title}
        </h2>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${color}, transparent)`,
          }}
        />
      </div>
      {children}
    </section>
  )
}

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

const NAV_IDS = ["projects", "games", "about", "blog", "contact"]

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
    { id: "projects", label: dict.nav.projects },
    { id: "games", label: dict.nav.games },
    { id: "about", label: dict.nav.about },
    { id: "blog", label: dict.nav.blog },
    { id: "contact", label: dict.nav.contact },
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
        <SunsetHero
          data={lab}
          extra={
            <>
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
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-display text-sm tracking-wider text-neon-yellow uppercase neon-border hover:bg-neon-yellow/10"
                >
                  <Monitor className="size-4" aria-hidden />
                  {dict.hub.enter3d}
                </button>
              )}
              <p className="rounded-full bg-black/45 px-3 py-1 text-sm text-foreground/80 backdrop-blur-sm">
                {notice ?? dict.hub.liteNote}
              </p>
            </>
          }
        />

        <StatsCounter data={lab} />

        <Section
          id="projects"
          index={1}
          title={dict.projects.title}
          color="var(--neon-pink)"
        >
          <CabinetCards data={lab} />
        </Section>

        <Section
          id="games"
          index={2}
          title={dict.games.title}
          color="var(--neon-cyan)"
        >
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
        </Section>

        <Section
          id="about"
          index={3}
          title={dict.about.title}
          color="var(--neon-purple)"
        >
          <div className="flex flex-col gap-14">
            <BentoAbout data={lab} />
            <div>
              <h3 className="mb-5 font-display text-lg text-neon-cyan">
                {dict.about.skills}
              </h3>
              <SkillRings data={lab} />
            </div>
            <div>
              <h3 className="mb-6 font-display text-lg text-neon-cyan">
                {dict.about.experience}
              </h3>
              <GlowTimeline data={lab} />
            </div>
          </div>
        </Section>

        <Section
          id="blog"
          index={4}
          title={dict.blog.title}
          color="var(--neon-cyan)"
        >
          <BlogMagazine data={lab} />
        </Section>

        <Section
          id="contact"
          index={5}
          title={dict.contact.title}
          color="var(--neon-pink)"
        >
          <div className="flex flex-col gap-10">
            <MagneticCta data={lab} />
            <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
              {data.panels.contact}
            </div>
          </div>
        </Section>
      </main>

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-6">
        <SkylineFooter data={lab} />
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

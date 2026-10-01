"use client"

import { Cat, Monitor } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import { useDictionary } from "@/components/DictionaryProvider"
import SoundToggle from "@/components/Hud/SoundToggle"
import QuestTracker from "@/components/Quests/QuestTracker"
import LocaleSwitch from "@/components/Site/LocaleSwitch"
import ThemeToggle from "@/components/Site/ThemeToggle"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { usePrefs } from "@/lib/store/prefs"
import { toneVar, type Tone } from "@/lib/tone"

function Section({
  id,
  title,
  tone,
  children,
}: {
  id: string
  title: string
  tone: Tone
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <h2
        id={`${id}-title`}
        className="mb-4 flex items-center gap-3 text-xl font-semibold"
      >
        <span
          aria-hidden
          className="h-6 w-1.5 rounded-full"
          style={{ backgroundColor: toneVar(tone) }}
        />
        {title}
      </h2>
      {children}
    </section>
  )
}

/** 2D hub: same content as the 3D room, no WebGL. Used on phones, Classic view and on WebGL failure. */
export default function LiteHub({
  data,
  canEnter3d,
  notice,
}: {
  data: ArcadeData
  canEnter3d: boolean
  notice?: string
}) {
  const { dict } = useDictionary()
  const discover = useDiscover()
  const taps = useRef(0)
  const [booted, setBooted] = useState(false)

  const nav = [
    { id: "projects", label: dict.nav.projects },
    { id: "games", label: dict.nav.games },
    { id: "blog", label: dict.nav.blog },
    { id: "about", label: dict.nav.about },
    { id: "contact", label: dict.nav.contact },
  ]

  return (
    <div className="paper min-h-svh">
      <header className="sticky top-0 z-40 flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-2">
        <span className="text-lg font-semibold">
          {dict.site.name}
        </span>
        <div className="ms-auto flex items-center gap-2">
          <QuestTracker />
          <SoundToggle className="inline-flex size-11 items-center justify-center rounded-md hover:bg-muted" />
          <ThemeToggle />
          <LocaleSwitch className="h-11" />
        </div>
        <nav aria-label="Sections" className="w-full overflow-x-auto">
          <ul className="flex gap-1 text-sm">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex h-11 items-center rounded-md px-3 font-medium hover:bg-muted"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main
        id="main"
        className="mx-auto flex max-w-4xl flex-col gap-14 px-4 py-10"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold sm:text-5xl">
            {dict.site.name}
          </h1>
          <p className="text-lg font-medium text-primary-text">{dict.site.role}</p>
          <p className="max-w-xl text-foreground">{dict.site.tagline}</p>
          <p className="text-sm text-muted-foreground">
            {notice ?? dict.hub.liteNote}
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
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Monitor className="size-4" aria-hidden />
              {dict.hub.enter3d}
            </button>
          )}
        </div>

        <Section id="projects" title={dict.projects.title} tone="coral">
          {data.panels.projects}
        </Section>

        <Section id="games" title={dict.games.title} tone="teal">
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

        <Section id="blog" title={dict.blog.title} tone="teal">
          {data.panels.blog}
        </Section>

        <Section id="about" title={dict.about.title} tone="indigo">
          {data.panels.about}
        </Section>

        <Section id="contact" title={dict.contact.title} tone="amber">
          {data.panels.contact}
        </Section>
      </main>

      <footer className="flex items-center justify-between border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <p>{dict.footer.built}</p>
        <button
          type="button"
          aria-label="Meow"
          onClick={() => discover("neon-cat")}
          className="size-11 opacity-30 hover:opacity-100 focus-visible:opacity-100"
        >
          <Cat className="mx-auto size-4 text-muted-foreground" aria-hidden />
        </button>
      </footer>
    </div>
  )
}

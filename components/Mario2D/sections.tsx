"use client"

import { ArrowRight, Download, Flag } from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { LabData } from "@/components/Lab/types"
import { CountUp, useInView, yearsOfExperience } from "@/components/Lab/shared"
import { marioSfx } from "@/lib/audio/mario"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { useScores } from "@/lib/store/scores"
import {
  Bush,
  Cloud,
  CoinIcon,
  Flower,
  Ground,
  HeroSprite,
  Hill,
  Mushroom,
  Panel,
  Pipe,
  QBlock,
  Star,
} from "./parts"

/** "WORLD 1-3 · PROJECTS" banner on a strip of bricks. */
export function WorldHeading({
  world,
  title,
  id,
}: {
  world: string
  title: string
  id: string
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h2
        id={`${id}-title`}
        className="inline-flex flex-wrap items-baseline gap-x-3 rounded-md bricks px-4 py-3 pixel-border"
      >
        <span
          className="font-display text-[10px] text-[#ffe08a] sm:text-xs"
          dir="ltr"
        >
          WORLD {world}
        </span>
        <span className="font-display text-base text-outline sm:text-xl">
          {title}
        </span>
      </h2>
    </div>
  )
}

export function World({
  id,
  world,
  title,
  children,
}: {
  id: string
  world: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <WorldHeading world={world} title={title} id={id} />
      {children}
    </section>
  )
}

/** Title screen: clouds, hills, a row of ? blocks and the ground. */
export function MarioHero({
  data,
  onCoin,
  extra,
}: {
  data: LabData
  onCoin?: () => void
  extra?: ReactNode
}) {
  const { dict } = useDictionary()
  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  const blocks = [
    { id: "about", label: dict.lab.about },
    { id: "projects", label: dict.lab.projects },
    { id: "experience", label: dict.lab.experience },
    { id: "contact", label: dict.lab.contact },
  ]
  return (
    <div
      id="top"
      className="relative isolate overflow-hidden rounded-xl border-[3px] border-[#1a1410] bg-[linear-gradient(#3c6fe0,#5c94fc_55%)] shadow-[6px_6px_0_#1a1410]"
    >
      <Cloud
        className="top-6 animate-cloud"
        style={{ "--cloud-duration": "70s" } as React.CSSProperties}
      />
      <Cloud
        className="top-24 animate-cloud opacity-90"
        style={
          {
            "--cloud-duration": "95s",
            "--cloud-delay": "-40s",
          } as React.CSSProperties
        }
      />
      <Cloud
        className="top-12 animate-cloud"
        style={
          {
            "--cloud-duration": "80s",
            "--cloud-delay": "-65s",
          } as React.CSSProperties
        }
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 pt-14 pb-10 text-center">
        <p
          className="font-display text-[10px] text-outline sm:text-xs"
          dir="ltr"
        >
          {data.profile.location.toUpperCase()} · PLAYER 1
        </p>
        <h1 className="font-display text-4xl leading-tight text-outline sm:text-6xl">
          {data.profile.name.toUpperCase()}
        </h1>
        <p className="rounded-md bg-card px-4 py-2 font-display text-[10px] leading-5 text-foreground pixel-border-sm sm:text-xs">
          {data.profile.role}
        </p>
        <p className="max-w-lg text-lg font-medium text-white [text-shadow:2px_2px_0_#1a1410]">
          {dict.site.tagline}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
          {blocks.map((b) => (
            <QBlock
              key={b.id}
              label={b.label}
              onHit={() => {
                onCoin?.()
                setTimeout(() => jump(b.id), 300)
              }}
            >
              <span className="font-display text-[9px] text-outline sm:text-[10px]">
                {b.label}
              </span>
            </QBlock>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`/resume/${data.lang}.pdf`}
            download
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 font-display text-[10px] text-primary-foreground pixel-border-sm hover:brightness-110"
          >
            <Download className="size-4" aria-hidden /> {dict.nav.resume}
          </a>
          {extra}
        </div>
      </div>
      <div className="relative h-36">
        <Hill className="left-[6%]" size={260} />
        <Hill className="right-[10%]" size={180} />
        <Bush className="left-[38%]" />
        <Bush className="right-[34%] scale-75" />
        <div className="absolute bottom-0 left-[18%] z-10 animate-bounce [animation-duration:2.4s]">
          <HeroSprite px={5} />
        </div>
        <div className="absolute right-[22%] bottom-0 z-10 w-24">
          <Pipe height={44} />
        </div>
      </div>
      <Ground height={40} />
    </div>
  )
}

/** 1-1: speech box bio and stats as power-up tiles. */
export function AboutWorld({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const stats = [
    {
      icon: <Mushroom />,
      value: yearsOfExperience(data.profile.experience.map((e) => e.period)),
      suffix: "+",
      label: dict.about.experience,
    },
    {
      icon: <Star />,
      value: data.projects.length,
      suffix: "",
      label: dict.nav.projects,
    },
    {
      icon: <Flower />,
      value: data.profile.skills.length,
      suffix: "",
      label: dict.about.skills,
    },
    {
      icon: <Mushroom green />,
      value: data.posts.length,
      suffix: "",
      label: dict.nav.blog,
    },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel className="relative">
        <span className="absolute start-5 -top-4 rounded-md bg-primary px-3 py-1 font-display text-[10px] text-primary-foreground pixel-border-sm">
          {data.profile.name}
        </span>
        <div className="mt-2 flex gap-5">
          <HeroSprite px={4} className="hidden shrink-0 sm:block" />
          <div className="flex flex-col gap-3 leading-7">
            {data.profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Panel>
      <ul className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <li
            key={s.label}
            className="flex flex-col items-center gap-2 rounded-md bg-card p-4 text-center pixel-border-sm"
          >
            {s.icon}
            <span className="font-display text-2xl" dir="ltr">
              <CountUp to={s.value} />
              {s.suffix}
            </span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 1-2: each skill is a row of bricks; the filled ones are the level. */
export function SkillsWorld({ data }: { data: LabData }) {
  const hydrated = useHydrated()
  const caught = useScores((s) => s.unlockedSkills)
  const [ref, seen] = useInView<HTMLUListElement>()
  return (
    <Panel>
      <ul ref={ref} className="grid gap-x-10 gap-y-4 md:grid-cols-2" dir="ltr">
        {data.profile.skills.map((s) => {
          const bricks = Math.round(s.level / 10)
          return (
            <li key={s.name} className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between gap-3">
                <span className="font-display text-[10px] sm:text-xs">
                  {s.name}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  {hydrated && caught.includes(s.name) && (
                    <span title="Caught in Tech Catcher">★</span>
                  )}
                  {s.level}
                </span>
              </span>
              <span className="flex gap-1" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    onMouseEnter={(e) => {
                      if (i >= bricks) return
                      e.currentTarget.classList.remove("animate-bump")
                      void e.currentTarget.offsetWidth
                      e.currentTarget.classList.add("animate-bump")
                    }}
                    className={`h-5 flex-1 rounded-[2px] border-2 border-[#1a1410] transition-opacity duration-300 ${i < bricks ? "bricks" : "bg-white/50"}`}
                    style={{
                      backgroundSize: "16px 8px, 16px 16px, 16px 16px",
                      opacity: seen || i >= bricks ? 1 : 0.2,
                      transitionDelay: `${i * 40}ms`,
                    }}
                  />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/** 1-3: projects rise out of warp pipes. */
export function ProjectsWorld({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {data.projects.map((p) => (
        <li key={p.slug} className="group flex flex-col">
          <Link
            href={`/${data.lang}/projects/${p.slug}`}
            onMouseEnter={() => marioSfx.pipe()}
            className="relative z-10 flex flex-1 flex-col gap-3 rounded-md bg-card p-5 pixel-border transition-transform duration-300 group-hover:-translate-y-2 focus-visible:-translate-y-2"
          >
            <span
              className="h-2 w-12 rounded-full border-2 border-[#1a1410]"
              style={{ background: p.color }}
            />
            <h3 className="font-display text-sm leading-6">{p.title}</h3>
            <p className="flex-1 text-sm text-card-foreground/85">
              {p.summary}
            </p>
            <ul className="flex flex-wrap gap-1.5" dir="ltr">
              {p.stack.map((t) => (
                <li
                  key={t}
                  className="rounded-[3px] border-2 border-[#1a1410] bg-[#ffe08a] px-1.5 py-0.5 font-mono text-[11px]"
                >
                  {t}
                </li>
              ))}
            </ul>
            <span className="inline-flex items-center gap-2 font-display text-[10px] text-primary-text">
              {dict.projects.readCase}{" "}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </span>
          </Link>
          <Pipe height={36} className="-mt-2 px-6" color={p.color} />
        </li>
      ))}
    </ul>
  )
}

/** 1-4: career as a level, flag by flag, ending at a castle. */
export function ExperienceWorld({ data }: { data: LabData }) {
  const jobs = [...data.profile.experience].reverse()
  return (
    <div className="overflow-hidden rounded-xl border-[3px] border-[#1a1410] bg-[linear-gradient(#5c94fc,#8fc0ff)] shadow-[6px_6px_0_#1a1410]">
      <ol
        className="relative grid gap-6 px-5 pt-8 pb-6 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
        style={{ "--n": jobs.length + 1 } as React.CSSProperties}
      >
        {jobs.map((j, i) => (
          <li key={j.company + j.period} className="flex items-end gap-3">
            <div className="flex flex-col items-center" aria-hidden>
              <span className="h-5 w-7 bg-[#43b047] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
              <span className="h-28 w-1.5 bg-[#1e7a2e]" />
            </div>
            <Panel className="flex-1 p-4 sm:p-4">
              <p
                className="font-display text-[9px] text-primary-text"
                dir="ltr"
              >
                1-{i + 1} · {j.period}
              </p>
              <h3 className="mt-2 font-semibold">{j.role}</h3>
              <p className="text-sm text-accent-foreground">{j.company}</p>
              <p className="mt-2 text-sm text-card-foreground/85">
                {j.summary}
              </p>
            </Panel>
          </li>
        ))}
        <li className="flex items-end justify-center gap-3">
          <div className="flex flex-col items-center" aria-hidden>
            <Flag className="size-7 fill-white text-[#1a1410]" />
            <span className="h-28 w-1.5 bg-[#43b047]" />
          </div>
          <Castle />
        </li>
      </ol>
      <Ground height={36} />
    </div>
  )
}

function Castle({ small }: { small?: boolean }) {
  return (
    <div
      aria-hidden
      className={`flex flex-col items-center ${small ? "scale-75" : ""}`}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-4 border-2 border-b-0 border-[#1a1410] bricks"
          />
        ))}
      </div>
      <div className="h-8 w-16 border-2 border-[#1a1410] bricks" />
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-3 w-4 border-2 border-b-0 border-[#1a1410] bricks"
          />
        ))}
      </div>
      <div className="relative h-14 w-28 border-2 border-[#1a1410] bricks">
        <span className="absolute bottom-0 left-1/2 h-9 w-7 -translate-x-1/2 rounded-t-full bg-[#1a1410]" />
      </div>
    </div>
  )
}

/** 1-6: posts as message blocks. */
export function BlogWorld({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const fmt = new Intl.DateTimeFormat(data.lang === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium",
  })
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {data.posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/${data.lang}/blog/${p.slug}`}
            className="group flex h-full gap-4 rounded-md bg-card p-5 pixel-border transition-transform hover:-translate-y-1"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-[3px] bg-[#f8b800] font-display text-xl text-white pixel-border-sm [text-shadow:2px_2px_0_#c84c0c] group-hover:animate-bump">
              !
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                <time dateTime={p.date}>{fmt.format(new Date(p.date))}</time> ·{" "}
                {p.minutes} {dict.blog.minutes}
              </span>
              <span className="font-semibold">{p.title}</span>
              <span className="text-sm text-card-foreground/85">
                {p.summary}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 1-7: the castle, where messages are delivered. */
export function ContactWorld({
  data,
  form,
}: {
  data: LabData
  form: ReactNode
}) {
  const { dict } = useDictionary()
  const [raised, setRaised] = useState(false)
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <Panel>{form}</Panel>
      <div className="flex flex-col items-center justify-end gap-4 rounded-xl border-[3px] border-[#1a1410] bg-[linear-gradient(#5c94fc,#8fc0ff)] pt-6 shadow-[6px_6px_0_#1a1410]">
        <button
          type="button"
          onClick={() => {
            setRaised((r) => !r)
            marioSfx.flagpole()
            if (!raised) setTimeout(() => marioSfx.fanfare(), 1000)
          }}
          className="flex items-end gap-4 px-4"
          aria-label={dict.mario.courseClear}
        >
          <span className="relative h-44 w-2 bg-[#43b047]" aria-hidden>
            <span className="absolute -top-3 -left-1.5 size-5 rounded-full border-2 border-[#1a1410] bg-[#43b047]" />
            <span
              className="absolute right-2 h-6 w-9 bg-white transition-all duration-1000 [clip-path:polygon(100%_0,0_50%,100%_100%)]"
              style={{ top: raised ? 140 : 8 }}
            />
          </span>
          <Castle small />
        </button>
        <p className="px-3 text-center font-display text-[9px] leading-4 text-outline">
          {raised ? dict.mario.courseClear : dict.mario.flagHint}
        </p>
        <a
          href={`mailto:${data.profile.links.email}`}
          className="mb-1 inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-4 font-display text-[9px] pixel-border-sm"
          dir="ltr"
        >
          <CoinIcon /> {data.profile.links.email}
        </a>
        <Ground height={28} />
      </div>
    </div>
  )
}

export function MarioFooter({ children }: { children?: ReactNode }) {
  const { dict } = useDictionary()
  return (
    <footer className="relative mt-24">
      <div className="relative h-24">
        <Hill className="left-[4%]" size={200} />
        <Bush className="left-[40%]" />
        <Hill className="right-[8%]" size={140} />
      </div>
      <div className="border-t-[3px] border-[#1a1410] ground px-4 pt-6 pb-8 grass-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-white">
          <p className="font-display text-[10px] leading-5 [text-shadow:2px_2px_0_#1a1410]">
            {dict.mario.thanks}
          </p>
          {children}
        </div>
      </div>
    </footer>
  )
}

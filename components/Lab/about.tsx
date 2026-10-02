"use client"

import {
  BookOpen,
  Briefcase,
  CodeXml,
  Coffee,
  Gamepad2,
  Hammer,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { LabData } from "./types"
import { CountUp, NEON, useInView, yearsOfExperience } from "./shared"

/** 09: big animated numbers. */
export function StatsCounter({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const stats = [
    {
      value: yearsOfExperience(data.profile.experience.map((e) => e.period)),
      label: dict.about.experience,
      suffix: "+",
    },
    { value: data.projects.length, label: dict.nav.projects, suffix: "" },
    { value: data.profile.skills.length, label: dict.about.skills, suffix: "" },
    { value: data.posts.length, label: dict.nav.blog, suffix: "" },
  ]
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-card/40 md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="flex flex-col gap-1 border-white/10 p-6 not-last:border-e max-md:nth-[-n+2]:border-b max-md:nth-[2]:border-e-0"
        >
          <dd
            className="font-display text-5xl font-black text-glow"
            style={{ color: NEON[i] }}
            dir="ltr"
          >
            <CountUp to={s.value} />
            {s.suffix}
          </dd>
          <dt className="text-sm text-muted-foreground">{s.label}</dt>
        </div>
      ))}
    </dl>
  )
}

/** 10: bento grid about section. */
export function BentoAbout({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const p = data.profile
  const tile =
    "rounded-2xl border border-white/10 bg-card/60 p-5 transition-colors hover:border-white/25"
  return (
    <div className="grid auto-rows-[minmax(8rem,auto)] gap-3 md:grid-cols-4">
      <div
        className={`${tile} flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--neon-purple)_35%,transparent),transparent_60%)] md:col-span-2 md:row-span-2`}
      >
        <Sparkles className="size-6 text-neon-yellow" aria-hidden />
        <div>
          <h3 className="font-display text-2xl font-bold">{p.name}</h3>
          <p className="mt-2 leading-7 text-foreground/85">{p.bio.join(" ")}</p>
        </div>
      </div>
      <div className={`${tile} flex flex-col justify-between`}>
        <MapPin className="size-5 text-neon-pink" aria-hidden />
        <p className="text-lg font-semibold">{p.location}</p>
      </div>
      <div className={`${tile} flex flex-col justify-between`}>
        <Briefcase className="size-5 text-neon-cyan" aria-hidden />
        <p>
          <span className="block text-lg font-semibold">
            {p.experience[0]?.role}
          </span>
          <span className="text-sm text-muted-foreground">
            {p.experience[0]?.company}
          </span>
        </p>
      </div>
      <a
        href={p.links.github}
        target="_blank"
        rel="noreferrer"
        className={`${tile} group flex items-center gap-3`}
      >
        <CodeXml
          className="size-6 transition-transform group-hover:rotate-12"
          aria-hidden
        />
        <span className="font-semibold">GitHub</span>
      </a>
      <a
        href={`mailto:${p.links.email}`}
        className={`${tile} group flex items-center gap-3 bg-neon-pink/10`}
      >
        <Mail
          className="size-6 text-neon-pink transition-transform group-hover:-rotate-12"
          aria-hidden
        />
        <span className="font-semibold">{dict.contact.title}</span>
      </a>
      <div className={`${tile} md:col-span-4`}>
        <p className="mb-3 text-sm text-muted-foreground">
          {dict.about.skills}
        </p>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {p.skills.map((s, i) => (
            <span
              key={s.name}
              className="rounded-full border px-3 py-1 text-sm"
              style={{
                borderColor: NEON[i % NEON.length],
                color: NEON[i % NEON.length],
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 11: RPG character sheet. */
export function CharacterSheet({ data }: { data: LabData }) {
  const avg = (g: "frontend" | "backend" | "tools") => {
    const list = data.profile.skills.filter((s) => s.group === g)
    return list.length
      ? Math.round(list.reduce((a, s) => a + s.level, 0) / list.length)
      : 0
  }
  const attrs = [
    { k: "UI/UX", v: avg("frontend"), c: "var(--neon-pink)" },
    { k: "API", v: avg("backend"), c: "var(--neon-cyan)" },
    { k: "OPS", v: avg("tools"), c: "var(--neon-yellow)" },
    { k: "CRAFT", v: 94, c: "var(--neon-purple)" },
  ]
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="grid gap-6 rounded-2xl border-2 border-neon-cyan/50 bg-[#05020c] p-6 font-mono md:grid-cols-[14rem_1fr]"
    >
      <div className="grid aspect-square place-items-center rounded-xl border border-white/10 bg-[conic-gradient(from_180deg,var(--neon-pink),var(--neon-purple),var(--neon-cyan),var(--neon-pink))] p-1">
        <div className="grid size-full place-items-center rounded-lg bg-[#05020c] font-display text-7xl text-white">
          {data.profile.name.slice(0, 1)}
        </div>
      </div>
      <div className="flex flex-col gap-3" dir="ltr">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl text-neon-cyan">
            {data.profile.name}
          </h3>
          <span className="text-sm text-neon-yellow">
            LV. {data.profile.experience.length * 10 + 7}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          CLASS: {data.profile.role}
        </p>
        {attrs.map((a) => (
          <div
            key={a.k}
            className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-3 text-sm"
          >
            <span style={{ color: a.c }}>{a.k}</span>
            <span className="flex h-3 gap-0.5">
              {Array.from({ length: 20 }, (_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-[1px] transition-opacity duration-300"
                  style={{
                    background: a.c,
                    opacity: seen && i < Math.round(a.v / 5) ? 1 : 0.12,
                    transitionDelay: `${i * 30}ms`,
                  }}
                />
              ))}
            </span>
            <span className="text-end text-muted-foreground">{a.v}</span>
          </div>
        ))}
        <p className="mt-2 text-xs text-muted-foreground">
          PERKS: dark-mode native · ships on fridays (carefully) · speaks RTL
        </p>
      </div>
    </div>
  )
}

/** 12: "now" status board. */
export function NowBoard({ data }: { data: LabData }) {
  const items = [
    {
      Icon: Hammer,
      label: "Building",
      text: data.projects[0]?.title ?? "something new",
      c: "var(--neon-pink)",
    },
    {
      Icon: BookOpen,
      label: "Writing",
      text: data.posts[0]?.title ?? "notes",
      c: "var(--neon-cyan)",
    },
    {
      Icon: Gamepad2,
      label: "Playing",
      text: "Neon Drive, high score pending",
      c: "var(--neon-yellow)",
    },
    {
      Icon: Coffee,
      label: "Fuel",
      text: "Too much coffee",
      c: "var(--neon-purple)",
    },
  ]
  return (
    <div className="rounded-2xl border border-white/10 bg-card/50 p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-success" />
        </span>
        <h3 className="font-display text-sm tracking-widest uppercase">Now</h3>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ Icon, label, text, c }) => (
          <li
            key={label}
            className="flex items-start gap-3 rounded-xl bg-white/5 p-4"
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg"
              style={{
                background: `color-mix(in oklch, ${c} 20%, transparent)`,
                color: c,
              }}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground uppercase">
                {label}
              </span>
              <span className="font-medium">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 13: manifesto in huge shimmering type. */
export function Manifesto({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  return (
    <figure className="relative overflow-hidden rounded-2xl px-6 py-16 text-center">
      <span
        aria-hidden
        className="absolute start-6 top-0 font-display text-[10rem] leading-none text-neon-pink/15"
      >
        “
      </span>
      <blockquote className="relative mx-auto max-w-3xl text-3xl leading-snug font-semibold sm:text-5xl">
        <span className="text-shine">{dict.site.tagline}</span>
      </blockquote>
      <figcaption className="mt-6 font-mono text-sm text-muted-foreground">
        — {data.profile.name}, {data.profile.role}
      </figcaption>
    </figure>
  )
}

/** 14: pixel-art style "about" dialog box like an old RPG. */
export function RpgDialog({ data }: { data: LabData }) {
  const lines = data.profile.bio
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative rounded-none border-4 border-white bg-[#1a1aa6] p-6 font-mono text-white shadow-[8px_8px_0_#000] [image-rendering:pixelated]">
        <span className="absolute start-4 -top-4 border-4 border-white bg-[#1a1aa6] px-3 text-sm font-bold">
          {data.profile.name.toUpperCase()}
        </span>
        {lines.map((l) => (
          <p key={l} className="mt-2 leading-7">
            {l}
          </p>
        ))}
        <span className="absolute end-4 bottom-2 animate-bounce text-lg">
          ▼
        </span>
      </div>
    </div>
  )
}

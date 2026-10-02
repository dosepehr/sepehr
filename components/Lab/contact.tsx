"use client"

import {
  ArrowUpRight,
  Briefcase,
  CodeXml,
  Download,
  Mail,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useRef, useState, type PointerEvent } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { LabData } from "./types"
import { NEON } from "./shared"

function useDate(lang: string) {
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium",
  })
}

/** 35: magazine layout, one featured post plus a list. */
export function BlogMagazine({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const fmt = useDate(data.lang)
  const [first, ...rest] = data.posts
  if (!first) return null
  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <Link
        href={`/${data.lang}/blog/${first.slug}`}
        className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-2xl p-6"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--neon-purple),var(--neon-pink)_60%,var(--neon-orange))] opacity-80 transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <div className="relative">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs">
            {first.tags[0] ?? dict.blog.title}
          </span>
          <h3 className="mt-3 text-3xl font-bold">{first.title}</h3>
          <p className="mt-2 text-white/80">{first.summary}</p>
          <p className="mt-3 text-xs text-white/70">
            {fmt.format(new Date(first.date))} · {first.minutes}{" "}
            {dict.blog.minutes}
          </p>
        </div>
      </Link>
      <ul className="flex flex-col divide-y divide-white/10">
        {(rest.length ? rest : data.posts).map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/${data.lang}/blog/${p.slug}`}
              className="group flex gap-4 py-4"
            >
              <span
                className="font-display text-3xl font-black"
                style={{ color: NEON[i % NEON.length] }}
              >
                0{i + 2}
              </span>
              <span>
                <span className="block font-semibold group-hover:underline">
                  {p.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {p.minutes} {dict.blog.minutes}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 36: posts as an `ls -la` listing. */
export function BlogLs({ data }: { data: LabData }) {
  return (
    <div
      className="overflow-x-auto rounded-2xl border border-white/10 bg-[#07040f] p-5 font-mono text-sm"
      dir="ltr"
    >
      <p className="text-muted-foreground">$ ls -la ~/blog</p>
      <ul className="mt-2">
        {data.posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/${data.lang}/blog/${p.slug}`}
              className="grid grid-cols-[6rem_3rem_7rem_1fr] gap-3 py-1 whitespace-nowrap hover:bg-white/5"
            >
              <span className="text-muted-foreground">-rw-r--r--</span>
              <span className="text-neon-yellow">{p.minutes}m</span>
              <span className="text-neon-purple">{p.date}</span>
              <span className="text-neon-cyan underline-offset-4 hover:underline">
                {p.slug}.mdx
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 37: big CTA with a magnetic button. */
export function MagneticCta({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const btn = useRef<HTMLAnchorElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = btn.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`
  }
  return (
    <div
      onPointerMove={move}
      onPointerLeave={() => btn.current && (btn.current.style.transform = "")}
      className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--neon-pink)_45%,transparent),transparent_70%),#0b0618] px-6 py-20 text-center"
    >
      <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
        {dict.contact.intro}
      </h2>
      <a
        ref={btn}
        href={`mailto:${data.profile.links.email}`}
        className="mt-10 inline-flex size-40 items-center justify-center rounded-full bg-neon-pink font-display text-lg font-bold text-background shadow-[0_0_60px_var(--neon-pink)] transition-transform duration-200 ease-out"
      >
        {dict.contact.title}
      </a>
    </div>
  )
}

/** 38: contact form disguised as a terminal session; sends through mailto. */
export function TerminalContact({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(["", "", ""])
  const [input, setInput] = useState("")
  const prompts = [dict.contact.name, dict.contact.email, dict.contact.message]
  const done = step >= prompts.length
  const submit = () => {
    if (!input.trim()) return
    const next = [...values]
    next[step] = input
    setValues(next)
    setInput("")
    setStep(step + 1)
  }
  const mailto = `mailto:${data.profile.links.email}?subject=${encodeURIComponent(`Hello from ${values[0]}`)}&body=${encodeURIComponent(`${values[2]}\n\n— ${values[0]} <${values[1]}>`)}`
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#07040f] p-5 font-mono text-sm text-[#5dff9d]"
      dir="ltr"
    >
      <p className="text-muted-foreground">$ ./contact.sh</p>
      {prompts.slice(0, step).map((p, i) => (
        <p key={p}>
          <span className="text-neon-cyan">? {p}:</span> {values[i]}
        </p>
      ))}
      {!done ? (
        <form
          onSubmit={(e) => (e.preventDefault(), submit())}
          className="flex items-center gap-2"
        >
          <label htmlFor="lab-term" className="text-neon-cyan">
            ? {prompts[step]}:
          </label>
          <input
            id="lab-term"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            className="min-h-9 flex-1 bg-transparent caret-[#5dff9d] outline-none"
          />
        </form>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span>✔ ready to send</span>
          <a
            href={mailto}
            className="inline-flex min-h-9 items-center gap-2 rounded bg-[#5dff9d] px-3 text-black"
          >
            <Send className="size-4" /> {dict.contact.send}
          </a>
          <button
            onClick={() => (setStep(0), setValues(["", "", ""]))}
            className="text-muted-foreground underline"
          >
            reset
          </button>
        </div>
      )}
    </div>
  )
}

/** 39: macOS-style dock that magnifies under the pointer. */
export function SocialDock({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const [hover, setHover] = useState<number | null>(null)
  const items = [
    {
      label: "Email",
      href: `mailto:${data.profile.links.email}`,
      Icon: Mail,
      c: "var(--neon-pink)",
    },
    {
      label: "GitHub",
      href: data.profile.links.github,
      Icon: CodeXml,
      c: "var(--neon-cyan)",
    },
    {
      label: "LinkedIn",
      href: data.profile.links.linkedin,
      Icon: Briefcase,
      c: "var(--neon-purple)",
    },
    {
      label: dict.nav.resume,
      href: `/resume/${data.lang}.pdf`,
      Icon: Download,
      c: "var(--neon-yellow)",
    },
  ]
  return (
    <div className="flex justify-center py-10">
      <ul
        className="flex items-end gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 pt-3 pb-3 backdrop-blur"
        onMouseLeave={() => setHover(null)}
      >
        {items.map(({ label, href, Icon, c }, i) => {
          const d = hover === null ? 9 : Math.abs(hover - i)
          const scale = d === 0 ? 1.6 : d === 1 ? 1.25 : 1
          return (
            <li key={label} className="relative">
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className="grid size-12 origin-bottom place-items-center rounded-xl transition-transform duration-150"
                style={{
                  transform: `scale(${scale})`,
                  background: `color-mix(in oklch, ${c} 25%, #0b0618)`,
                  color: c,
                }}
              >
                <Icon className="size-6" />
              </a>
              {hover === i && (
                <span className="absolute -top-16 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs whitespace-nowrap">
                  {label}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** 40: footer with a pixel city skyline and a sunset. */
export function SkylineFooter({ data }: { data: LabData }) {
  const { dict } = useDictionary()
  const buildings = Array.from({ length: 28 }, (_, i) => ({
    h: 30 + ((i * 37) % 70),
    w: 3 + ((i * 13) % 4),
  }))
  return (
    <footer className="relative overflow-hidden rounded-2xl bg-[linear-gradient(to_bottom,#0b0618,#3d0b3a)] pt-20">
      <div className="absolute start-1/2 top-10 size-48 -translate-x-1/2 synth-sun rtl:translate-x-1/2" />
      <div className="relative flex h-28 items-end" dir="ltr">
        {buildings.map((b, i) => (
          <div
            key={i}
            className="relative bg-[#07040f]"
            style={{
              height: `${b.h}%`,
              flexGrow: b.w,
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklch, var(--neon-yellow) 70%, transparent) 1px, transparent 1.5px)",
              backgroundSize: "8px 10px",
            }}
          />
        ))}
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-4 bg-[#07040f] px-6 py-6 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {data.profile.name} · {dict.footer.built}
        </p>
        <a
          href={data.profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-neon-cyan"
        >
          GitHub <ArrowUpRight className="size-4" />
        </a>
      </div>
    </footer>
  )
}

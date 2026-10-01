"use client"

import { X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import type { NavTarget } from "@/components/Arcade/actions"
import { sfx } from "@/lib/audio/sfx"
import type { Skill } from "@/lib/content/types"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { hasLocale, LOCALE_COOKIE, switchLocalePath } from "@/lib/i18n/config"

type Line = { kind: "in" | "out" | "err"; text: string }

/**
 * CRT terminal overlay. Commands double as keyboard navigation of the site.
 * `navigate` is provided by the host: camera + panel in 3D, scroll in Lite.
 */
export default function Terminal({
  skills,
  projects,
  navigate,
  onClose,
}: {
  skills: Skill[]
  projects: string[]
  navigate: (target: NavTarget) => void
  onClose: () => void
}) {
  const { dict, lang } = useDictionary()
  const t = dict.terminal
  const router = useRouter()
  const pathname = usePathname()
  const discover = useDiscover()
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: t.welcome }])
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => input.current?.focus(), [])
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  }, [lines])

  const run = (raw: string) => {
    const command = raw.trim()
    const out: Line[] = [{ kind: "in", text: command }]
    const [name, ...args] = command.toLowerCase().split(/\s+/)
    const later: (() => void)[] = []

    switch (name) {
      case "":
        break
      case "help":
        out.push({ kind: "out", text: t.help })
        break
      case "about":
        out.push({ kind: "out", text: t.about })
        later.push(() => navigate("about"))
        break
      case "skills":
        out.push({ kind: "out", text: skills.map((s) => `${s.name} ${"█".repeat(Math.round(s.level / 10))}`).join("\n") })
        later.push(() => navigate("skills"))
        break
      case "projects":
        out.push({ kind: "out", text: projects.join("\n") })
        later.push(() => navigate("projects"))
        break
      case "blog":
      case "contact":
      case "resume":
      case "games":
        later.push(() => navigate(name))
        break
      case "lang": {
        const next = args[0]
        if (next && hasLocale(next)) {
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
          later.push(() => router.push(switchLocalePath(pathname, next)))
        } else {
          out.push({ kind: "err", text: "usage: lang <en|fa>" })
        }
        break
      }
      case "theme":
        out.push({ kind: "out", text: t.theme })
        break
      case "clear":
        setLines([])
        setValue("")
        return
      case "exit":
        onClose()
        return
      case "sudo":
        if (args.join(" ") === "hire-me") {
          out.push({ kind: "out", text: t.hireMe })
          later.push(() => {
            discover("sudo-hire-me")
            navigate("contact")
          })
        } else {
          out.push({ kind: "err", text: t.sudo })
        }
        break
      default:
        out.push({ kind: "err", text: `${name}: ${t.notFound}` })
    }

    setLines((prev) => [...prev, ...out])
    if (command) setHistory((h) => [command, ...h].slice(0, 30))
    setCursor(-1)
    setValue("")
    if (later.length) setTimeout(() => later.forEach((fn) => fn()), 450)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run(value)
    else if (e.key === "Escape") {
      e.stopPropagation()
      onClose()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(history.length - 1, cursor + 1)
      if (history[next]) {
        setCursor(next)
        setValue(history[next])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = cursor - 1
      setCursor(Math.max(-1, next))
      setValue(next >= 0 ? history[next] : "")
    } else if (e.key.length === 1) {
      sfx.type()
    }
  }

  return (
    <section
      role="dialog"
      aria-label={t.title}
      dir="ltr"
      lang={lang}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-h-[60svh] max-w-2xl flex-col overflow-hidden rounded-lg bg-[#04120b]/95 font-mono text-sm text-[#5dff9d] shadow-[0_0_40px_rgba(93,255,157,0.25)] neon-border scanlines"
    >
      <header className="relative z-10 flex items-center justify-between border-b border-[#5dff9d]/30 px-3 py-1.5">
        <span className="text-glow">{t.title}</span>
        <button type="button" onClick={onClose} aria-label={dict.games.exit} className="inline-flex size-9 items-center justify-center rounded hover:bg-white/10">
          <X className="size-4" />
        </button>
      </header>
      <div ref={log} className="relative z-10 flex-1 overflow-y-auto px-3 py-2" aria-live="polite">
        {lines.map((line, i) => (
          <pre
            key={i}
            className={line.kind === "err" ? "whitespace-pre-wrap text-[#ff7a7a]" : line.kind === "in" ? "whitespace-pre-wrap text-[#b5ffd1]" : "whitespace-pre-wrap"}
            dir="auto"
          >
            {line.kind === "in" ? `$ ${line.text}` : line.text}
          </pre>
        ))}
      </div>
      <label className="relative z-10 flex items-center gap-2 border-t border-[#5dff9d]/30 px-3 py-2">
        <span aria-hidden>$</span>
        <span className="sr-only">{t.placeholder}</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t.placeholder}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-[#b5ffd1] caret-[#5dff9d] outline-none placeholder:text-[#5dff9d]/60"
        />
      </label>
    </section>
  )
}

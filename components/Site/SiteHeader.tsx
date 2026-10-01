import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import LocaleSwitch from "./LocaleSwitch"

export default function SiteHeader({
  lang,
  dict,
}: {
  lang: Locale
  dict: Dictionary
}) {
  const links = [
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/blog`, label: dict.nav.blog },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link
          href={`/${lang}`}
          className="font-display text-lg tracking-widest text-neon-pink uppercase text-glow"
        >
          {dict.site.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-9 items-center rounded-md px-3 text-foreground/90 hover:bg-muted hover:text-neon-cyan"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <LocaleSwitch />
          </li>
        </ul>
      </nav>
    </header>
  )
}

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
    <header className="sticky top-0 z-40 border-b-[3px] border-[#1a1410] bg-[#1a1410]/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link
          href={`/${lang}`}
          className="font-display text-sm tracking-widest text-white uppercase"
        >
          {dict.site.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-9 items-center rounded-md bg-card px-3 font-display text-[10px] text-foreground pixel-border-sm hover:bg-secondary"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <LocaleSwitch className="bg-card text-foreground pixel-border-sm" />
          </li>
        </ul>
      </nav>
    </header>
  )
}

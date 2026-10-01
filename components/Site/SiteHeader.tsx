import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import LocaleSwitch from "./LocaleSwitch"
import ThemeToggle from "./ThemeToggle"

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
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link
          href={`/${lang}`}
          className="text-lg font-semibold"
        >
          {dict.site.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-9 items-center rounded-md px-3 font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle className="size-9" />
          </li>
          <li>
            <LocaleSwitch />
          </li>
        </ul>
      </nav>
    </header>
  )
}

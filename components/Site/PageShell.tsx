import type { ReactNode } from "react"
import { getProfile } from "@/lib/content"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import SiteFooter from "./SiteFooter"
import SiteHeader from "./SiteHeader"

/** Layout for the classic 2D pages (projects, blog, about, contact, secret). */
export default function PageShell({
  lang,
  dict,
  title,
  intro,
  children,
}: {
  lang: Locale
  dict: Dictionary
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col neon-grid">
      <SiteHeader lang={lang} dict={dict} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="inline-block rounded-md bricks px-4 py-3 font-display text-xl leading-snug pixel-border sm:text-2xl">
          <span className="text-outline">{title}</span>
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl font-medium text-white [text-shadow:1px_1px_0_#1a1410]">
            {intro}
          </p>
        )}
        <div className="mt-8 rounded-md bg-card p-5 text-card-foreground pixel-border sm:p-8">
          {children}
        </div>
      </main>
      <SiteFooter lang={lang} dict={dict} profile={getProfile(lang)} />
    </div>
  )
}

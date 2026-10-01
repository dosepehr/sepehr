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
    <div className="paper flex min-h-svh flex-col">
      <SiteHeader lang={lang} dict={dict} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>
        )}
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter lang={lang} dict={dict} profile={getProfile(lang)} />
    </div>
  )
}

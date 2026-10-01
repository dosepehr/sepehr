import { NextResponse, type NextRequest } from "next/server"
import {
  defaultLocale,
  hasLocale,
  LOCALE_COOKIE,
  locales,
  type Locale,
} from "@/lib/i18n/config"

/** Pick a locale from the cookie, then Accept-Language, then the default. */
function getLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && hasLocale(cookie)) return cookie

  const header = request.headers.get("accept-language") ?? ""
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.find((p) => p.trim().startsWith("q="))
      return {
        lang: tag.toLowerCase().split("-")[0],
        q: q ? Number(q.trim().slice(2)) || 0 : 1,
      }
    })
    .filter((entry) => entry.lang)
    .sort((a, b) => b.q - a.q)

  for (const { lang } of ranked) {
    if (hasLocale(lang)) return lang
  }
  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasPrefix) return

  const url = request.nextUrl.clone()
  url.pathname = `/${getLocale(request)}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Next internals, API routes and anything that looks like a file.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}

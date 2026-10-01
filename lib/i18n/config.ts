export const locales = ["en", "fa"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)

export const dirOf = (locale: Locale) => (locale === "fa" ? "rtl" : "ltr")

/** Swap the locale segment of a pathname, keeping the rest of the path. */
export function switchLocalePath(pathname: string, next: Locale) {
  const parts = pathname.split("/")
  if (parts[1] && hasLocale(parts[1])) parts[1] = next
  else parts.splice(1, 0, next)
  return parts.join("/") || `/${next}`
}

import "server-only"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fa: () => import("./dictionaries/fa.json").then((m) => m.default),
}

export const getDictionary = (locale: Locale) => dictionaries[locale]()

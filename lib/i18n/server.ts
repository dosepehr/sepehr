import "server-only"
import { notFound } from "next/navigation"
import { getDictionary } from "@/app/[lang]/dictionaries"
import { hasLocale } from "./config"

/** Validate the `lang` param and load its dictionary (404 on unknown locales). */
export async function resolveLang(params: Promise<{ lang: string }>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return { lang, dict: await getDictionary(lang) }
}

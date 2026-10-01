"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDictionary } from "@/components/DictionaryProvider"
import { cn } from "@/lib/funcs/cn"
import { LOCALE_COOKIE, switchLocalePath } from "@/lib/i18n/config"

export default function LocaleSwitch({ className }: { className?: string }) {
  const { dict, lang } = useDictionary()
  const pathname = usePathname()
  const next = lang === "en" ? "fa" : "en"

  return (
    <Link
      href={switchLocalePath(pathname, next)}
      hrefLang={next}
      lang={next}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
      }}
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm text-card-foreground shadow-sm hover:bg-muted",
        className
      )}
    >
      {dict.hud.language}
    </Link>
  )
}

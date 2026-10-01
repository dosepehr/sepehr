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
        "inline-flex h-9 items-center rounded-md px-3 text-sm text-neon-cyan neon-border hover:bg-neon-cyan/10",
        className
      )}
    >
      {dict.hud.language}
    </Link>
  )
}

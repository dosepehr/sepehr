"use client"

import Link from "next/link"
import { useDictionary } from "@/components/DictionaryProvider"

export default function NotFound() {
  const { dict, lang } = useDictionary()
  return (
    <main
      id="main"
      className="flex min-h-svh flex-col items-center justify-center gap-4 neon-grid px-4 text-center"
    >
      <h1 className="animate-flicker font-display text-4xl text-neon-pink text-glow">
        {dict.notFound.title}
      </h1>
      <p className="text-muted-foreground">{dict.notFound.body}</p>
      <Link
        href={`/${lang}`}
        className="inline-flex min-h-11 items-center rounded-md px-4 text-neon-cyan neon-border"
      >
        {dict.notFound.home}
      </Link>
    </main>
  )
}

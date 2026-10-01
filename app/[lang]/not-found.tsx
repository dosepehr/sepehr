"use client"

import Link from "next/link"
import { useDictionary } from "@/components/DictionaryProvider"

export default function NotFound() {
  const { dict, lang } = useDictionary()
  return (
    <main
      id="main"
      className="paper flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-4xl font-bold">{dict.notFound.title}</h1>
      <p className="text-muted-foreground">{dict.notFound.body}</p>
      <Link
        href={`/${lang}`}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {dict.notFound.home}
      </Link>
    </main>
  )
}

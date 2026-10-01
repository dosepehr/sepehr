"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"

type DictionaryContextValue = { dict: Dictionary; lang: Locale }

const DictionaryContext = createContext<DictionaryContextValue | null>(null)

export default function DictionaryProvider({
  dict,
  lang,
  children,
}: DictionaryContextValue & { children: ReactNode }) {
  return (
    <DictionaryContext.Provider value={{ dict, lang }}>
      {children}
    </DictionaryContext.Provider>
  )
}

export function useDictionary() {
  const value = useContext(DictionaryContext)
  if (!value)
    throw new Error("useDictionary must be used inside DictionaryProvider")
  return value
}

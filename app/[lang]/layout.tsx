import type { Metadata, Viewport } from "next"
import {
  Geist,
  JetBrains_Mono,
  Orbitron,
  Press_Start_2P,
  Vazirmatn,
} from "next/font/google"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import "../globals.css"
import DictionaryProvider from "@/components/DictionaryProvider"
import GlobalEggs from "@/components/Quests/GlobalEggs"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import Toaster from "@/components/ui/Toast"
import { cn } from "@/lib/funcs/cn"
import { dirOf, hasLocale, locales } from "@/lib/i18n/config"
import { siteUrl } from "@/lib/site"
import { getDictionary } from "./dictionaries"

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })
const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-orbitron",
})
// Pixel display face for the mushroom-kingdom theme (Latin only; Persian falls back to Vazirmatn).
const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
})
const fa = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-fa" })

type Props = { children: ReactNode; params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const viewport: Viewport = { themeColor: "#5c94fc", colorScheme: "light" }

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const dict = await getDictionary(lang)
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s · ${dict.site.name}` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", fa: "/fa", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      locale: lang === "fa" ? "fa_IR" : "en_US",
      siteName: dict.site.name,
    },
    twitter: { card: "summary_large_image" },
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const dir = dirOf(lang)

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        sans.variable,
        mono.variable,
        display.variable,
        pixel.variable,
        fa.variable
      )}
    >
      <body className="min-h-svh bg-background font-sans">
        <a
          href="#main"
          className="sr-only z-100 rounded-md bg-background px-3 py-2 focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
        >
          {dict.site.skipToContent}
        </a>
        <ThemeProvider>
          <DirectionProvider dir={dir}>
            <DictionaryProvider dict={dict} lang={lang}>
              {children}
              <GlobalEggs />
              <Toaster position="bottom-center" />
            </DictionaryProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

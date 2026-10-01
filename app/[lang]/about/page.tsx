import type { Metadata } from "next"
import AboutContent from "@/components/Content/AboutContent"
import PageShell from "@/components/Site/PageShell"
import { getProfile } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params)
  return {
    title: dict.about.title,
    alternates: {
      canonical: `/${lang}/about`,
      languages: { en: "/en/about", fa: "/fa/about" },
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  return (
    <PageShell lang={lang} dict={dict} title={dict.about.title}>
      <AboutContent profile={getProfile(lang)} dict={dict} />
    </PageShell>
  )
}

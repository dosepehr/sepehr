import type { Metadata } from "next"
import ContactContent from "@/components/Content/ContactContent"
import PageShell from "@/components/Site/PageShell"
import { getProfile } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params)
  return {
    title: dict.contact.title,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: { en: "/en/contact", fa: "/fa/contact" },
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  return (
    <PageShell lang={lang} dict={dict} title={dict.contact.title}>
      <ContactContent profile={getProfile(lang)} dict={dict} lang={lang} />
    </PageShell>
  )
}

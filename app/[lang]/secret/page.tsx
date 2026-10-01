import type { Metadata } from "next"
import SecretContent from "@/components/Quests/SecretContent"
import PageShell from "@/components/Site/PageShell"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dict } = await resolveLang(params)
  return { title: dict.secret.title, robots: { index: false } }
}

export default async function SecretPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  return (
    <PageShell lang={lang} dict={dict} title={dict.secret.title}>
      <SecretContent />
    </PageShell>
  )
}

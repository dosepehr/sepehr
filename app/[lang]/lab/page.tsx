import type { Metadata } from "next"
import LabGallery from "@/components/Lab/LabGallery"
import { getPosts, getProfile, getProjects } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await resolveLang(params)
  return {
    title: "Component lab",
    // A design workbench, not a page for search engines.
    robots: { index: false },
    alternates: { canonical: `/${lang}/lab` },
  }
}

export default async function LabPage({ params }: Props) {
  const { lang } = await resolveLang(params)
  const [projects, posts] = await Promise.all([
    getProjects(lang),
    getPosts(lang),
  ])
  return (
    <LabGallery data={{ lang, profile: getProfile(lang), projects, posts }} />
  )
}

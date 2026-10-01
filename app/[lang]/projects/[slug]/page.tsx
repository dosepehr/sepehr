import type { Metadata } from "next"
import Link from "next/link"
import ProjectHeader from "@/components/Content/ProjectHeader"
import PageShell from "@/components/Site/PageShell"
import { getProject, listSlugs } from "@/lib/content"
import { locales } from "@/lib/i18n/config"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string; slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  const all = await Promise.all(
    locales.map(async (lang) =>
      (await listSlugs("projects", lang)).map((slug) => ({ lang, slug }))
    )
  )
  return all.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await resolveLang(params)
  const { slug } = await params
  const project = await getProject(lang, slug)
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/${lang}/projects/${slug}`,
      languages: { en: `/en/projects/${slug}`, fa: `/fa/projects/${slug}` },
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  const { slug } = await params
  const { Content, ...project } = await getProject(lang, slug)
  return (
    <PageShell lang={lang} dict={dict} title={project.title}>
      <ProjectHeader project={project} dict={dict} />
      <article className="mt-6 max-w-3xl">
        <Content />
      </article>
      <Link
        href={`/${lang}/projects`}
        className="mt-8 inline-flex min-h-11 items-center text-neon-cyan underline underline-offset-4"
      >
        {dict.projects.back}
      </Link>
    </PageShell>
  )
}

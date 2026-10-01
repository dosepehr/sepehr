import type { Metadata } from "next"
import ProjectList from "@/components/Content/ProjectList"
import PageShell from "@/components/Site/PageShell"
import { getProjects } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params)
  return {
    title: dict.projects.title,
    alternates: {
      canonical: `/${lang}/projects`,
      languages: { en: "/en/projects", fa: "/fa/projects" },
    },
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  const projects = await getProjects(lang)
  return (
    <PageShell
      lang={lang}
      dict={dict}
      title={dict.projects.title}
      intro={dict.projects.intro}
    >
      <ProjectList projects={projects} lang={lang} dict={dict} />
    </PageShell>
  )
}

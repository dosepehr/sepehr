import AboutContent from "@/components/Content/AboutContent"
import ContactContent from "@/components/Content/ContactContent"
import PostList from "@/components/Content/PostList"
import ProjectHeader from "@/components/Content/ProjectHeader"
import ProjectList from "@/components/Content/ProjectList"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import Experience from "@/components/Arcade/Experience"
import { getPosts, getProfile, getProject, getProjects } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"
import { siteUrl } from "@/lib/site"

type Props = { params: Promise<{ lang: string }> }

export default async function Home({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  const [projects, posts] = await Promise.all([
    getProjects(lang),
    getPosts(lang),
  ])
  const profile = getProfile(lang)

  const bodies = await Promise.all(
    projects.map(async (p) => {
      const { Content, ...project } = await getProject(lang, p.slug)
      return [
        p.slug,
        <div key={p.slug} className="flex flex-col gap-4">
          <ProjectHeader project={project} dict={dict} />
          <div className="text-popover-foreground">
            <Content />
          </div>
        </div>,
      ] as const
    })
  )

  const data: ArcadeData = {
    projects,
    posts,
    skills: profile.skills,
    profile,
    projectBodies: Object.fromEntries(bodies),
    panels: {
      projects: <ProjectList projects={projects} lang={lang} dict={dict} />,
      blog: <PostList posts={posts} lang={lang} dict={dict} />,
      about: <AboutContent profile={profile} dict={dict} />,
      contact: <ContactContent profile={profile} dict={dict} lang={lang} />,
    },
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: `${siteUrl}/${lang}`,
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: profile.skills.map((s) => s.name),
  }

  // Server-rendered first paint (and what crawlers see): hero over a CSS neon grid.
  const hero = (
    <main
      id="main"
      className="flex min-h-svh flex-col items-center justify-center gap-4 neon-grid px-4 text-center"
    >
      <h1 className="font-display text-4xl tracking-[0.2em] text-outline uppercase sm:text-6xl">
        {dict.site.name}
      </h1>
      <p className="rounded-md bg-card px-4 py-2 font-display text-xs pixel-border-sm">
        {dict.site.role}
      </p>
      <p className="max-w-md font-medium text-white [text-shadow:1px_1px_0_#1a1410]">
        {dict.site.tagline}
      </p>
      <p className="font-display text-[10px] text-outline">
        {dict.hub.loading}
      </p>
    </main>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Experience data={data} hero={hero} />
    </>
  )
}

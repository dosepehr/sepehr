import type { MetadataRoute } from "next"
import { listSlugs } from "@/lib/content"
import { locales } from "@/lib/i18n/config"
import { siteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/projects", "/blog", "/about", "/contact"]
  const [projects, posts] = await Promise.all([
    listSlugs("projects", "en"),
    listSlugs("blog", "en"),
  ])
  paths.push(
    ...projects.map((s) => `/projects/${s}`),
    ...posts.map((s) => `/blog/${s}`)
  )

  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${path}`])
        ),
      },
    }))
  )
}

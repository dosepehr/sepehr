import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import type { ComponentType } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Post, PostMeta, Project, ProjectMeta } from "./types"

type Collection = "projects" | "blog"
type MdxModule<M> = { default: ComponentType; meta: M }

const root = path.join(process.cwd(), "content")

export async function listSlugs(collection: Collection, lang: Locale) {
  const dir = path.join(root, collection, lang)
  const files = await fs.readdir(dir).catch(() => [])
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
}

// The import path must stay a template literal rooted at @/content so the
// bundler can build a context for every MDX file.
function load<M>(collection: Collection, lang: Locale, slug: string) {
  return import(`@/content/${collection}/${lang}/${slug}.mdx`) as Promise<
    MdxModule<M>
  >
}

export async function getProject(lang: Locale, slug: string) {
  const mod = await load<ProjectMeta>("projects", lang, slug)
  return { ...mod.meta, slug, Content: mod.default }
}

export async function getPost(lang: Locale, slug: string) {
  const mod = await load<PostMeta>("blog", lang, slug)
  return { ...mod.meta, slug, Content: mod.default }
}

export async function getProjects(lang: Locale): Promise<Project[]> {
  const slugs = await listSlugs("projects", lang)
  const all = await Promise.all(
    slugs.map(async (slug) => ({
      ...(await load<ProjectMeta>("projects", lang, slug)).meta,
      slug,
    }))
  )
  return all.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export async function getPosts(lang: Locale): Promise<Post[]> {
  const slugs = await listSlugs("blog", lang)
  const all = await Promise.all(
    slugs.map(async (slug) => ({
      ...(await load<PostMeta>("blog", lang, slug)).meta,
      slug,
    }))
  )
  return all.sort((a, b) => b.date.localeCompare(a.date))
}

export { getProfile } from "./profile"

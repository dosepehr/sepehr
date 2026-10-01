import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/Site/PageShell"
import { getPost, listSlugs } from "@/lib/content"
import { locales } from "@/lib/i18n/config"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string; slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  const all = await Promise.all(
    locales.map(async (lang) =>
      (await listSlugs("blog", lang)).map((slug) => ({ lang, slug }))
    )
  )
  return all.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await resolveLang(params)
  const { slug } = await params
  const post = await getPost(lang, slug)
  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages: { en: `/en/blog/${slug}`, fa: `/fa/blog/${slug}` },
    },
    openGraph: { type: "article", publishedTime: post.date },
  }
}

export default async function PostPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  const { slug } = await params
  const { Content, ...post } = await getPost(lang, slug)
  const fmt = new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "long",
  })
  return (
    <PageShell lang={lang} dict={dict} title={post.title}>
      <p className="text-sm text-muted-foreground">
        <time dateTime={post.date}>{fmt.format(new Date(post.date))}</time> ·{" "}
        {new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(
          post.minutes
        )}{" "}
        {dict.blog.minutes}
      </p>
      <article className="mt-4 max-w-3xl">
        <Content />
      </article>
      <Link
        href={`/${lang}/blog`}
        className="mt-8 inline-flex min-h-11 items-center text-primary-text underline underline-offset-4"
      >
        {dict.blog.back}
      </Link>
    </PageShell>
  )
}

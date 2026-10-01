import type { Metadata } from "next"
import PostList from "@/components/Content/PostList"
import PageShell from "@/components/Site/PageShell"
import { getPosts } from "@/lib/content"
import { resolveLang } from "@/lib/i18n/server"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params)
  return {
    title: dict.blog.title,
    alternates: {
      canonical: `/${lang}/blog`,
      languages: { en: "/en/blog", fa: "/fa/blog" },
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { lang, dict } = await resolveLang(params)
  const posts = await getPosts(lang)
  return (
    <PageShell
      lang={lang}
      dict={dict}
      title={dict.blog.title}
      intro={dict.blog.intro}
    >
      <PostList posts={posts} lang={lang} dict={dict} />
    </PageShell>
  )
}

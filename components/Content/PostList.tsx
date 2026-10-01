import Link from "next/link"
import type { Post } from "@/lib/content/types"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"

export default function PostList({
  posts,
  lang,
  dict,
}: {
  posts: Post[]
  lang: Locale
  dict: Dictionary
}) {
  const fmt = new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium",
  })
  const num = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US")
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/${lang}/blog/${post.slug}`}
            className="group block rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-primary focus-visible:border-primary"
          >
            <p className="text-xs text-muted-foreground">
              <time dateTime={post.date}>
                {fmt.format(new Date(post.date))}
              </time>{" "}
              · {num.format(post.minutes)} {dict.blog.minutes}
            </p>
            <h3 className="mt-1 text-lg font-semibold group-hover:text-primary-text group-hover:underline group-hover:underline-offset-4">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{post.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

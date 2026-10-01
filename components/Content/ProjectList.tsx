import Link from "next/link"
import type { Project } from "@/lib/content/types"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"

export default function ProjectList({
  projects,
  lang,
  dict,
}: {
  projects: Project[]
  lang: Locale
  dict: Dictionary
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug}>
          <article
            style={{ color: project.color }}
            className="scanlines flex h-full flex-col rounded-lg bg-card/80 p-5 neon-border"
          >
            <h3 className="font-display text-lg tracking-wide text-glow">
              {project.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-card-foreground/90">
              {project.summary}
            </p>
            <ul
              className="mt-4 flex flex-wrap gap-1.5"
              aria-label={dict.projects.stack}
            >
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}/projects/${project.slug}`}
              className="relative z-10 mt-4 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
            >
              {dict.projects.readCase}
              <span className="sr-only">: {project.title}</span>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  )
}

import Link from "next/link"
import type { Project } from "@/lib/content/types"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import { toneVar } from "@/lib/tone"

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
          <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <span
              aria-hidden
              className="h-1.5"
              style={{ backgroundColor: toneVar(project.tone) }}
            />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
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
                className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary-text underline underline-offset-4"
              >
                {dict.projects.readCase}
                <span className="sr-only">: {project.title}</span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

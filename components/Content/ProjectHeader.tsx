import type { Project } from "@/lib/content/types"
import type { Dictionary } from "@/lib/i18n/dictionary"
import { toneVar } from "@/lib/tone"

export default function ProjectHeader({
  project,
  dict,
}: {
  project: Project
  dict: Dictionary
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-border border-s-4 bg-muted/50 p-5"
      style={{ borderInlineStartColor: toneVar(project.tone) }}
    >
      <p className="text-sm text-card-foreground">{project.summary}</p>
      <dl className="grid gap-3 text-sm text-card-foreground sm:grid-cols-2">
        <div>
          <dt className="font-medium">{project.role}</dt>
          <dd className="font-mono text-xs text-muted-foreground" dir="ltr">
            {project.date.slice(0, 7)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{dict.projects.stack}</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5" dir="ltr">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs"
              >
                {tech}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      {project.links && project.links.length > 0 && (
        <ul className="flex flex-wrap gap-3" aria-label={dict.projects.links}>
          {project.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center rounded-md border border-border bg-card px-3 text-sm text-primary-text hover:bg-muted"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

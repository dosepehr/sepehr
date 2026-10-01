import { Briefcase, CodeXml, Download, Mail } from "lucide-react"
import type { Profile } from "@/lib/content/types"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import ContactForm from "./ContactForm"

// Contact details are never gated behind quests: recruiters must always reach Sepehr.
export default function ContactContent({
  profile,
  dict,
  lang,
}: {
  profile: Profile
  dict: Dictionary
  lang: Locale
}) {
  const direct = [
    {
      href: `mailto:${profile.links.email}`,
      label: profile.links.email,
      Icon: Mail,
    },
    { href: profile.links.github, label: "GitHub", Icon: CodeXml },
    { href: profile.links.linkedin, label: "LinkedIn", Icon: Briefcase },
  ]
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
      <div className="relative">
        <p className="mb-4 text-muted-foreground">{dict.contact.intro}</p>
        <ContactForm />
      </div>
      <aside className="flex flex-col gap-3">
        <h2 className="font-display text-sm tracking-wide text-neon-cyan">
          {dict.contact.direct}
        </h2>
        <ul className="flex flex-col gap-2">
          {direct.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="me noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-neon-cyan"
                dir="ltr"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`/resume/${lang}.pdf`}
              download
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-neon-yellow neon-border hover:bg-neon-yellow/10"
            >
              <Download className="size-4" aria-hidden />
              {dict.contact.resume}
            </a>
          </li>
        </ul>
      </aside>
    </div>
  )
}

import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionary"
import type { Profile } from "@/lib/content/types"

export default function SiteFooter({
  lang,
  dict,
  profile,
}: {
  lang: Locale
  dict: Dictionary
  profile: Profile
}) {
  return (
    <footer className="mt-16 border-t-[3px] border-[#1a1410] ground grass-top">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 pt-8 pb-6 text-sm text-white [text-shadow:1px_1px_0_#1a1410]">
        <p>{dict.footer.built}</p>
        <ul className="flex flex-wrap gap-4">
          <li>
            <a
              className="hover:text-[#ffe08a]"
              href={`mailto:${profile.links.email}`}
            >
              Email
            </a>
          </li>
          <li>
            <a
              className="hover:text-[#ffe08a]"
              href={profile.links.github}
              rel="me noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              className="hover:text-[#ffe08a]"
              href={profile.links.linkedin}
              rel="me noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <Link className="hover:text-[#ffe08a]" href={`/${lang}`}>
              {dict.nav.home}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}

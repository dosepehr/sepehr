import type { Profile } from "@/lib/content/types"
import type { Dictionary } from "@/lib/i18n/dictionary"
import SkillsBoard from "./SkillsBoard"

export default function AboutContent({
  profile,
  dict,
}: {
  profile: Profile
  dict: Dictionary
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="font-medium text-primary-text">
          {profile.name} · {profile.role} · {profile.location}
        </p>
        {profile.bio.map((paragraph) => (
          <p key={paragraph} className="leading-7">
            {paragraph}
          </p>
        ))}
      </section>
      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="mb-3 text-xl font-semibold">
          {dict.about.skills}
        </h2>
        <SkillsBoard skills={profile.skills} dict={dict} />
      </section>
      <section aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="mb-3 text-xl font-semibold">
          {dict.about.experience}
        </h2>
        <ol className="flex flex-col gap-4 border-s-2 border-border ps-5">
          {profile.experience.map((job) => (
            <li key={job.company + job.period}>
              <p className="font-semibold text-foreground">
                {job.role} ·{" "}
                <span className="text-primary-text">{job.company}</span>
              </p>
              <p className="text-xs text-muted-foreground">{job.period}</p>
              <p className="mt-1 text-sm">{job.summary}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

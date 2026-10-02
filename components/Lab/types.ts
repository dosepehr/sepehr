import type { ComponentType } from "react"
import type { Post, Profile, Project } from "@/lib/content/types"
import type { Locale } from "@/lib/i18n/config"

/** Everything a candidate component can draw from. Same content as the 3D room. */
export type LabData = {
  lang: Locale
  profile: Profile
  projects: Project[]
  posts: Post[]
}

export type LabCategory =
  "hero" | "about" | "skills" | "projects" | "experience" | "blog" | "contact"

export type Candidate = {
  id: string
  name: string
  category: LabCategory
  /** One line on what it is and where it fits. */
  note: string
  /** Uses React Flow. */
  flow?: boolean
  Component: ComponentType<{ data: LabData }>
}

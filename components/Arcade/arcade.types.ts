import type { ReactNode } from "react"
import type { Post, Profile, Project, Skill } from "@/lib/content/types"

/** Everything the hub needs, rendered on the server and shared by the 3D room and Lite hub. */
export type ArcadeData = {
  projects: Project[]
  posts: Post[]
  skills: Skill[]
  profile: Profile
  panels: {
    projects: ReactNode
    blog: ReactNode
    about: ReactNode
    contact: ReactNode
  }
  /** Pre-rendered case study (header + MDX body) per project slug. */
  projectBodies: Record<string, ReactNode>
}

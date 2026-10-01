import type { GameId } from "@/lib/store/scores"

export type ProjectMeta = {
  title: string
  summary: string
  date: string
  role: string
  stack: string[]
  tags: string[]
  /** Neon color of the cabinet (CSS color). */
  color: string
  links?: { label: string; href: string }[]
  /** Optional game this cabinet also launches. */
  game?: GameId
  /** Sort order in the arcade row (low = left). */
  order?: number
}

export type PostMeta = {
  title: string
  summary: string
  date: string
  tags: string[]
  minutes: number
}

export type Project = ProjectMeta & { slug: string }
export type Post = PostMeta & { slug: string }

export type Skill = {
  name: string
  level: number
  group: "frontend" | "backend" | "tools"
}
export type Job = {
  company: string
  role: string
  period: string
  summary: string
}
export type Profile = {
  name: string
  role: string
  location: string
  bio: string[]
  skills: Skill[]
  experience: Job[]
  links: { email: string; github: string; linkedin: string }
}

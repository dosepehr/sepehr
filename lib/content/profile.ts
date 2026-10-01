import type { Locale } from "@/lib/i18n/config"
import type { Profile, Skill } from "./types"

// TODO(sepehr): replace placeholder bio, skills, experience and links.
const skills: Skill[] = [
  { name: "React", level: 95, group: "frontend" },
  { name: "Next.js", level: 92, group: "frontend" },
  { name: "TypeScript", level: 92, group: "frontend" },
  { name: "Tailwind", level: 90, group: "frontend" },
  { name: "Three.js", level: 70, group: "frontend" },
  { name: "Node.js", level: 80, group: "backend" },
  { name: "PostgreSQL", level: 70, group: "backend" },
  { name: "GraphQL", level: 65, group: "backend" },
  { name: "Docker", level: 60, group: "tools" },
  { name: "Git", level: 90, group: "tools" },
]

const links = {
  email: "hello@example.com", // TODO(sepehr): real address
  github: "https://github.com/dosepehr",
  linkedin: "https://www.linkedin.com/", // TODO(sepehr): profile URL
}

const profiles: Record<Locale, Profile> = {
  en: {
    name: "Sepehr",
    role: "Frontend / Fullstack Developer",
    location: "Remote",
    bio: [
      "TODO: placeholder bio. I'm a frontend-leaning fullstack developer who cares about fast, accessible interfaces and the small details that make them feel alive.",
      "I work mostly with React, Next.js and TypeScript, and I like dipping into WebGL when a project deserves a little extra.",
    ],
    skills,
    experience: [
      {
        company: "TODO Company",
        role: "Senior Frontend Developer",
        period: "2023 – now",
        summary: "Placeholder: led the design system and the move to the Next.js App Router.",
      },
      {
        company: "TODO Studio",
        role: "Fullstack Developer",
        period: "2020 – 2023",
        summary: "Placeholder: shipped dashboards, APIs and a few things that glowed.",
      },
    ],
    links,
  },
  fa: {
    name: "سپهر",
    role: "توسعه‌دهنده فرانت‌اند / فول‌استک",
    location: "دورکاری",
    bio: [
      "متن موقت: توسعه‌دهنده فول‌استک با تمرکز بر فرانت‌اند که به رابط‌های سریع و دسترس‌پذیر و جزئیات کوچکی که آن‌ها را زنده می‌کند اهمیت می‌دهد.",
      "بیشتر با React و Next.js و TypeScript کار می‌کنم و وقتی پروژه‌ای ارزشش را داشته باشد، سراغ WebGL هم می‌روم.",
    ],
    skills,
    experience: [
      {
        company: "شرکت (موقت)",
        role: "توسعه‌دهنده ارشد فرانت‌اند",
        period: "۲۰۲۳ – اکنون",
        summary: "متن موقت: رهبری دیزاین سیستم و مهاجرت به App Router در Next.js.",
      },
      {
        company: "استودیو (موقت)",
        role: "توسعه‌دهنده فول‌استک",
        period: "۲۰۲۰ – ۲۰۲۳",
        summary: "متن موقت: ساخت داشبوردها، APIها و چند چیز درخشان.",
      },
    ],
    links,
  },
}

export const getProfile = (lang: Locale) => profiles[lang]

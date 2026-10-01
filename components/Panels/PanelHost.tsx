"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import SkillsBoard from "@/components/Content/SkillsBoard"
import { useDictionary } from "@/components/DictionaryProvider"
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/components"
import { sfx } from "@/lib/audio/sfx"
import { useStage, type PanelId } from "@/lib/store/stage"

/** Neon overlay panels opened from hotspots. Content is shared with the 2D pages. */
export default function PanelHost({ data }: { data: ArcadeData }) {
  const { dict, lang } = useDictionary()
  const panel = useStage((s) => s.panel)
  const slug = useStage((s) => s.projectSlug)
  const project = data.projects.find((p) => p.slug === slug)

  const content: Record<PanelId, { title: string; color: string; body: ReactNode; href?: string }> = {
    project: {
      title: project?.title ?? dict.projects.title,
      color: project?.color ?? "var(--neon-pink)",
      body: slug ? data.projectBodies[slug] : data.panels.projects,
      href: slug ? `/${lang}/projects/${slug}` : `/${lang}/projects`,
    },
    blog: { title: dict.blog.title, color: "var(--neon-cyan)", body: data.panels.blog, href: `/${lang}/blog` },
    about: { title: dict.about.title, color: "var(--neon-purple)", body: data.panels.about, href: `/${lang}/about` },
    skills: {
      title: dict.nav.skills,
      color: "var(--neon-yellow)",
      body: <SkillsBoard skills={data.skills} dict={dict} />,
    },
    contact: { title: dict.contact.title, color: "var(--neon-pink)", body: data.panels.contact, href: `/${lang}/contact` },
    resume: {
      title: dict.nav.resume,
      color: "var(--neon-yellow)",
      body: (
        <a
          href={`/resume/${lang}.pdf`}
          download
          className="inline-flex min-h-11 items-center rounded-md px-4 text-neon-yellow neon-border hover:bg-neon-yellow/10"
        >
          {dict.contact.resume}
        </a>
      ),
    },
    games: { title: dict.games.title, color: "var(--neon-cyan)", body: <GamesList include3d /> },
  }
  const active = panel ? content[panel] : null

  return (
    <Dialog
      open={!!active}
      onOpenChange={(open) => {
        if (!open) {
          sfx.back()
          useStage.getState().setPanel(null)
        }
      }}
    >
      {active && (
        <DialogContent
          aria-describedby={undefined}
          style={{ color: active.color }}
          className="max-w-3xl bg-popover/95 text-popover-foreground neon-border scanlines sm:max-w-3xl"
        >
          <DialogHeader className="bg-popover/95">
            <DialogTitle className="font-display tracking-wide text-glow" style={{ color: active.color }}>
              {active.title}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="relative z-10 text-popover-foreground">
            {active.body}
            {active.href && (
              <Link href={active.href} className="text-sm text-neon-cyan underline underline-offset-4">
                {dict.hub.classicView} →
              </Link>
            )}
          </DialogBody>
        </DialogContent>
      )}
    </Dialog>
  )
}

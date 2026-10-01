"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { ArcadeData } from "@/components/Arcade/arcade.types"
import GamesList from "@/components/Content/GamesList"
import SkillsBoard from "@/components/Content/SkillsBoard"
import { useDictionary } from "@/components/DictionaryProvider"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/components"
import { sfx } from "@/lib/audio/sfx"
import { useStage, type PanelId } from "@/lib/store/stage"
import { toneVar, type Tone } from "@/lib/tone"

/** Overlay panels opened from hotspots. Content is shared with the 2D pages. */
export default function PanelHost({ data }: { data: ArcadeData }) {
  const { dict, lang } = useDictionary()
  const panel = useStage((s) => s.panel)
  const slug = useStage((s) => s.projectSlug)
  const project = data.projects.find((p) => p.slug === slug)

  // `tone` is the decorative top bar only; text always uses semantic tokens.
  const content: Record<
    PanelId,
    { title: string; tone: Tone; body: ReactNode; href?: string }
  > = {
    project: {
      title: project?.title ?? dict.projects.title,
      tone: project?.tone ?? "coral",
      body: slug ? data.projectBodies[slug] : data.panels.projects,
      href: slug ? `/${lang}/projects/${slug}` : `/${lang}/projects`,
    },
    blog: {
      title: dict.blog.title,
      tone: "teal",
      body: data.panels.blog,
      href: `/${lang}/blog`,
    },
    about: {
      title: dict.about.title,
      tone: "indigo",
      body: data.panels.about,
      href: `/${lang}/about`,
    },
    skills: {
      title: dict.nav.skills,
      tone: "amber",
      body: <SkillsBoard skills={data.skills} dict={dict} />,
    },
    contact: {
      title: dict.contact.title,
      tone: "coral",
      body: data.panels.contact,
      href: `/${lang}/contact`,
    },
    resume: {
      title: dict.nav.resume,
      tone: "amber",
      body: (
        <a
          href={`/resume/${lang}.pdf`}
          download
          className="inline-flex min-h-11 w-fit items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {dict.contact.resume}
        </a>
      ),
    },
    games: {
      title: dict.games.title,
      tone: "teal",
      body: <GamesList include3d />,
    },
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
          className="max-w-3xl border border-border bg-popover text-popover-foreground shadow-2xl sm:max-w-3xl"
        >
          <span
            aria-hidden
            className="h-1.5 shrink-0 rounded-t-xl"
            style={{ backgroundColor: toneVar(active.tone) }}
          />
          <DialogHeader className="bg-popover">
            <DialogTitle className="text-xl font-semibold">
              {active.title}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="text-popover-foreground">
            {active.body}
            {active.href && (
              <Link
                href={active.href}
                className="self-start text-sm font-medium text-primary-text underline underline-offset-4"
              >
                {dict.hub.classicView} →
              </Link>
            )}
          </DialogBody>
        </DialogContent>
      )}
    </Dialog>
  )
}

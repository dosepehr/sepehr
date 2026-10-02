"use client"

import type { Candidate } from "@/components/Lab/types"
import {
  AboutWorld,
  BlogWorld,
  ContactWorld,
  ExperienceWorld,
  MarioFooter,
  MarioHero,
  ProjectsWorld,
  SkillsWorld,
} from "./sections"

/** The platformer-themed sections, listed in the component lab as #41 onwards. */
const MarioCandidates: Candidate[] = [
  {
    id: "mario-hero",
    name: "Title Screen",
    category: "mario",
    note: "Sky, clouds, hills, ? blocks that pop coins and jump to sections.",
    Component: MarioHero,
  },
  {
    id: "mario-about",
    name: "Speech Box About",
    category: "mario",
    note: "Bio in a game dialog box, stats as power-up tiles.",
    Component: AboutWorld,
  },
  {
    id: "mario-skills",
    name: "Brick Skill Bars",
    category: "mario",
    note: "Each skill is a row of ten bricks; hover bumps them.",
    Component: SkillsWorld,
  },
  {
    id: "mario-projects",
    name: "Warp Pipe Projects",
    category: "mario",
    note: "Project cards rising out of pipes tinted with the project color.",
    Component: ProjectsWorld,
  },
  {
    id: "mario-experience",
    name: "Level Flags",
    category: "mario",
    note: "Jobs as flags along a level that ends at a castle.",
    Component: ExperienceWorld,
  },
  {
    id: "mario-blog",
    name: "Message Blocks",
    category: "mario",
    note: "Posts as cards with a bumping ! block.",
    Component: BlogWorld,
  },
  {
    id: "mario-contact",
    name: "Castle Contact",
    category: "mario",
    note: "Contact form next to a flagpole you can tap for a fanfare.",
    Component: ({ data }) => (
      <ContactWorld
        data={data}
        form={<p className="text-sm">(contact form goes here)</p>}
      />
    ),
  },
  {
    id: "mario-footer",
    name: "Ground Footer",
    category: "mario",
    note: "Hills, bushes and a brick ground strip.",
    Component: () => <MarioFooter />,
  },
]

export default MarioCandidates

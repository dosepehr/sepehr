"use client"

import { ContactShadows } from "@react-three/drei"
import { lazy, Suspense, useRef, useState } from "react"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { allQuestsFound, useQuests } from "@/lib/store/quests"
import type { GameId } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"
import { TONE_HEX } from "@/lib/tone"
import { GAMES } from "@/components/Games/registry"
import { launchGame } from "./actions"
import type { ArcadeData } from "./arcade.types"
import Cabinet from "./Cabinet"
import Floor from "./Floor"
import { GAME_WALL_X, gameZ, PROJECT_ROW_Z, projectX } from "./hotspots"
import { usePalette } from "./palette"
import {
  BlogRack,
  CrtDesk,
  Payphone,
  Printer,
  RoofCat,
  ScoreBoard,
} from "./Props"
import Walls from "./Walls"

// Rapier's WASM is only fetched with this chunk.
const PhysicsToy = lazy(() => import("./PhysicsToy"))

export const ROOM_GAMES: GameId[] = [
  "tech-catcher",
  "bug-blaster",
  "neon-drive",
]
/** Order of cabinets along the left wall (used for camera poses too). */
export const WALL_SLOTS = [...ROOM_GAMES, "out-of-order", "friday-night"]

export default function Room({ data }: { data: ArcadeData }) {
  const palette = usePalette()
  const shadows = useStage((s) => s.tier) !== "low"
  const { dict } = useDictionary()
  const discover = useDiscover()
  const secretOpen = useQuests((s) => allQuestsFound(s.found))
  const taps = useRef(0)
  const [booted, setBooted] = useState(false)
  const stage = useStage.getState

  const gameColor = (game: GameId) => TONE_HEX[GAMES[game].tone]

  return (
    <group>
      {/* Daylight: a warm sky/ground fill plus one soft-shadowed sun. */}
      <hemisphereLight args={[palette.sky, palette.ground, palette.hemi]} />
      <directionalLight
        position={[6, 9, 6]}
        color={palette.sunColor}
        intensity={palette.sunIntensity}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />

      <Floor />
      <Walls />

      {/* Center: one cabinet per project. Adding an MDX file adds a cabinet. */}
      {data.projects.map((project, i) => (
        <Cabinet
          key={project.slug}
          id={`project:${project.slug}`}
          label={project.title}
          color={TONE_HEX[project.tone]}
          position={[projectX(i, data.projects.length), 0, PROJECT_ROW_Z]}
          onActivate={() =>
            stage().focusOn(`project:${project.slug}`, "project", project.slug)
          }
        />
      ))}

      {/* Left wall: game cabinets, the broken one, and the secret one. */}
      {ROOM_GAMES.map((game, i) => (
        <Cabinet
          key={game}
          id={`game:${game}`}
          label={dict.games.list[game].name}
          color={gameColor(game)}
          position={[GAME_WALL_X, 0, gameZ(i)]}
          rotation={Math.PI / 2}
          onActivate={() => launchGame(game)}
        />
      ))}
      <Cabinet
        id="out-of-order"
        label={booted ? dict.games.list["tech-catcher"].name : "???"}
        color={booted ? TONE_HEX.teal : "#8a8f98"}
        broken={!booted}
        position={[GAME_WALL_X, 0, gameZ(3)]}
        rotation={Math.PI / 2}
        onActivate={() => {
          if (booted) return launchGame("tech-catcher")
          taps.current += 1
          sfx.hit()
          if (taps.current >= 5) {
            setBooted(true)
            discover("out-of-order")
          }
        }}
      />
      {secretOpen && (
        <Cabinet
          id="game:friday-night"
          label={dict.games.list["friday-night"].name}
          color={gameColor("friday-night")}
          position={[GAME_WALL_X, 0, gameZ(4)]}
          rotation={Math.PI / 2}
          onActivate={() => launchGame("friday-night")}
        />
      )}

      <CrtDesk
        onDesk={() => stage().focusOn("desk", "about")}
        onScreen={() => {
          stage().focusOn("desk")
          stage().setTerminal(true)
        }}
      />
      <ScoreBoard
        skills={data.skills}
        onActivate={() => stage().focusOn("skills", "skills")}
      />
      <BlogRack
        posts={data.posts}
        onActivate={() => stage().focusOn("blog", "blog")}
      />
      <Payphone onActivate={() => stage().focusOn("contact", "contact")} />
      <Printer onActivate={() => stage().focusOn("resume", "resume")} />
      <RoofCat
        onActivate={() => {
          stage().focusOn("roof")
          discover("neon-cat")
        }}
      />

      <Suspense fallback={null}>
        <PhysicsToy />
      </Suspense>

      <ContactShadows
        position={[0, 0.01, 0]}
        scale={20}
        far={3}
        blur={2.5}
        opacity={0.35}
        resolution={512}
        frames={1}
      />
    </group>
  )
}

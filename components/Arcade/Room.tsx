"use client"

import {
  ContactShadows,
  Environment,
  Lightformer,
  Sparkles,
} from "@react-three/drei"
import { lazy, Suspense, useRef, useState } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import { sfx } from "@/lib/audio/sfx"
import { useDiscover } from "@/lib/hooks/useDiscover"
import { allQuestsFound, useQuests } from "@/lib/store/quests"
import type { GameId } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"
import { launchGame } from "./actions"
import type { ArcadeData } from "./arcade.types"
import Cabinet from "./Cabinet"
import { Drone, PowerBlock, SpinningCoin } from "./Decor"
import Floor from "./Floor"
import { GAME_WALL_X, gameZ, PROJECT_ROW_Z, projectX } from "./hotspots"
import Mascot from "./Mascot"
import { usePalette } from "./palette"
import {
  BlogRack,
  CrtDesk,
  NeonCat,
  Payphone,
  Printer,
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
  const { dict } = useDictionary()
  const discover = useDiscover()
  const secretOpen = useQuests((s) => allQuestsFound(s.found))
  const taps = useRef(0)
  const [booted, setBooted] = useState(false)
  const tier = useStage((s) => s.tier)
  const stage = useStage.getState

  const gameColors: Record<string, string> = {
    "tech-catcher": palette.cyan,
    "bug-blaster": palette.purple,
    "neon-drive": palette.pink,
    "friday-night": palette.yellow,
  }

  return (
    <group>
      <ambientLight intensity={0.55} color={palette.purple} />
      <hemisphereLight args={[palette.cyan, palette.pink, 0.35]} />
      <pointLight
        position={[0, 5, 2]}
        intensity={25}
        color={palette.pink}
        distance={18}
      />
      <pointLight
        position={[-5, 4, -3]}
        intensity={15}
        color={palette.cyan}
        distance={14}
      />
      {/* Key lights: the project row and the game wall get a soft white wash. */}
      <Spot position={[0, 6.2, 0.5]} target={[0, 1.2, PROJECT_ROW_Z]} />
      <Spot
        position={[-4.5, 6.2, -1]}
        target={[GAME_WALL_X, 1.2, -1.5]}
        intensity={45}
      />
      <Spot position={[4.5, 6, 2.5]} target={[3.3, 0.8, 2.4]} intensity={30} />

      {/* Neon reflections for the PBR models, rendered once from light cards (no HDR download). */}
      <Environment frames={1} resolution={256} environmentIntensity={1}>
        <color attach="background" args={["#05020c"]} />
        <Lightformer
          form="rect"
          intensity={4}
          color={palette.pink}
          position={[0, 5, -6]}
          scale={[12, 1, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color={palette.cyan}
          position={[-8, 3, 0]}
          rotation-y={Math.PI / 2}
          scale={[10, 1, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color={palette.purple}
          position={[8, 3, 0]}
          rotation-y={-Math.PI / 2}
          scale={[10, 1, 1]}
        />
        <Lightformer
          form="circle"
          intensity={2}
          color="#ffffff"
          position={[0, 8, 4]}
          rotation-x={Math.PI / 2}
          scale={4}
        />
      </Environment>

      <Floor />
      <Walls />

      {/* Center: one cabinet per project. Adding an MDX file adds a cabinet. */}
      {data.projects.map((project, i) => (
        <Cabinet
          key={project.slug}
          id={`project:${project.slug}`}
          label={project.title}
          color={project.color}
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
          color={gameColors[game]}
          position={[GAME_WALL_X, 0, gameZ(i)]}
          rotation={Math.PI / 2}
          onActivate={() => launchGame(game)}
        />
      ))}
      <Cabinet
        id="out-of-order"
        label={booted ? dict.games.list["tech-catcher"].name : "???"}
        color={booted ? palette.cyan : "#5a4a6a"}
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
          color={palette.yellow}
          position={[GAME_WALL_X, 0, gameZ(4)]}
          rotation={Math.PI / 2}
          onActivate={() => launchGame("friday-night")}
        />
      )}

      {ROOM_GAMES.map((game, i) => (
        <SpinningCoin
          key={game}
          hoverId={`game:${game}`}
          position={[GAME_WALL_X + 0.05, 2.75, gameZ(i)]}
        />
      ))}

      <Mascot />
      <PowerBlock position={[0, 3.7, PROJECT_ROW_Z - 0.6]} />
      <Drone />
      {tier !== "low" && (
        <Sparkles
          count={tier === "high" ? 90 : 45}
          scale={[17, 5.5, 14]}
          position={[0, 3, 0]}
          size={2.2}
          speed={0.25}
          opacity={0.55}
          color={palette.cyan}
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
      <NeonCat
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
        opacity={0.55}
        resolution={512}
        frames={1}
      />
    </group>
  )
}

function Spot({
  position,
  target,
  intensity = 60,
}: {
  position: [number, number, number]
  target: [number, number, number]
  intensity?: number
}) {
  const [light] = useState(() => new THREE.SpotLight())
  return (
    <>
      <primitive
        object={light}
        position={position}
        intensity={intensity}
        color="#ffe9f6"
        angle={0.62}
        penumbra={0.9}
        distance={16}
        decay={1.6}
      />
      <primitive object={light.target} position={target} />
    </>
  )
}

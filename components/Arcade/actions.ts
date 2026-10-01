import { sfx } from "@/lib/audio/sfx"
import type { GameId } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"

export type NavTarget =
  | "overview"
  | "projects"
  | "games"
  | "blog"
  | "about"
  | "skills"
  | "contact"
  | "resume"
  | "physics"
  | "terminal"

/** One place that maps a destination to camera focus + panel. Used by HUD nav, terminal and hotspots. */
export function go(target: NavTarget) {
  const stage = useStage.getState()
  stage.setTerminal(target === "terminal")
  switch (target) {
    case "overview":
      return stage.focusOn("overview")
    case "projects":
      return stage.focusOn("projects", "project")
    case "games":
      return stage.focusOn("games", "games")
    case "blog":
      return stage.focusOn("blog", "blog")
    case "about":
      return stage.focusOn("desk", "about")
    case "skills":
      return stage.focusOn("skills", "skills")
    case "contact":
      return stage.focusOn("contact", "contact")
    case "resume":
      return stage.focusOn("resume", "resume")
    case "physics":
      return stage.focusOn("physics")
    case "terminal":
      return stage.focusOn("desk")
  }
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Dolly into the cabinet screen, then crossfade into the game. */
export function launchGame(game: GameId) {
  const stage = useStage.getState()
  stage.focusOn(`game:${game}`)
  sfx.coin()
  setTimeout(() => useStage.getState().setGame(game), reducedMotion() ? 0 : 750)
}

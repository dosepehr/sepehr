import type { GameDef } from "../engine/types"
import { init, step, type NeonDriveState } from "./logic"

/** Rendered in 3D by components/Arcade/NeonDriveScene, which reads `driveRef`. */
const NeonDrive: GameDef<NeonDriveState> = { width: 0, height: 0, init, step }

export const driveRef: { current: NeonDriveState | null } = { current: null }

export default NeonDrive

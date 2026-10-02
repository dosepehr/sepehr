"use client"

import { Sparkles, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import {
  interactables,
  nearestInteractable,
  player,
} from "@/components/World/interactables"
import { marioSfx } from "@/lib/audio/mario"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useMario } from "@/lib/store/mario"
import { useStage } from "@/lib/store/stage"
import { bumpHandlers, hero } from "./events"
import {
  BONUS_EXIT,
  CHECKPOINTS,
  FLAGPOLE,
  FLAG_HEIGHT,
  KILL_Y,
  SECRET_PIPE,
  UNDERGROUND_Y,
  type Level,
  type PipeDef,
} from "./level"
import { BODY, stepBody } from "./physics"

export const MARIO_MODELS = {
  "8bit": "/models/mario-8bit.glb",
  "3d": "/models/mario-3d.glb",
} as const

/** How each model sits: scale, lift to put its feet at y=0, and yaw so it faces +z. */
const FIT = {
  "8bit": { scale: 1.15, lift: 0.56 * 1.15, yaw: Math.PI / 2 },
  "3d": { scale: 0.85, lift: 1.09 * 0.85, yaw: Math.PI },
}

const WALK = 4
const RUN = 7.5
const JUMP = 10.5
const GRAVITY = 26
const REACH = 1.3

const keys = new Set<string>()
const typing = (e: Event) =>
  !!(e.target as HTMLElement | null)?.closest(
    "input, textarea, [contenteditable]"
  )

/** Camera rig: yaw orbits around the hero, zoom scales the offset. */
export const camRig = { yaw: 0, zoom: 1 }

let pendingWarp: PipeDef | null = null
/** Pipes call this on E/click; the controller decides between a warp and a direct open. */
export function requestWarp(def: PipeDef) {
  pendingWarp = def
}

function openPipe(def: PipeDef) {
  if (def.target === "secret" || def.target === "exit") return
  useStage.getState().focusOn(`project:${def.target}`, "project", def.target)
}

/**
 * The hero: WASD / arrows to move, Shift to run, Space to jump (hold for higher),
 * S / ↓ on a pipe to go down it, E to use things, C to change costume.
 */
export default function MarioPlayer({ level }: { level: Level }) {
  const reduced = usePrefersReducedMotion()
  const costume = useMario((s) => s.costume)
  const { scene } = useGLTF(MARIO_MODELS[costume])
  const model = useMemo(() => {
    const m = scene.clone(true)
    m.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        const mat = (o.material as THREE.MeshStandardMaterial).clone()
        mat.roughness = 0.75
        mat.metalness = 0
        o.material = mat
      }
    })
    return m
  }, [scene])
  const fit = FIT[costume]
  const canvas = useThree((s) => s.gl.domElement)
  const root = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const camPos = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())
  const started = useRef(false)
  const anim = useRef({
    walk: 0,
    squash: 0,
    stride: 0,
    facing: 0,
    flag: -1,
    warp: -1,
    warpDef: null as PipeDef | null,
  })
  const jumpHeld = useRef(false)

  // Keyboard.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return
      const st = useStage.getState()
      if (st.game || st.panel || st.terminalOpen) return
      const k = e.key.toLowerCase()
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k))
        e.preventDefault()
      if (k === "e" || k === "enter") {
        if (st.nearby) interactables.get(st.nearby)?.activate()
        return
      }
      if (k === "c") {
        const next = useMario.getState().costume === "8bit" ? "3d" : "8bit"
        useMario.getState().setCostume(next)
        marioSfx.powerUpAppear()
        return
      }
      keys.add(k)
    }
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
    const clear = () => keys.clear()
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clear)
      keys.clear()
    }
  }, [])

  // Drag to orbit, wheel to zoom.
  useEffect(() => {
    let drag: { x: number; yaw: number } | null = null
    const down = (e: PointerEvent) => (drag = { x: e.clientX, yaw: camRig.yaw })
    const move = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      if (Math.abs(dx) > 4) camRig.yaw = drag.yaw - dx * 0.005
    }
    const up = () => (drag = null)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      camRig.zoom = THREE.MathUtils.clamp(
        camRig.zoom * (1 + e.deltaY * 0.001),
        0.5,
        1.8
      )
    }
    canvas.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    canvas.addEventListener("wheel", wheel, { passive: false })
    return () => {
      canvas.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      canvas.removeEventListener("wheel", wheel)
    }
  }, [canvas])

  const teleport = (x: number, y: number, z: number) => {
    const b = hero.body
    b.x = x
    b.y = y
    b.z = z
    b.vx = b.vy = b.vz = 0
    b.grounded = false
    camPos.current.set(x, y + 4, z + 12)
    lookAt.current.set(x, y + 1.4, z)
  }

  useFrame(({ clock, camera, scene: world }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const b = hero.body
    const a = anim.current
    const st = useStage.getState()
    const paused = !!st.game || !!st.panel || st.terminalOpen
    if (!started.current) {
      started.current = true
      camPos.current.copy(camera.position)
      lookAt.current.set(b.x, b.y + 1, b.z)
    }
    hero.hurt = Math.max(0, hero.hurt - dt)
    hero.star = Math.max(0, hero.star - dt)

    // ---- Pipe requests (E / click on a pipe).
    if (pendingWarp) {
      const def = pendingWarp
      pendingWarp = null
      const onTop = b.ground === def.id
      if (onTop && a.warp < 0) {
        a.warp = 0
        a.warpDef = def
        hero.locked = true
        marioSfx.pipe()
      } else if (def.target !== "secret" && def.target !== "exit") openPipe(def)
      else if (!onTop) marioSfx.bump()
    }

    // ---- Cutscene: sliding into a pipe.
    if (a.warp >= 0 && a.warpDef) {
      a.warp += dt
      const def = a.warpDef
      b.x += (def.position[0] - b.x) * Math.min(1, dt * 10)
      b.z += (def.position[2] - b.z) * Math.min(1, dt * 10)
      b.y = def.position[1] + def.height - a.warp * 2.2
      if (a.warp > 0.8) {
        a.warp = -1
        hero.locked = false
        if (def.target === "secret")
          teleport(BONUS_EXIT[0] - 3, UNDERGROUND_Y + 0.5, 1.5)
        else if (def.target === "exit") {
          teleport(SECRET_PIPE[0], SECRET_PIPE[1] + 1.4, SECRET_PIPE[2])
          marioSfx.pipe()
        } else {
          b.y = def.position[1] + def.height
          openPipe(def)
        }
      }
    }

    // ---- Cutscene: flagpole slide.
    if (a.flag >= 0) {
      a.flag += dt
      b.x = FLAGPOLE[0] - 0.45
      b.z = FLAGPOLE[2]
      b.y = Math.max(1, b.y - dt * 6)
      if (a.flag > 2.2) {
        a.flag = -1
        hero.locked = false
        b.x = FLAGPOLE[0] + 1.2
        useStage.getState().focusOn("overview", "contact")
      }
    }
    const dx0 = b.x - FLAGPOLE[0]
    const dz0 = b.z - FLAGPOLE[2]
    if (
      a.flag < 0 &&
      !hero.locked &&
      dx0 * dx0 + dz0 * dz0 < 0.5 &&
      b.y < FLAG_HEIGHT + 1 &&
      b.y > 0.9
    ) {
      a.flag = 0
      hero.locked = true
      b.vx = b.vz = b.vy = 0
      const bonus = Math.round(Math.max(1, b.y) * 400)
      useMario.getState().addScore(bonus)
      useMario.getState().clear()
      marioSfx.flagpole()
      setTimeout(() => marioSfx.fanfare(), 1100)
      const flag = world.getObjectByName("flag")
      if (flag) flag.userData.lowered = true
      window.dispatchEvent(new CustomEvent("mario:clear", { detail: bonus }))
    }

    // ---- Input → camera-relative velocity.
    let ix = 0
    let iz = 0
    if (!paused && !hero.locked) {
      if (keys.has("a") || keys.has("arrowleft")) ix -= 1
      if (keys.has("d") || keys.has("arrowright")) ix += 1
      if (keys.has("w") || keys.has("arrowup")) iz -= 1
      if (keys.has("s") || keys.has("arrowdown")) iz += 1
    }
    // Down on a pipe: go in.
    if (
      !paused &&
      !hero.locked &&
      (keys.has("s") || keys.has("arrowdown")) &&
      b.grounded
    ) {
      const pipe = level.pipes.find((p) => p.id === b.ground)
      if (pipe) {
        keys.delete("s")
        keys.delete("arrowdown")
        requestWarp(pipe)
        ix = iz = 0
      }
    }
    const sin = Math.sin(camRig.yaw)
    const cos = Math.cos(camRig.yaw)
    let dx = ix * cos + iz * sin
    let dz = -ix * sin + iz * cos
    const len = Math.hypot(dx, dz)
    if (len > 0) {
      dx /= len
      dz /= len
    }
    const running = keys.has("shift")
    const speed = len > 0 ? (running ? RUN : WALK) : 0
    if (!hero.locked) {
      const k = Math.min(1, dt * (b.grounded ? 12 : 4))
      b.vx += (dx * speed - b.vx) * k
      b.vz += (dz * speed - b.vz) * k
    }

    // ---- Jump: hold for full height, release early for a hop.
    const jump = !paused && !hero.locked && keys.has(" ")
    if (jump && !jumpHeld.current && b.grounded) {
      b.vy = JUMP + (running ? 1.2 : 0)
      b.grounded = false
      if (running) marioSfx.highJump()
      else marioSfx.jump()
      a.squash = -0.25
    }
    if (!jump && b.vy > 4 && jumpHeld.current) b.vy *= 0.55
    jumpHeld.current = jump

    // ---- Physics.
    if (a.warp < 0 && a.flag < 0) {
      if (!paused) {
        b.vy -= GRAVITY * dt
        const before = { x: b.x, z: b.z }
        const r = stepBody(b, level.solids, dt)
        if (r.bumped?.id) {
          const handler = bumpHandlers.get(r.bumped.id)
          if (handler) handler()
          else marioSfx.bump()
        } else if (r.bumped) marioSfx.bump()
        if (r.landed) {
          marioSfx.land()
          a.squash = 0.3
        }
        // Footsteps.
        const moved = Math.hypot(b.x - before.x, b.z - before.z)
        if (b.grounded && moved > 0) {
          a.stride += moved
          if (a.stride > (running ? 1.3 : 0.85)) {
            a.stride = 0
            marioSfx.step()
          }
        }
        a.walk = moved / dt
      } else a.walk = 0
    }

    // ---- Checkpoints and falling.
    for (let i = CHECKPOINTS.length - 1; i > hero.checkpoint; i--)
      if (b.x > CHECKPOINTS[i][0] && b.y > -1) hero.checkpoint = i
    const underground = b.y < UNDERGROUND_Y + 10
    if ((b.y < KILL_Y && !underground) || b.y < UNDERGROUND_Y - 8) {
      marioSfx.fall()
      const [cx, cy, cz] = CHECKPOINTS[hero.checkpoint]
      teleport(cx, cy, cz)
      hero.hurt = 1.5
    }

    // ---- Facing + procedural animation (the models aren't rigged).
    if (len > 0 && !hero.locked) {
      const target = Math.atan2(dx, dz)
      let d = target - a.facing
      d = Math.atan2(Math.sin(d), Math.cos(d))
      a.facing += d * Math.min(1, dt * 14)
    }
    a.squash += (0 - a.squash) * Math.min(1, dt * 10)
    const g = root.current
    const m = inner.current
    if (g && m) {
      g.position.set(b.x, b.y, b.z)
      g.rotation.y = a.facing
      const t = clock.elapsedTime
      const moving = b.grounded && a.walk > 0.5
      const cadence = running ? 18 : 12
      const sq = 1 - a.squash
      m.scale.set(
        fit.scale / Math.sqrt(sq),
        fit.scale * sq,
        fit.scale / Math.sqrt(sq)
      )
      m.position.y =
        fit.lift * sq +
        (moving && !reduced ? Math.abs(Math.sin(t * cadence)) * 0.12 : 0)
      m.rotation.z = moving && !reduced ? Math.sin(t * cadence) * 0.12 : 0
      m.rotation.x = moving ? (running ? 0.18 : 0.08) : !b.grounded ? -0.12 : 0
      // Blink while invulnerable.
      g.visible = hero.hurt <= 0 || Math.floor(t * 12) % 2 === 0
    }

    // ---- Shared state for the "press E" prompt and the HUD.
    player.position.set(b.x, b.y, b.z)
    const nearby =
      paused || hero.locked
        ? st.nearby
        : nearestInteractable(player.position, REACH, t0(clock))
    if (nearby !== st.nearby) {
      if (nearby) marioSfx.select()
      st.setNearby(nearby)
    }

    // ---- Follow camera: a side-on, slightly high view like a 2.5D platformer.
    const dist = 12 * camRig.zoom
    const height = 4.2 * camRig.zoom
    const desired = new THREE.Vector3(
      b.x + Math.sin(camRig.yaw) * dist,
      b.y + height,
      b.z + Math.cos(camRig.yaw) * dist
    )
    const ck = reduced ? 1 : 1 - Math.exp(-dt * 4)
    camPos.current.lerp(desired, ck)
    lookAt.current.lerp(
      new THREE.Vector3(b.x, b.y + 1.4, b.z),
      reduced ? 1 : 1 - Math.exp(-dt * 8)
    )
    camera.position.copy(camPos.current)
    camera.lookAt(lookAt.current)
  })

  return (
    <group ref={root}>
      <group rotation-y={fit.yaw}>
        <group ref={inner}>
          <primitive object={model} />
        </group>
      </group>
      {/* Star power: sparkles around the hero. */}
      <StarAura />
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[BODY.radius + 0.1, 24]} />
        <meshBasicMaterial
          color="#000"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

const t0 = (clock: THREE.Clock) => clock.elapsedTime

function StarAura() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.visible = hero.star > 0
  })
  return (
    <group ref={ref} visible={false}>
      <Sparkles
        count={40}
        scale={[1.4, 2, 1.4]}
        position-y={0.9}
        size={5}
        speed={2}
        color="#fbd000"
      />
      <pointLight position-y={1} intensity={6} distance={5} color="#fff3a0" />
    </group>
  )
}

useGLTF.preload(MARIO_MODELS["8bit"])
useGLTF.preload(MARIO_MODELS["3d"])

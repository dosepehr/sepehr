"use client"

import { useAnimations, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js"
import { MODELS } from "@/components/Arcade/models"
import { usePalette } from "@/components/Arcade/palette"
import { sfx } from "@/lib/audio/sfx"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"
import { allRelicsFound, useWorld } from "@/lib/store/world"
import { interactables, nearestInteractable, player } from "./interactables"
import { resolve, TELEPORTS, type Colliders } from "./layout"

const SCALE = 0.3
const RADIUS = 0.32
const WALK = 2.8
const RUN = 6
const JUMP = 5.2
const GRAVITY = 16
const REACH = 1.1

/** Movement keys; held state lives here, not in React. */
const keys = new Set<string>()
const MOVE_KEYS = [
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  " ",
  "shift",
]

function typing(e: Event) {
  return !!(e.target as HTMLElement | null)?.closest(
    "input, textarea, [contenteditable]"
  )
}

/** Camera rig state: yaw orbits around the player, zoom scales the offset. */
export const view = { yaw: 0, zoom: 1, target: null as THREE.Vector3 | null }

/** Click-to-move: walk toward a point on the ground. */
export function walkTo(point: THREE.Vector3) {
  view.target = point.clone()
}

/**
 * The player's robot: WASD / arrows to walk, Shift to run, Space to jump,
 * E to use whatever is nearby, B to dance. Click the ground to walk there.
 */
export default function Player({ colliders }: { colliders: Colliders }) {
  const palette = usePalette()
  const reduced = usePrefersReducedMotion()
  const canvas = useThree((s) => s.gl.domElement)
  const { scene, animations } = useGLTF(MODELS.robot)
  const model = useMemo(() => cloneSkinned(scene), [scene])
  const root = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, root)
  const current = useRef<string>("")
  const stride = useRef(0)
  const lookAt = useRef(new THREE.Vector3())
  const camPos = useRef(new THREE.Vector3())
  const emote = useRef(0)
  const teleportCooldown = useRef(0)
  const attractIn = useRef(2)
  const golden = useWorld((s) => allRelicsFound(s.relics))

  // Own paint so the player reads differently from BYTE the host: pink body, cyan visor.
  useLayoutEffect(() => {
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.castShadow = false
      const m = (o.material as THREE.MeshStandardMaterial).clone()
      if (m.name === "Main") {
        m.color.set(golden ? "#ffcc33" : palette.pink)
        m.metalness = golden ? 0.95 : 0.35
        m.roughness = golden ? 0.2 : 0.35
      }
      if (m.name === "Black") {
        m.emissive.set(palette.cyan)
        m.emissiveIntensity = 0.5
      }
      o.material = m
    })
  }, [model, palette, golden])

  const play = (name: string, fade = 0.2) => {
    if (current.current === name) return
    const next = actions[name]
    if (!next) return
    actions[current.current]?.fadeOut(fade)
    next.reset().fadeIn(fade).play()
    current.current = name
  }

  useEffect(() => {
    play("Idle")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  // Keyboard.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (typing(e) || useStage.getState().game || useStage.getState().panel)
        return
      const k = e.key.toLowerCase()
      if (MOVE_KEYS.includes(k)) {
        if (k === " " || k.startsWith("arrow")) e.preventDefault()
        keys.add(k)
        view.target = null
      } else if (k === "e" || k === "enter") {
        const id = useStage.getState().nearby
        if (id) {
          if (id === "physics") {
            // The Jenga table: lob a ball at the tower from where you stand.
            window.dispatchEvent(
              new CustomEvent("arcade:fire", {
                detail: { from: player.position.clone().setY(1.4) },
              })
            )
          } else interactables.get(id)?.activate()
        }
      } else if (k === "b") {
        emote.current = 3.3
        play("Dance", 0.3)
      } else if (k === "h") {
        emote.current = 1.6
        play("Wave", 0.2)
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  // Drag to orbit the camera, wheel to zoom.
  useEffect(() => {
    let drag: { x: number; yaw: number } | null = null
    const down = (e: PointerEvent) => {
      if (e.button === 0 || e.button === 2)
        drag = { x: e.clientX, yaw: view.yaw }
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      if (Math.abs(dx) > 4) view.yaw = drag.yaw - dx * 0.006
    }
    const up = () => (drag = null)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      view.zoom = THREE.MathUtils.clamp(
        view.zoom * (1 + e.deltaY * 0.001),
        0.55,
        1.7
      )
    }
    const menu = (e: Event) => e.preventDefault()
    canvas.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    canvas.addEventListener("wheel", wheel, { passive: false })
    canvas.addEventListener("contextmenu", menu)
    return () => {
      canvas.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      canvas.removeEventListener("wheel", wheel)
      canvas.removeEventListener("contextmenu", menu)
    }
  }, [canvas])

  const started = useRef(false)

  useFrame(({ clock, camera }, rawDt) => {
    // Start the camera where it is (the intro glide), aimed at the player.
    if (!started.current) {
      started.current = true
      camPos.current.copy(camera.position)
      lookAt.current.copy(player.position)
    }
    const dt = Math.min(rawDt, 1 / 30)
    const g = root.current
    if (!g) return
    const stage = useStage.getState()
    const paused = !!stage.game || !!stage.panel || stage.terminalOpen

    // --- Input to a camera-relative direction.
    let ix = 0
    let iz = 0
    if (!paused) {
      if (keys.has("w") || keys.has("arrowup")) iz -= 1
      if (keys.has("s") || keys.has("arrowdown")) iz += 1
      if (keys.has("a") || keys.has("arrowleft")) ix -= 1
      if (keys.has("d") || keys.has("arrowright")) ix += 1
    }
    const sin = Math.sin(view.yaw)
    const cos = Math.cos(view.yaw)
    let dx = ix * cos + iz * sin
    let dz = -ix * sin + iz * cos
    // Click-to-move target.
    if (view.target && !ix && !iz && !paused) {
      dx = view.target.x - player.position.x
      dz = view.target.z - player.position.z
      if (Math.hypot(dx, dz) < 0.25) view.target = null
    }
    const len = Math.hypot(dx, dz)
    const moving = len > 0.01
    if (moving) {
      dx /= len
      dz /= len
    }
    const run = keys.has("shift") || (!!view.target && len > 6)
    player.running = run && moving
    const speed = moving ? (run ? RUN : WALK) : 0

    // --- Horizontal motion with easing, then collisions.
    const k = Math.min(1, dt * 10)
    player.velocity.x += (dx * speed - player.velocity.x) * k
    player.velocity.z += (dz * speed - player.velocity.z) * k
    const before = player.position.clone()
    player.position.x += player.velocity.x * dt
    player.position.z += player.velocity.z * dt
    if (
      resolve(player.position, RADIUS, colliders) &&
      moving &&
      Math.random() < dt * 3
    )
      sfx.bump()

    // --- Jump & gravity.
    if (!paused && keys.has(" ") && player.grounded) {
      player.velocity.y = JUMP
      player.grounded = false
      sfx.jump()
      play(moving ? "WalkJump" : "Jump", 0.1)
    }
    if (!player.grounded) {
      player.velocity.y -= GRAVITY * dt
      player.position.y += player.velocity.y * dt
      if (player.position.y <= 0) {
        player.position.y = 0
        player.velocity.y = 0
        player.grounded = true
        sfx.land()
      }
    }

    // --- Facing and animation.
    const travelled = Math.hypot(
      player.position.x - before.x,
      player.position.z - before.z
    )
    if (moving) {
      const targetYaw = Math.atan2(dx, dz)
      let delta = targetYaw - player.facing
      delta = Math.atan2(Math.sin(delta), Math.cos(delta))
      player.facing += delta * Math.min(1, dt * 12)
      emote.current = 0
    }
    emote.current = Math.max(0, emote.current - dt)
    if (player.grounded && emote.current <= 0) {
      if (travelled / dt > 3.6) play("Running")
      else if (travelled / dt > 0.4) play("Walking")
      else play("Idle")
    }
    const act = actions[current.current]
    if (act && (current.current === "Walking" || current.current === "Running"))
      act.setEffectiveTimeScale(
        THREE.MathUtils.clamp(
          travelled / dt / (current.current === "Running" ? 5.5 : 2.6),
          0.6,
          1.4
        )
      )

    // --- Footsteps by distance walked.
    if (player.grounded && travelled > 0) {
      stride.current += travelled
      const length = player.running ? 1.25 : 0.75
      if (stride.current > length) {
        stride.current = 0
        sfx.step(player.running)
      }
    }

    g.position.copy(player.position)
    g.rotation.y = player.facing

    // --- Teleport pads.
    teleportCooldown.current = Math.max(0, teleportCooldown.current - dt)
    if (teleportCooldown.current === 0 && player.grounded) {
      TELEPORTS.forEach(([x, z], i) => {
        if (Math.hypot(player.position.x - x, player.position.z - z) < 0.8) {
          const [tx, tz] = TELEPORTS[1 - i]
          player.position.set(tx, 0, tz + 1.4)
          player.velocity.set(0, 0, 0)
          view.target = null
          teleportCooldown.current = 1.5
          sfx.teleport()
          camPos.current.set(tx, 6, tz + 9)
        }
      })
    }

    // --- Nearest interactable (for the E prompt).
    const nearby = paused
      ? stage.nearby
      : nearestInteractable(player.position, REACH, clock.elapsedTime)
    if (nearby !== stage.nearby) {
      if (nearby) sfx.prompt()
      stage.setNearby(nearby)
    }

    // --- Attract-mode bleeps from nearby cabinets.
    attractIn.current -= dt
    if (attractIn.current <= 0) {
      attractIn.current = 2 + Math.random() * 2
      let best = 5
      for (const [id, it] of interactables) {
        if (!id.startsWith("game:") && !id.startsWith("project:")) continue
        if (it.box.isEmpty()) continue
        const c = it.box.getCenter(new THREE.Vector3())
        best = Math.min(
          best,
          Math.hypot(c.x - player.position.x, c.z - player.position.z)
        )
      }
      if (best < 4.5) sfx.attract(1 - best / 4.5)
    }

    // --- Follow camera: high and behind, like a diorama.
    const dist = 8.5 * view.zoom
    const height = 6.2 * view.zoom
    const desired = new THREE.Vector3(
      player.position.x + Math.sin(view.yaw) * dist,
      Math.max(1.5, player.position.y * 0.3 + height),
      player.position.z + Math.cos(view.yaw) * dist
    )
    const ck = reduced ? 1 : 1 - Math.exp(-dt * 3.2)
    camPos.current.lerp(desired, ck)
    lookAt.current.lerp(
      new THREE.Vector3(
        player.position.x,
        player.position.y * 0.5 + 1.1,
        player.position.z
      ),
      reduced ? 1 : 1 - Math.exp(-dt * 6)
    )
    camera.position.copy(camPos.current)
    camera.lookAt(lookAt.current)
  })

  return (
    <group ref={root} position={player.position.toArray()}>
      <group scale={SCALE}>
        <primitive object={model} />
      </group>
      {/* Soft blob shadow. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.015}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial
          color="#000"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[0.46, 0.5, 40]} />
        <meshBasicMaterial
          color={new THREE.Color(palette.pink).multiplyScalar(1.6)}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

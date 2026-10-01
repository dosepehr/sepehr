"use client"

import { Html, useAnimations, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import Hotspot, { useIsHovered } from "./Hotspot"
import { MODELS } from "./models"
import { usePalette } from "./palette"

const POSITION: [number, number, number] = [3.3, 0, 2.4]
const SCALE = 0.34
/** One emote per speech line, in order. */
const EMOTES = ["Wave", "ThumbsUp", "Yes", "No", "Jump", "Dance"] as const

/**
 * BYTE, the arcade's host robot. Idles, follows the pointer with its head,
 * waves when hovered and answers clicks with a line and an emote.
 */
export default function Mascot() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const reduced = usePrefersReducedMotion()
  const hovered = useIsHovered("mascot")
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODELS.robot)
  const { actions, mixer } = useAnimations(animations, group)
  const [line, setLine] = useState<number | null>(null)
  const count = useRef(0)
  const look = useRef(new THREE.Vector2())
  // What we last added to the head, and the rotation we left it at.
  const headOffset = useRef({ x: 0, y: 0, leftX: NaN, leftY: NaN })

  const { head, face } = useMemo(() => {
    let head: THREE.Bone | undefined
    let face: THREE.Mesh | undefined
    scene.traverse((o) => {
      if (o instanceof THREE.Bone && o.name === "Head") head ??= o
      if (o instanceof THREE.Mesh && o.morphTargetDictionary?.Surprised != null)
        face = o
    })
    return { head, face }
  }, [scene])

  // Glossier paint so the environment shows up on it; the eyes glow a little.
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.MeshStandardMaterial
      if (m.name === "Main") {
        m.roughness = 0.3
        m.metalness = 0.35
      }
      if (m.name === "Black") {
        m.emissive.set(palette.cyan)
        m.emissiveIntensity = 0.25
      }
    })
  }, [scene, palette.cyan])

  const play = (name: string, once: boolean) => {
    const next = actions[name]
    if (!next) return
    Object.values(actions).forEach((a) => a !== next && a?.fadeOut(0.25))
    next.reset().fadeIn(0.25)
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity)
    next.clampWhenFinished = once
    next.play()
  }

  // Idle by default; one-shot emotes fall back to it when they finish.
  useEffect(() => {
    play("Idle", false)
    const back = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== actions.Idle) play("Idle", false)
    }
    mixer.addEventListener("finished", back)
    return () => mixer.removeEventListener("finished", back)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, mixer])

  useEffect(() => {
    if (hovered && line === null && !reduced) play("Wave", true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])

  // Speech bubble timeout.
  useEffect(() => {
    if (line === null) return
    const id = setTimeout(() => setLine(null), 4200)
    return () => clearTimeout(id)
  }, [line])

  const onActivate = () => {
    const i = count.current++ % dict.hub.mascot.lines.length
    setLine(i)
    if (!reduced) {
      const emote = EMOTES[i % EMOTES.length]
      play(emote, emote !== "Dance")
      // Dance is a loop: stop it after one bar.
      if (emote === "Dance") setTimeout(() => play("Idle", false), 3300)
    }
    if (face?.morphTargetInfluences && face.morphTargetDictionary) {
      const idx = face.morphTargetDictionary.Surprised
      face.morphTargetInfluences[idx] = 1
    }
  }

  // Head follows the pointer (applied after the mixer has posed the skeleton).
  useFrame(({ pointer }, dt) => {
    const k = Math.min(1, dt * 4)
    look.current.x += (pointer.x - look.current.x) * k
    look.current.y += (pointer.y - look.current.y) * k
    if (head && !reduced) {
      const o = headOffset.current
      // A clip without a head track leaves our last pose in place: undo it first.
      if (head.rotation.x === o.leftX && head.rotation.y === o.leftY) {
        head.rotation.x -= o.x
        head.rotation.y -= o.y
      }
      o.x = -look.current.y * 0.35
      o.y = look.current.x * 0.7
      head.rotation.x += o.x
      head.rotation.y += o.y
      o.leftX = head.rotation.x
      o.leftY = head.rotation.y
    }
    if (face?.morphTargetInfluences && face.morphTargetDictionary) {
      const idx = face.morphTargetDictionary.Surprised
      face.morphTargetInfluences[idx] *= 1 - Math.min(1, dt * 1.5)
    }
  })

  const text = line === null ? null : dict.hub.mascot.lines[line]

  return (
    <group position={POSITION} rotation-y={-0.35}>
      <Hotspot id="mascot" onActivate={onActivate}>
        <group ref={group} scale={SCALE}>
          <primitive object={scene} />
        </group>
        {/* Simple hit volume instead of skinned-mesh raycasts. */}
        <mesh position={[0, 0.7, 0]} visible={false}>
          <cylinderGeometry args={[0.45, 0.45, 1.4, 12]} />
        </mesh>
      </Hotspot>
      {/* Neon pad under the robot. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <ringGeometry args={[0.42, 0.48, 48]} />
        <meshBasicMaterial
          color={new THREE.Color(palette.cyan).multiplyScalar(2.5)}
          toneMapped={false}
        />
      </mesh>
      {(text || hovered) && (
        <Html
          position={[0, 1.9, 0]}
          center
          distanceFactor={9}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="w-max max-w-64 rounded-xl border border-neon-cyan/70 bg-black/80 px-4 py-2 text-center font-mono text-sm text-neon-cyan shadow-[0_0_24px_rgba(34,229,255,0.35)]"
          >
            <span className="block text-xs tracking-widest text-neon-pink uppercase">
              {dict.hub.mascot.name}
            </span>
            {text ?? dict.hub.mascot.hint}
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload(MODELS.robot)

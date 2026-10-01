"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import Hotspot from "./Hotspot"
import Label from "./Label"
import { MODELS } from "./models"
import { usePalette } from "./palette"
import { attractFragment, screenVertex, sideArtFragment } from "./shaders"
import { useCanvasTexture } from "./useCanvasTexture"
import { useModel } from "./useModel"

export type CabinetProps = {
  id: string
  label: string
  color: string
  position: [number, number, number]
  rotation?: number
  onActivate: () => void
  /** Dead screen with an "OUT OF ORDER" sign. */
  broken?: boolean
}

// Where the CRT sits in the model (see scripts/models/build-cabinet.mjs).
const SCREEN_Y = 1.49
const SCREEN_Z = 0.29
const SCREEN_TILT = -Math.atan2(0.16, 0.72)
const MARQUEE_ASPECT = 0.97 / 0.3

/** Arcade cabinet from a GLB. Trim, screen, side art and marquee are re-skinned per cabinet. */
export default function Cabinet({
  id,
  label,
  color,
  position,
  rotation = 0,
  onActivate,
  broken,
}: CabinetProps) {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const fontVar = lang === "fa" ? "--font-fa" : "--font-display"
  const marqueeMap = useCanvasTexture(label, {
    width: Math.round(150 * MARQUEE_ASPECT),
    height: 150,
    color,
    fontSize: 54,
    fontVar,
    dir: lang === "fa" ? "rtl" : "ltr",
    background: "#0a0514",
  })

  const uniforms = useMemo(
    () => ({
      uTime: { value: (id.length * 7.3) % 10 },
      uColor: { value: new THREE.Color() },
      uBoost: { value: 0 },
    }),
    [id.length]
  )

  const materials = useMemo(
    () => ({
      screen: new THREE.ShaderMaterial({
        vertexShader: screenVertex,
        fragmentShader: attractFragment,
        uniforms,
        toneMapped: false,
      }),
      dead: new THREE.MeshStandardMaterial({
        color: "#050308",
        roughness: 0.08,
        metalness: 0.3,
      }),
      side: new THREE.ShaderMaterial({
        vertexShader: screenVertex,
        fragmentShader: sideArtFragment,
        uniforms,
      }),
      marquee: new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.5, 1.5, 1.5),
        toneMapped: false,
      }),
    }),
    [uniforms]
  )
  const slots = useMemo(
    () => ({
      Screen: broken ? materials.dead : materials.screen,
      SideArt: materials.side,
      Marquee: materials.marquee,
    }),
    [materials, broken]
  )
  const { model, hover } = useModel(MODELS.cabinet, {
    hoverId: id,
    trim: color,
    body: palette.body,
    slots,
  })
  const joystick = useMemo(() => model.getObjectByName("Joystick"), [model])

  useLayoutEffect(() => {
    uniforms.uColor.value.set(color)
    materials.marquee.map = marqueeMap
    materials.marquee.needsUpdate = true
  }, [color, marqueeMap, materials, uniforms])

  useLayoutEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials]
  )

  useFrame(({ clock }, dt) => {
    uniforms.uTime.value += dt
    const boost = (uniforms.uBoost.value = hover.current)
    if (joystick) {
      // Someone's playing: wiggle the stick while hovered.
      const t = clock.elapsedTime
      joystick.rotation.z = Math.sin(t * 11) * 0.28 * boost
      joystick.rotation.x = Math.cos(t * 7) * 0.2 * boost
    }
  })

  return (
    <Hotspot id={id} onActivate={onActivate}>
      <group position={position} rotation-y={rotation}>
        <primitive object={model} />
        {/* One cheap box for pointer hits instead of ~50 meshes. */}
        <mesh position={[0, 1.15, 0.05]} visible={false}>
          <boxGeometry args={[1.15, 2.3, 1.05]} />
        </mesh>
        {broken && (
          <Label
            text={dict.games.outOfOrder}
            size={[0.8, 0.2]}
            position={[0, SCREEN_Y, SCREEN_Z + 0.03]}
            rotation={[SCREEN_TILT, 0, 0.15]}
            options={{
              color: "#ff5c5c",
              fontSize: 40,
              height: 100,
              fontVar,
              background: "#1a0606",
            }}
          />
        )}
      </group>
    </Hotspot>
  )
}

useGLTF.preload(MODELS.cabinet)

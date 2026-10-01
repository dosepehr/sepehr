"use client"

import { useDictionary } from "@/components/DictionaryProvider"
import Label from "./Label"
import { usePalette } from "./palette"

const W = 18
const H = 6.5
const BACK_Z = -7.5
const SIDE_X = 9
const WAINSCOT = 1.2

/** Cream plaster room: wainscot, trim, a flat painted sun, and the name sign. */
export default function Walls() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const fontVar = lang === "fa" ? "--font-fa" : "--font-sans"
  const dir = lang === "fa" ? "rtl" : "ltr"

  const wall = (
    <meshStandardMaterial color={palette.wall} roughness={1} metalness={0} />
  )
  const wainscot = (
    <meshStandardMaterial color={palette.wainscot} roughness={0.9} />
  )
  const trim = <meshStandardMaterial color={palette.trim} roughness={0.8} />

  return (
    <group>
      {/* Plaster */}
      <mesh position={[0, H / 2, BACK_Z]} receiveShadow>
        <planeGeometry args={[W, H]} />
        {wall}
      </mesh>
      <mesh position={[-SIDE_X, H / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[16, H]} />
        {wall}
      </mesh>
      <mesh position={[SIDE_X, H / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[16, H]} />
        {wall}
      </mesh>

      {/* Wainscot */}
      <mesh position={[0, WAINSCOT / 2, BACK_Z + 0.01]} receiveShadow>
        <planeGeometry args={[W, WAINSCOT]} />
        {wainscot}
      </mesh>
      <mesh
        position={[-SIDE_X + 0.01, WAINSCOT / 2, 0]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[16, WAINSCOT]} />
        {wainscot}
      </mesh>
      <mesh
        position={[SIDE_X - 0.01, WAINSCOT / 2, 0]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[16, WAINSCOT]} />
        {wainscot}
      </mesh>

      {/* Rail, skirting and crown on the back wall */}
      {[WAINSCOT, 0.09, H - 0.06].map((y, i) => (
        <mesh key={y} position={[0, y, BACK_Z + 0.03]} receiveShadow>
          <boxGeometry args={[W, i === 1 ? 0.18 : i === 0 ? 0.08 : 0.12, 0.06]} />
          {trim}
        </mesh>
      ))}

      {/* Painted sun mural: flat, with wall-colored stripes cut across the lower half */}
      <group position={[0, 2.95, BACK_Z + 0.02]}>
        <mesh>
          <circleGeometry args={[1.6, 64]} />
          <meshStandardMaterial color={palette.mural} roughness={1} />
        </mesh>
        {[
          [-0.25, 0.07],
          [-0.55, 0.11],
          [-0.85, 0.15],
          [-1.15, 0.19],
        ].map(([y, h]) => (
          <mesh key={y} position={[0, y, 0.005]}>
            <planeGeometry args={[3.4, h]} />
            {wall}
          </mesh>
        ))}
      </group>

      {/* Name sign, painted on the wall */}
      <Label
        text={dict.site.name}
        size={[7, 1.3]}
        position={[0, 5.75, BACK_Z + 0.03]}
        options={{
          fontSize: 120,
          height: 200,
          color: palette.ink,
          fontVar,
          weight: 800,
          dir,
        }}
      />
      <Label
        text={dict.site.role}
        size={[7, 0.4]}
        position={[0, 4.8, BACK_Z + 0.03]}
        options={{
          fontSize: 52,
          height: 80,
          color: palette.inkSoft,
          fontVar,
          weight: 600,
          dir,
        }}
      />
    </group>
  )
}

export { BACK_Z, H as WALL_HEIGHT, SIDE_X }

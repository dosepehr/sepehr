"use client"

import { Instance, Instances } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useDictionary } from "@/components/DictionaryProvider"
import Label from "./Label"
import { usePalette } from "./palette"
import { posterFragment, screenVertex, skylineFragment } from "./shaders"

const W = 18
const H = 6.5
const D = 16
const BACK_Z = -7.5
const SIDE_X = 9
const THICK = 0.3
/** Height of the lower wainscot panel band. */
const DADO = 1.15

const WINDOW = { w: 10, h: 3.2, y: 2.75 }

type V3 = [number, number, number]
type StripColor = "pink" | "cyan" | "purple"
// Neon strips: [position, rotation, length, color key]
type Strip = [V3, V3, number, StripColor]
const STRIPS: Strip[] = [
  [[0, 0.05, BACK_Z + 0.05], [0, 0, 0], W, "pink"],
  [[0, H - 0.1, BACK_Z + 0.05], [0, 0, 0], W, "cyan"],
  [[0, DADO, BACK_Z + 0.06], [0, 0, 0], W, "purple"],
  [[-SIDE_X + 0.05, 0.05, 0], [0, Math.PI / 2, 0], D, "purple"],
  [[SIDE_X - 0.05, 0.05, 0], [0, Math.PI / 2, 0], D, "purple"],
  [[-SIDE_X + 0.06, DADO, 0], [0, Math.PI / 2, 0], D, "pink"],
  [[SIDE_X - 0.06, DADO, 0], [0, Math.PI / 2, 0], D, "pink"],
  [[-SIDE_X + 0.05, H - 0.1, 0], [0, Math.PI / 2, 0], D, "cyan"],
  [[SIDE_X - 0.05, H - 0.1, 0], [0, Math.PI / 2, 0], D, "cyan"],
  [[-SIDE_X + 0.05, H / 2, BACK_Z + 0.05], [0, 0, Math.PI / 2], H, "pink"],
  [[SIDE_X - 0.05, H / 2, BACK_Z + 0.05], [0, 0, Math.PI / 2], H, "pink"],
  // Front cut edges of the side walls (the diorama "frame").
  [[-SIDE_X - THICK / 2, H / 2, D / 2 + 0.01], [0, 0, Math.PI / 2], H, "cyan"],
  [[SIDE_X + THICK / 2, H / 2, D / 2 + 0.01], [0, 0, Math.PI / 2], H, "cyan"],
  [[-SIDE_X - THICK / 2, H + 0.01, 0], [0, Math.PI / 2, 0], D, "pink"],
  [[SIDE_X + THICK / 2, H + 0.01, 0], [0, Math.PI / 2, 0], D, "pink"],
  [[0, H + 0.01, BACK_Z - THICK / 2], [0, 0, 0], W + THICK * 2, "pink"],
]

/** Vertical pilasters that break the side walls into bays (clear of the cabinets). */
const PILLAR_Z: Record<-1 | 1, number[]> = {
  [-1]: [-6.2, 2.9, 7.3],
  [1]: [-6.2, -2, 2.6, 6.8],
}

/** A big window in the back wall with an animated outrun panorama behind the glass. */
function Panorama() {
  const palette = usePalette()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uPink: { value: new THREE.Color() },
      uCyan: { value: new THREE.Color() },
      uPurple: { value: new THREE.Color() },
      uAspect: { value: WINDOW.w / WINDOW.h },
    }),
    []
  )
  uniforms.uTop.value.set(palette.sunTop)
  uniforms.uBottom.value.set(palette.sunBottom)
  uniforms.uPink.value.set(palette.pink)
  uniforms.uCyan.value.set(palette.cyan)
  uniforms.uPurple.value.set(palette.purple)
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })

  const frame = palette.body
  const mullions = [-WINDOW.w / 6, WINDOW.w / 6]
  return (
    <group position={[0, WINDOW.y, BACK_Z]}>
      <mesh position-z={0.01}>
        <planeGeometry args={[WINDOW.w, WINDOW.h]} />
        <shaderMaterial
          vertexShader={screenVertex}
          fragmentShader={skylineFragment}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
      {/* Frame */}
      {[
        [0, WINDOW.h / 2 + 0.08, WINDOW.w + 0.32, 0.16],
        [0, -WINDOW.h / 2 - 0.1, WINDOW.w + 0.5, 0.2],
      ].map(([x, y, w, h]) => (
        <mesh key={y} position={[x, y, 0.08]}>
          <boxGeometry args={[w, h, 0.18]} />
          <meshStandardMaterial
            color={frame}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (WINDOW.w + 0.16)) / 2, 0, 0.08]}>
          <boxGeometry args={[0.16, WINDOW.h, 0.18]} />
          <meshStandardMaterial
            color={frame}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      ))}
      {mullions.map((x) => (
        <mesh key={x} position={[x, 0, 0.05]}>
          <boxGeometry args={[0.07, WINDOW.h, 0.08]} />
          <meshStandardMaterial
            color={frame}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      ))}
      {/* Neon outline around the frame. */}
      <lineSegments position-z={0.18}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(WINDOW.w + 0.36, WINDOW.h + 0.36)]}
        />
        <lineBasicMaterial
          color={new THREE.Color(palette.cyan).multiplyScalar(3)}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}

/** Neon palm tree drawn with glowing tubes, mounted on the wall like a sign. */
function NeonPalm({
  position,
  flip = 1,
  scale = 1,
}: {
  position: V3
  flip?: 1 | -1
  scale?: number
}) {
  const palette = usePalette()
  const { trunk, fronds } = useMemo(() => {
    const trunk = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.15 * flip, 0.9, 0),
        new THREE.Vector3(0.05 * flip, 1.8, 0),
        new THREE.Vector3(-0.25 * flip, 2.6, 0),
      ]),
      32,
      0.035,
      8
    )
    const top = new THREE.Vector3(-0.25 * flip, 2.6, 0)
    const fronds = [-2.6, -1.9, -1.1, -0.35, 0.4, 1.15].map((a) => {
      const dir = new THREE.Vector3(Math.cos(a + Math.PI / 2), 0, 0)
      const len = 0.9 + Math.abs(Math.sin(a * 3)) * 0.35
      const dx = Math.sin(a) * len
      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          top.clone(),
          top.clone().add(new THREE.Vector3(dx * 0.5, 0.35, dir.z)),
          top.clone().add(new THREE.Vector3(dx, -0.15 - Math.abs(dx) * 0.3, 0)),
        ]),
        20,
        0.028,
        6
      )
    })
    return { trunk, fronds }
  }, [flip])

  return (
    <group position={position} scale={scale}>
      <mesh geometry={trunk}>
        <meshBasicMaterial
          color={new THREE.Color(palette.pink).multiplyScalar(1.7)}
          toneMapped={false}
        />
      </mesh>
      {fronds.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial
            color={new THREE.Color(palette.cyan).multiplyScalar(1.7)}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function Poster({
  position,
  rotation,
  variant,
  a,
  b,
}: {
  position: V3
  rotation: number
  variant: number
  a: string
  b: string
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: variant * 3 },
      uVariant: { value: variant },
      uA: { value: new THREE.Color() },
      uB: { value: new THREE.Color() },
    }),
    [variant]
  )
  uniforms.uA.value.set(a)
  uniforms.uB.value.set(b)
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position-z={-0.02}>
        <boxGeometry args={[1.25, 1.75, 0.04]} />
        <meshStandardMaterial color="#05020c" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position-z={0.005}>
        <planeGeometry args={[1.1, 1.6]} />
        <shaderMaterial
          vertexShader={screenVertex}
          fragmentShader={posterFragment}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function Walls() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const marqueeRef = useRef<THREE.Group>(null)
  const fontVar = lang === "fa" ? "--font-fa" : "--font-display"
  const dir = lang === "fa" ? "rtl" : "ltr"

  useFrame(({ clock }) => {
    // Subtle neon flicker on the marquee.
    const g = marqueeRef.current
    if (!g) return
    const t = clock.elapsedTime
    g.visible = !(Math.sin(t * 13) > 0.995 && Math.sin(t * 0.7) > 0.6)
  })

  const wallMat = (
    <meshStandardMaterial
      color={palette.wall}
      roughness={0.75}
      metalness={0.15}
    />
  )
  const panelMat = (
    <meshStandardMaterial
      color={palette.body}
      roughness={0.45}
      metalness={0.35}
    />
  )

  return (
    <group>
      {/* Back wall: four pieces around the window opening. */}
      {(() => {
        const bottom = WINDOW.y - WINDOW.h / 2
        const top = WINDOW.y + WINDOW.h / 2
        const sideW = (W - WINDOW.w) / 2
        const pieces: [number, number, number, number][] = [
          [0, bottom / 2, W, bottom],
          [0, (top + H) / 2, W, H - top],
          [-(WINDOW.w + sideW) / 2, WINDOW.y, sideW, WINDOW.h],
          [(WINDOW.w + sideW) / 2, WINDOW.y, sideW, WINDOW.h],
        ]
        return pieces.map(([x, y, w, h]) => (
          <mesh key={`${x}${y}`} position={[x, y, BACK_Z - THICK / 2]}>
            <boxGeometry args={[w + (w === W ? THICK * 2 : 0), h, THICK]} />
            {wallMat}
          </mesh>
        ))
      })()}
      {/* Side walls with thickness, so the cut-away front edge reads as a frame. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (SIDE_X + THICK / 2), H / 2, 0]}>
          <boxGeometry args={[THICK, H, D]} />
          {wallMat}
        </mesh>
      ))}

      {/* Wainscot panels along the lower walls. */}
      <mesh position={[0, DADO / 2, BACK_Z + 0.03]}>
        <boxGeometry args={[W, DADO, 0.06]} />
        {panelMat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (SIDE_X - 0.03), DADO / 2, 0]}>
          <boxGeometry args={[0.06, DADO, D]} />
          {panelMat}
        </mesh>
      ))}

      {/* Pilasters with a neon spine. */}
      {([-1, 1] as const).flatMap((s) =>
        PILLAR_Z[s].map((z) => (
          <group key={`${s}${z}`} position={[s * (SIDE_X - 0.12), H / 2, z]}>
            <mesh>
              <boxGeometry args={[0.24, H, 0.36]} />
              {panelMat}
            </mesh>
            <mesh position-x={-s * 0.125}>
              <boxGeometry args={[0.01, H - 0.4, 0.04]} />
              <meshBasicMaterial
                color={new THREE.Color(palette.purple).multiplyScalar(2.4)}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))
      )}

      <Instances limit={STRIPS.length}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshBasicMaterial toneMapped={false} />
        {STRIPS.map(([position, rotation, length, color], i) => (
          <Instance
            key={i}
            position={position}
            rotation={rotation}
            scale={[length, 1, 1]}
            color={new THREE.Color(palette[color]).multiplyScalar(2)}
          />
        ))}
      </Instances>

      <Panorama />
      <NeonPalm position={[-6.9, 1.35, BACK_Z + 0.08]} scale={1.3} />
      <NeonPalm position={[6.9, 1.35, BACK_Z + 0.08]} flip={-1} scale={1.3} />

      {/* Right wall posters (the left wall is full of cabinets). */}
      <Poster
        position={[SIDE_X - 0.05, 3.4, 1.0]}
        rotation={-Math.PI / 2}
        variant={0}
        a={palette.pink}
        b={palette.cyan}
      />
      <Poster
        position={[-SIDE_X + 0.05, 3.6, 6.3]}
        rotation={Math.PI / 2}
        variant={2}
        a={palette.yellow}
        b={palette.pink}
      />

      {/* Neon signage. */}
      <Label
        text={dict.games.title.toUpperCase()}
        size={[3.6, 0.8]}
        intensity={1.6}
        position={[-SIDE_X + 0.1, 4.6, -1.5]}
        rotation-y={Math.PI / 2}
        options={{
          fontSize: 120,
          height: 180,
          color: palette.cyan,
          fontVar,
          weight: 900,
          dir,
        }}
      />
      <Label
        text="INSERT COIN"
        size={[3.2, 0.5]}
        intensity={1.5}
        position={[SIDE_X - 0.27, 5.3, 2.8]}
        rotation-y={-Math.PI / 2}
        options={{
          fontSize: 90,
          height: 140,
          color: palette.yellow,
          fontVar: "--font-display",
          weight: 900,
        }}
      />

      <group ref={marqueeRef}>
        <Label
          text={dict.site.name.toUpperCase()}
          size={[7, 1.3]}
          intensity={1.5}
          position={[0, 5.4, BACK_Z + 0.1]}
          options={{
            fontSize: 96,
            height: 220,
            color: palette.pink,
            fontVar,
            weight: 900,
            dir,
          }}
        />
        <Label
          text={dict.site.role}
          size={[7, 0.4]}
          intensity={1.4}
          position={[0, 4.68, BACK_Z + 0.1]}
          options={{
            fontSize: 44,
            height: 80,
            color: palette.cyan,
            fontVar: lang === "fa" ? "--font-fa" : "--font-mono",
            weight: 500,
            dir,
          }}
        />
      </group>
    </group>
  )
}

export { BACK_Z, H as WALL_HEIGHT, SIDE_X }

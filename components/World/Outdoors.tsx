"use client"

import { Clone, Instance, Instances, Stars, useGLTF } from "@react-three/drei"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { launchGame } from "@/components/Arcade/actions"
import Hotspot from "@/components/Arcade/Hotspot"
import Label from "@/components/Arcade/Label"
import { MODELS } from "@/components/Arcade/models"
import { usePalette } from "@/components/Arcade/palette"
import {
  gridFragment,
  gridVertex,
  screenVertex,
  sunFragment,
} from "@/components/Arcade/shaders"
import { useDictionary } from "@/components/DictionaryProvider"
import { useStage } from "@/lib/store/stage"
import {
  BILLBOARD,
  PALMS,
  POND,
  PYRAMID,
  ROAD_Z,
  SIGNPOST,
  TELEPORTS,
  TRUCK,
} from "./layout"
import { walkTo } from "./Player"

type V3 = [number, number, number]

const neon = (c: string, k = 1.6) => new THREE.Color(c).multiplyScalar(k)

function Ground() {
  const palette = usePalette()
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uScroll: { value: 0 },
      uSize: { value: 2 },
      uFade: { value: 60 },
    }),
    []
  )
  uniforms.uColor.value.set(palette.purple).multiplyScalar(0.45)
  // Click the ground to walk there (ignored when the pointer was dragging the camera).
  const walk = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6 || useStage.getState().mode !== "explore") return
    walkTo(e.point)
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03} onClick={walk}>
        <circleGeometry args={[110, 64]} />
        <meshStandardMaterial color="#0a0616" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} raycast={() => null}>
        <circleGeometry args={[110, 64]} />
        <shaderMaterial
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Plaza in front of the arcade. */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -0.01, 12]}
        raycast={() => null}
      >
        <ringGeometry args={[3.6, 3.75, 64]} />
        <meshBasicMaterial color={neon(palette.cyan)} toneMapped={false} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -0.015, 12]}
        raycast={() => null}
      >
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial color="#160b2c" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Sky() {
  const palette = usePalette()
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uTime: { value: 0 },
    }),
    []
  )
  uniforms.uTop.value.set(palette.sunTop)
  uniforms.uBottom.value.set(palette.sunBottom)
  const sun = useRef<THREE.ShaderMaterial>(null)
  useFrame((_, dt) => {
    if (sun.current) sun.current.uniforms.uTime.value += dt
  })
  return (
    <group>
      <Stars radius={90} depth={30} count={1500} factor={3} fade speed={0.4} />
      <mesh position={[0, 14, -95]}>
        <planeGeometry args={[46, 46]} />
        <shaderMaterial
          ref={sun}
          vertexShader={screenVertex}
          fragmentShader={sunFragment}
          uniforms={uniforms}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </group>
  )
}

/** A ring of low-poly mountains with glowing ridges. */
function Mountains() {
  const palette = usePalette()
  const peaks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + 0.2
        const r = 62 + (i % 3) * 6
        return {
          p: [Math.cos(a) * r, 0, Math.sin(a) * r] as V3,
          h: 10 + ((i * 7) % 5) * 3,
          w: 12 + ((i * 5) % 4) * 3,
        }
      }),
    []
  )
  const geo = useMemo(() => new THREE.ConeGeometry(1, 1, 5, 1), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo])
  return (
    <group>
      {peaks.map(({ p, h, w }, i) => (
        <group key={i} position={[p[0], h / 2 - 0.5, p[2]]} scale={[w, h, w]}>
          <mesh geometry={geo}>
            <meshStandardMaterial color="#0c0620" roughness={1} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial
              color={neon(i % 2 ? palette.purple : palette.pink, 1.2)}
              toneMapped={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function Pyramid() {
  const palette = usePalette()
  const ring = useRef<THREE.Mesh>(null)
  const geo = useMemo(
    () => new THREE.ConeGeometry(PYRAMID.r * 1.25, PYRAMID.h, 4, 1),
    []
  )
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo])
  useFrame(({ clock }) => {
    if (ring.current) {
      ring.current.rotation.z = clock.elapsedTime * 0.4
      ring.current.position.y =
        PYRAMID.h + 1.6 + Math.sin(clock.elapsedTime) * 0.3
    }
  })
  return (
    <group position={[PYRAMID.x, 0, PYRAMID.z]}>
      <mesh geometry={geo} position-y={PYRAMID.h / 2} rotation-y={Math.PI / 4}>
        <meshStandardMaterial color="#120830" roughness={0.4} metalness={0.6} />
      </mesh>
      <lineSegments
        geometry={edges}
        position-y={PYRAMID.h / 2}
        rotation-y={Math.PI / 4}
      >
        <lineBasicMaterial color={neon(palette.cyan, 1.8)} toneMapped={false} />
      </lineSegments>
      <mesh ref={ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.1, 0.05, 8, 48]} />
        <meshBasicMaterial
          color={neon(palette.yellow, 1.8)}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/** Palm trees built from a bent trunk and drooping fronds. */
function Palms() {
  const palette = usePalette()
  const { trunk, frond } = useMemo(() => {
    const trunk = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.25, 1.6, 0),
        new THREE.Vector3(0.1, 3.2, 0),
        new THREE.Vector3(-0.35, 4.4, 0),
      ]),
      24,
      0.14,
      7
    )
    const frond = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.9, 0.5, 0),
        new THREE.Vector3(1.9, -0.3, 0),
      ]),
      12,
      0.09,
      5
    )
    return { trunk, frond }
  }, [])
  return (
    <group>
      {PALMS.map(([x, z], i) => (
        <group
          key={i}
          position={[x, 0, z]}
          rotation-y={i * 1.7}
          scale={0.85 + (i % 3) * 0.12}
        >
          <mesh geometry={trunk}>
            <meshStandardMaterial
              color="#2a1636"
              roughness={0.8}
              emissive={palette.purple}
              emissiveIntensity={0.15}
            />
          </mesh>
          <group position={[-0.35, 4.4, 0]}>
            {Array.from({ length: 7 }, (_, k) => (
              <mesh key={k} geometry={frond} rotation-y={(k / 7) * Math.PI * 2}>
                <meshStandardMaterial
                  color="#0f3b3a"
                  emissive={palette.cyan}
                  emissiveIntensity={0.35}
                  roughness={0.7}
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

function Pond() {
  const palette = usePalette()
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.emissiveIntensity =
        0.25 + Math.sin(clock.elapsedTime * 1.5) * 0.08
  })
  return (
    <group position={[POND.x, 0, POND.z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} raycast={() => null}>
        <circleGeometry args={[POND.r, 48]} />
        <meshStandardMaterial
          ref={mat}
          color="#03101e"
          emissive={palette.cyan}
          emissiveIntensity={0.08}
          roughness={0.05}
          metalness={0.8}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} raycast={() => null}>
        <ringGeometry args={[POND.r, POND.r + 0.25, 48]} />
        <meshStandardMaterial color="#2a1a40" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Road() {
  const palette = usePalette()
  const dashes = useMemo(
    () => Array.from({ length: 34 }, (_, i) => -40 + i * 2.4),
    []
  )
  return (
    <group position={[0, 0, ROAD_Z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.005} raycast={() => null}>
        <planeGeometry args={[84, 4.2]} />
        <meshStandardMaterial color="#07040e" roughness={0.6} />
      </mesh>
      {[-2.1, 2.1].map((z) => (
        <mesh key={z} position={[0, 0.01, z]} raycast={() => null}>
          <boxGeometry args={[84, 0.02, 0.06]} />
          <meshBasicMaterial color={neon(palette.pink)} toneMapped={false} />
        </mesh>
      ))}
      <Instances limit={dashes.length}>
        <boxGeometry args={[1.2, 0.02, 0.1]} />
        <meshBasicMaterial
          color={neon(palette.yellow, 1.3)}
          toneMapped={false}
        />
        {dashes.map((x) => (
          <Instance key={x} position={[x, 0.01, 0]} />
        ))}
      </Instances>
    </group>
  )
}

/** The Neon Drive truck parked on the road: walk up and press E to drive. */
function Truck() {
  const { dict } = useDictionary()
  const { scene } = useGLTF(MODELS.truck)
  return (
    <Hotspot
      id="truck"
      label={dict.games.list["neon-drive"].name}
      onActivate={() => launchGame("neon-drive")}
    >
      <group position={TRUCK} rotation-y={Math.PI / 2}>
        <group scale={1.4}>
          <Clone object={scene} />
        </group>
        <mesh position-y={0.7} visible={false}>
          <boxGeometry args={[1.8, 1.4, 3.2]} />
        </mesh>
      </group>
    </Hotspot>
  )
}

function Billboard() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  return (
    <group position={[BILLBOARD.x, 0, BILLBOARD.z]} rotation-y={BILLBOARD.rot}>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 2.2, 0]}>
          <boxGeometry args={[0.2, 4.4, 0.2]} />
          <meshStandardMaterial
            color="#1a1030"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 5.2, -0.06]}>
        <boxGeometry args={[6.4, 2.6, 0.12]} />
        <meshStandardMaterial color="#0a0514" />
      </mesh>
      <Label
        text={dict.site.name.toUpperCase()}
        size={[6, 1.3]}
        intensity={1.3}
        position={[0, 5.6, 0.01]}
        options={{
          color: palette.pink,
          fontSize: 110,
          height: 200,
          weight: 900,
          fontVar: lang === "fa" ? "--font-fa" : "--font-display",
          dir: lang === "fa" ? "rtl" : "ltr",
        }}
      />
      <Label
        text={dict.world.billboard}
        size={[6, 0.6]}
        intensity={1.2}
        position={[0, 4.5, 0.01]}
        options={{
          color: palette.cyan,
          fontSize: 48,
          height: 90,
          fontVar: lang === "fa" ? "--font-fa" : "--font-mono",
          dir: lang === "fa" ? "rtl" : "ltr",
        }}
      />
    </group>
  )
}

function Teleporters() {
  const palette = usePalette()
  const rings = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    rings.current?.children.forEach((g, i) => {
      g.children[1].rotation.z = clock.elapsedTime * (i ? -1.5 : 1.5)
      g.children[2].position.y =
        0.6 + Math.sin(clock.elapsedTime * 2 + i) * 0.25
    })
  })
  return (
    <group ref={rings}>
      {TELEPORTS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
            <circleGeometry args={[0.8, 32]} />
            <meshBasicMaterial
              color={neon(palette.purple, 1)}
              toneMapped={false}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position-y={0.04}>
            <ringGeometry args={[0.6, 0.8, 6]} />
            <meshBasicMaterial
              color={neon(palette.cyan, 2)}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.5, 0.02, 8, 32]} />
            <meshBasicMaterial
              color={neon(palette.cyan, 2)}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Signpost() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  const signs: [string, number, string][] = [
    [dict.world.signs.arcade, Math.PI / 2, palette.pink],
    [dict.world.signs.pond, Math.PI + 0.4, palette.cyan],
    [dict.world.signs.road, -0.2, palette.yellow],
    [dict.world.signs.pyramid, Math.PI / 2 + 0.25, palette.purple],
  ]
  return (
    <group position={[SIGNPOST[0], 0, SIGNPOST[1]]}>
      <mesh position-y={1.3}>
        <cylinderGeometry args={[0.06, 0.06, 2.6]} />
        <meshStandardMaterial color="#2a1a40" />
      </mesh>
      {signs.map(([text, rot, color], i) => (
        <group key={text} position-y={2.3 - i * 0.42} rotation-y={rot}>
          <mesh position-x={0.65}>
            <boxGeometry args={[1.2, 0.32, 0.05]} />
            <meshStandardMaterial color="#0a0514" />
          </mesh>
          {[0.03, -0.03].map((z) => (
            <Label
              key={z}
              text={text}
              size={[1.1, 0.26]}
              intensity={1.2}
              position={[0.65, 0, z]}
              rotation-y={z < 0 ? Math.PI : 0}
              options={{
                color,
                fontSize: 52,
                height: 80,
                fontVar: lang === "fa" ? "--font-fa" : "--font-display",
                dir: lang === "fa" ? "rtl" : "ltr",
              }}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

/** Big sign over the open front of the arcade. */
function EntranceSign() {
  const palette = usePalette()
  const { dict, lang } = useDictionary()
  return (
    <group position={[0, 7.3, 8.1]}>
      <mesh position-z={-0.05}>
        <boxGeometry args={[10, 1.3, 0.1]} />
        <meshStandardMaterial color="#0a0514" metalness={0.6} roughness={0.4} />
      </mesh>
      <Label
        text={dict.world.entrance}
        size={[9.4, 1.1]}
        intensity={1.4}
        options={{
          color: palette.yellow,
          fontSize: 100,
          height: 150,
          weight: 900,
          fontVar: lang === "fa" ? "--font-fa" : "--font-display",
          dir: lang === "fa" ? "rtl" : "ltr",
        }}
      />
    </group>
  )
}

/** Everything outside the arcade: the explorable neon world. */
export default function Outdoors() {
  const palette = usePalette()
  const tier = useStage((s) => s.tier)
  const explore = useStage((s) => s.mode === "explore")
  return (
    <group>
      <directionalLight
        position={[-20, 30, 20]}
        intensity={0.6}
        color="#c9b8ff"
      />
      <pointLight
        position={[0, 6, 14]}
        intensity={20}
        distance={18}
        color={palette.pink}
      />
      <Ground />
      {/* In tour mode the big sun would peek over the room's open top. */}
      {explore && <Sky />}
      {tier !== "low" && <Mountains />}
      <Pyramid />
      <Palms />
      <Pond />
      <Road />
      <Truck />
      <Billboard />
      <Teleporters />
      <Signpost />
      <EntranceSign />
    </group>
  )
}

useGLTF.preload(MODELS.truck)

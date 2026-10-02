"use client"

import { RoundedBox } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"
import Label from "./Label"
import { usePalette } from "./palette"
import { glowFragment, screenVertex } from "./shaders"
import { WALL_HEIGHT } from "./Walls"

type V3 = [number, number, number]

const neon = (color: string, k = 1.8) =>
  new THREE.Color(color).multiplyScalar(k)

/** Additive pool of colored light on the floor: fakes a light without the cost of one. */
export function GlowPool({
  position,
  color,
  size = 2,
  strength = 0.5,
}: {
  position: V3
  color: string
  size?: number
  strength?: number
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uStrength: { value: strength },
    }),
    [strength]
  )
  uniforms.uColor.value.set(color)
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={1}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        vertexShader={screenVertex}
        fragmentShader={glowFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

/** Truss beams under the open ceiling with hanging neon tubes and pendant lamps. */
export function Ceiling() {
  const palette = usePalette()
  const tier = useStage((s) => s.tier)
  const y = WALL_HEIGHT - 0.25
  const beamsZ = [-5.5, -1.5, 2.5, 6.5]
  const tubes: [V3, string][] = [
    [[-4.5, y - 0.55, -3.5], palette.pink],
    [[4.5, y - 0.55, -3.5], palette.cyan],
    [[-4.5, y - 0.55, 0.5], palette.cyan],
    [[4.5, y - 0.55, 0.5], palette.pink],
    [[-4.5, y - 0.55, 4.5], palette.purple],
    [[4.5, y - 0.55, 4.5], palette.purple],
  ]
  // Over the air hockey table, the mascot and the desk.
  const lamps: V3[] = [
    [-1.7, y - 0.9, 2.6],
    [3.3, y - 0.9, 2.4],
    [6.4, y - 0.9, -0.8],
  ]
  const beamMat = (
    <meshStandardMaterial color="#120a24" roughness={0.4} metalness={0.8} />
  )
  return (
    <group>
      {beamsZ.map((z) => (
        <group key={z} position={[0, y, z]}>
          {/* A simple box truss: two chords and a lattice. */}
          {[0.15, -0.15].map((dy) => (
            <mesh key={dy} position-y={dy}>
              <boxGeometry args={[18, 0.06, 0.06]} />
              {beamMat}
            </mesh>
          ))}
          {tier !== "low" &&
            Array.from({ length: 24 }, (_, i) => (
              <mesh
                key={i}
                position-x={-8.6 + i * 0.75}
                rotation-z={i % 2 ? 0.75 : -0.75}
              >
                <boxGeometry args={[0.025, 0.42, 0.025]} />
                {beamMat}
              </mesh>
            ))}
        </group>
      ))}

      {tubes.map(([p, color], i) => (
        <group key={i} position={p}>
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, 0.3, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.6]} />
              <meshBasicMaterial color="#000" />
            </mesh>
          ))}
          <mesh rotation-z={Math.PI / 2}>
            <capsuleGeometry args={[0.035, 1.6, 4, 12]} />
            <meshBasicMaterial color={neon(color, 2.2)} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <mesh position-y={0.6}>
            <cylinderGeometry args={[0.008, 0.008, 1.2]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh>
            <coneGeometry args={[0.32, 0.3, 32, 1, true]} />
            <meshStandardMaterial
              color="#1a1030"
              metalness={0.8}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position-y={-0.13} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial
              color={new THREE.Color(3, 2.6, 2.9)}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Dusty light shaft. */}
          {tier !== "low" && (
            <mesh position-y={-2.4}>
              <coneGeometry args={[1.6, 4.5, 32, 1, true]} />
              <meshBasicMaterial
                color="#ffd9f2"
                transparent
                opacity={0.012}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/** Claw machine with a wandering claw and a heap of prizes. */
export function ClawMachine({
  position,
  rotation = 0,
}: {
  position: V3
  rotation?: number
}) {
  const palette = usePalette()
  const reduced = usePrefersReducedMotion()
  const claw = useRef<THREE.Group>(null)
  const prizes = useMemo(() => {
    const colors = [palette.pink, palette.cyan, palette.yellow, palette.purple]
    return Array.from({ length: 16 }, (_, i) => {
      const a = i * 2.4
      const r = 0.12 + (i % 4) * 0.08
      return {
        position: [
          Math.cos(a) * r,
          1.08 + (i % 3) * 0.06,
          Math.sin(a) * r * 0.8,
        ] as V3,
        color: colors[i % colors.length],
        round: i % 2 === 0,
      }
    })
  }, [palette])

  useFrame(({ clock }) => {
    const g = claw.current
    if (!g || reduced) return
    const t = clock.elapsedTime * 0.5
    g.position.x = Math.sin(t) * 0.28
    g.position.z = Math.sin(t * 1.3) * 0.22
    // Every so often the claw drops for a grab.
    const cycle = (clock.elapsedTime % 9) / 9
    const drop = cycle > 0.8 ? Math.sin(((cycle - 0.8) / 0.2) * Math.PI) : 0
    g.position.y = 2.05 - drop * 0.55
  })

  return (
    <group position={position} rotation-y={rotation}>
      {/* Base */}
      <RoundedBox args={[1.1, 1.0, 1.0]} radius={0.04} position-y={0.5}>
        <meshStandardMaterial
          color={palette.body}
          roughness={0.3}
          metalness={0.4}
        />
      </RoundedBox>
      <mesh position={[0, 0.55, 0.505]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial
          color="#0a0514"
          emissive={palette.pink}
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh position={[0.3, 0.42, 0.52]}>
        <boxGeometry args={[0.18, 0.12, 0.04]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.15, 0.85, 0.48]}>
        <cylinderGeometry args={[0.015, 0.015, 0.14]} />
        <meshStandardMaterial color="#ddd" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.15, 0.93, 0.48]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={neon(palette.pink, 2)} toneMapped={false} />
      </mesh>
      <mesh position={[0.12, 0.86, 0.48]}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
        <meshBasicMaterial color={neon(palette.cyan, 2)} toneMapped={false} />
      </mesh>

      {/* Glass case */}
      <mesh position-y={1.6}>
        <boxGeometry args={[1.04, 1.2, 0.94]} />
        <meshStandardMaterial
          color="#aee8ff"
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0.9}
          depthWrite={false}
        />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.52, 1.6, sz * 0.47]}>
            <boxGeometry args={[0.04, 1.2, 0.04]} />
            <meshBasicMaterial color={neon(palette.cyan)} toneMapped={false} />
          </mesh>
        ))
      )}
      {prizes.map((p, i) => (
        <mesh key={i} position={p.position}>
          {p.round ? (
            <sphereGeometry args={[0.07, 16, 12]} />
          ) : (
            <boxGeometry args={[0.11, 0.11, 0.11]} />
          )}
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Claw */}
      <group ref={claw} position-y={2.05}>
        <mesh position-y={0.06}>
          <cylinderGeometry args={[0.008, 0.008, 0.2]} />
          <meshStandardMaterial color="#ccc" metalness={1} roughness={0.2} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.05, 0.04, 0.06, 12]} />
          <meshStandardMaterial color="#ddd" metalness={1} roughness={0.2} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation-y={(k * Math.PI * 2) / 3} position-y={-0.08}>
            <mesh position-x={0.04} rotation-z={0.5}>
              <boxGeometry args={[0.012, 0.13, 0.012]} />
              <meshStandardMaterial
                color="#ddd"
                metalness={1}
                roughness={0.2}
              />
            </mesh>
          </mesh>
        ))}
      </group>

      {/* Top box with marquee */}
      <RoundedBox args={[1.1, 0.34, 1.0]} radius={0.04} position-y={2.37}>
        <meshStandardMaterial
          color={palette.body}
          roughness={0.3}
          metalness={0.4}
        />
      </RoundedBox>
      <Label
        text="CLAW"
        size={[0.9, 0.26]}
        intensity={1.5}
        position={[0, 2.37, 0.505]}
        options={{
          color: palette.yellow,
          fontSize: 80,
          height: 110,
          fontVar: "--font-display",
          weight: 900,
          background: "#0a0514",
        }}
      />
    </group>
  )
}

/** Soda machine with glowing rows of cans. */
export function VendingMachine({
  position,
  rotation = 0,
}: {
  position: V3
  rotation?: number
}) {
  const palette = usePalette()
  const colors = [palette.pink, palette.cyan, palette.yellow, palette.purple]
  return (
    <group position={position} rotation-y={rotation}>
      <RoundedBox args={[1.05, 2.2, 0.85]} radius={0.05} position-y={1.1}>
        <meshStandardMaterial
          color={palette.body}
          roughness={0.3}
          metalness={0.45}
        />
      </RoundedBox>
      {/* Lit display */}
      <mesh position={[-0.12, 1.3, 0.43]}>
        <planeGeometry args={[0.66, 1.5]} />
        <meshBasicMaterial color={new THREE.Color(0.08, 0.06, 0.14)} />
      </mesh>
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 4 }, (_, c) => (
          <mesh
            key={`${row}${c}`}
            position={[-0.38 + c * 0.17, 0.72 + row * 0.29, 0.4]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.17, 16]} />
            <meshStandardMaterial
              color={colors[(row + c) % colors.length]}
              emissive={colors[(row + c) % colors.length]}
              emissiveIntensity={0.9}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))
      )}
      <mesh position={[-0.12, 1.3, 0.44]}>
        <planeGeometry args={[0.66, 1.5]} />
        <meshStandardMaterial
          color="#bfefff"
          transparent
          opacity={0.1}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>
      {/* Side panel: buttons and coin slot */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0.36, 1.75 - i * 0.14, 0.43]}>
          <boxGeometry args={[0.16, 0.08, 0.02]} />
          <meshBasicMaterial
            color={neon(colors[i % 4], 1.6)}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0.36, 0.95, 0.43]}>
        <boxGeometry args={[0.04, 0.12, 0.02]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.12, 0.3, 0.43]}>
        <boxGeometry args={[0.66, 0.2, 0.02]} />
        <meshBasicMaterial color="#030106" />
      </mesh>
      <Label
        text="SODA"
        size={[0.9, 0.24]}
        intensity={1.5}
        position={[0, 2.06, 0.43]}
        options={{
          color: palette.pink,
          fontSize: 80,
          height: 100,
          fontVar: "--font-display",
          weight: 900,
        }}
      />
      <GlowPool
        position={[0, 0.01, 0.9]}
        color={palette.pink}
        size={1.8}
        strength={0.4}
      />
    </group>
  )
}

/** Air hockey table with a puck that never stops. */
export function AirHockey({
  position,
  rotation = 0,
}: {
  position: V3
  rotation?: number
}) {
  const palette = usePalette()
  const reduced = usePrefersReducedMotion()
  const puck = useRef<THREE.Mesh>(null)
  const malletA = useRef<THREE.Mesh>(null)
  const malletB = useRef<THREE.Mesh>(null)
  const state = useRef({ x: 0, z: 0, vx: 0.9, vz: 0.6 })
  const L = 0.85
  const Wd = 0.42

  useFrame((_, dt) => {
    const s = state.current
    if (!reduced) {
      const step = Math.min(dt, 0.05)
      s.x += s.vx * step
      s.z += s.vz * step
      if (Math.abs(s.x) > L - 0.12) {
        s.vx *= -1
        s.x = Math.sign(s.x) * (L - 0.12)
      }
      if (Math.abs(s.z) > Wd - 0.06) {
        s.vz *= -1
        s.z = Math.sign(s.z) * (Wd - 0.06)
      }
    }
    puck.current?.position.set(s.x, 0.83, s.z)
    // Mallets track the puck's z on their own side.
    for (const [m, side] of [
      [malletA.current, -1],
      [malletB.current, 1],
    ] as const) {
      if (!m) continue
      m.position.z += (s.z - m.position.z) * Math.min(1, dt * 3)
      m.position.x = side * (L - 0.06)
    }
  })

  return (
    <group position={position} rotation-y={rotation}>
      <RoundedBox args={[1.9, 0.72, 1.0]} radius={0.05} position-y={0.42}>
        <meshStandardMaterial
          color={palette.body}
          roughness={0.3}
          metalness={0.45}
        />
      </RoundedBox>
      <mesh position-y={0.8} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.76, 0.86]} />
        <meshStandardMaterial
          color="#0c1a3a"
          emissive={palette.cyan}
          emissiveIntensity={0.12}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>
      {/* Center line and goal arcs */}
      <mesh position-y={0.802} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.02, 0.86]} />
        <meshBasicMaterial color={neon(palette.pink, 2)} toneMapped={false} />
      </mesh>
      <mesh position-y={0.802} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.16, 0.18, 40]} />
        <meshBasicMaterial color={neon(palette.pink, 2)} toneMapped={false} />
      </mesh>
      {/* Rails */}
      {[-1, 1].map((s) => (
        <mesh key={`z${s}`} position={[0, 0.83, s * 0.46]}>
          <boxGeometry args={[1.86, 0.06, 0.06]} />
          <meshBasicMaterial color={neon(palette.cyan)} toneMapped={false} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} position={[s * 0.92, 0.83, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.96]} />
          <meshBasicMaterial color={neon(palette.purple)} toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={puck}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
        <meshBasicMaterial
          color={neon(palette.yellow, 2.4)}
          toneMapped={false}
        />
      </mesh>
      {[malletA, malletB].map((ref, i) => (
        <mesh key={i} ref={ref} position-y={0.84}>
          <cylinderGeometry args={[0.07, 0.08, 0.06, 24]} />
          <meshStandardMaterial
            color={i ? palette.pink : palette.cyan}
            emissive={i ? palette.pink : palette.cyan}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      <GlowPool
        position={[0, 0.01, 0]}
        color={palette.cyan}
        size={3}
        strength={0.35}
      />
    </group>
  )
}

/** Round lounge rug with a couple of neon-rimmed stools. */
export function Stools({ position }: { position: V3 }) {
  const palette = usePalette()
  const spots: [number, number, string][] = [
    [-0.55, 0, palette.pink],
    [0.55, 0.15, palette.cyan],
  ]
  return (
    <group position={position}>
      {spots.map(([x, z, color]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position-y={0.36}>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 10]} />
            <meshStandardMaterial color="#bbb" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position-y={0.02}>
            <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
            <meshStandardMaterial
              color="#222"
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          <mesh position-y={0.74}>
            <cylinderGeometry args={[0.2, 0.18, 0.08, 24]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} />
          </mesh>
          <mesh position-y={0.74} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.2, 0.012, 8, 32]} />
            <meshBasicMaterial color={neon(color)} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

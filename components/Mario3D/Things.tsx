"use client"

import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import * as THREE from "three"
import Hotspot from "@/components/Arcade/Hotspot"
import Label from "@/components/Arcade/Label"
import { useDictionary } from "@/components/DictionaryProvider"
import { marioSfx } from "@/lib/audio/mario"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { allPowerUpsFound, useMario, type PowerUpId } from "@/lib/store/mario"
import { useScores } from "@/lib/store/scores"
import { useStage } from "@/lib/store/stage"
import {
  bumpHandlers,
  hero,
  spawned,
  spawnListeners,
  spawnPowerUp,
} from "./events"
import {
  POWERUP_SPOTS,
  type BlockDef,
  type Level,
  type PipeDef,
  type V3,
} from "./level"
import { useSignFont } from "./Scenery"
import { textures } from "./textures"

// ---------------------------------------------------------------- Blocks

function Block({ def }: { def: BlockDef }) {
  const { dict } = useDictionary()
  const mesh = useRef<THREE.Mesh>(null)
  const coin = useRef<THREE.Mesh>(null)
  const bump = useRef(0)
  const coinT = useRef(-1)
  const [used, setUsed] = useState(false)
  const [revealed, setRevealed] = useState(def.look !== "hidden")
  const [popup, setPopup] = useState<string | null>(null)
  const mats = useMemo(() => {
    const t = textures()
    return {
      question: new THREE.MeshStandardMaterial({
        map: t.question,
        roughness: 0.6,
      }),
      brick: new THREE.MeshStandardMaterial({ map: t.brick, roughness: 0.8 }),
      used: new THREE.MeshStandardMaterial({ map: t.used, roughness: 0.8 }),
    }
  }, [])

  useEffect(() => {
    const onBump = () => {
      bump.current = 1
      const c = def.content
      switch (c.type) {
        case "panel":
          marioSfx.blockOpen()
          coinT.current = 0
          useMario.getState().addScore(50)
          // Let the bump play before the panel covers the world.
          setTimeout(
            () => useStage.getState().focusOn("overview", c.panel),
            450
          )
          break
        case "coin":
          if (used) return marioSfx.bump()
          setUsed(true)
          coinT.current = 0
          if (useMario.getState().collectCoin(`block-${def.id}`))
            marioSfx.coin()
          break
        case "skill":
          marioSfx.bump()
          marioSfx.coin()
          useScores.getState().unlockSkill(c.skill)
          useMario.getState().addScore(100)
          setPopup(`${c.skill} · ${c.level}%`)
          setTimeout(() => setPopup(null), 2600)
          break
        case "powerup":
          if (used) return marioSfx.bump()
          setRevealed(true)
          setUsed(true)
          marioSfx.powerUpAppear()
          spawnPowerUp(c.id)
          break
        default:
          marioSfx.bump()
      }
    }
    bumpHandlers.set(def.id, onBump)
    return () => void bumpHandlers.delete(def.id)
  }, [def, used])

  useFrame((_, dt) => {
    bump.current = Math.max(0, bump.current - dt * 5)
    if (mesh.current)
      mesh.current.position.y =
        def.position[1] + 0.5 + Math.sin(bump.current * Math.PI) * 0.3
    const c = coin.current
    if (c) {
      if (coinT.current >= 0) {
        coinT.current += dt
        const t = coinT.current / 0.6
        c.visible = t < 1
        c.position.y =
          def.position[1] + 1.2 + Math.sin(Math.min(t, 1) * Math.PI) * 1.6
        c.rotation.y += dt * 20
        if (t >= 1) coinT.current = -1
      } else c.visible = false
    }
    if (mesh.current && def.look === "question" && !used)
      mesh.current.rotation.y = 0
  })

  const mat =
    used || (def.look === "hidden" && revealed)
      ? mats.used
      : def.look === "question"
        ? mats.question
        : mats.brick
  const label =
    def.content.type === "panel"
      ? def.content.label
      : def.content.type === "skill"
        ? def.content.skill
        : null
  const font = useSignFont()
  return (
    <group position={[def.position[0], 0, def.position[2]]}>
      <mesh
        ref={mesh}
        material={mat}
        visible={revealed}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh ref={coin} visible={false}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 20]} />
        <meshStandardMaterial
          color="#fbd000"
          metalness={0.1}
          roughness={0.35}
          emissive="#c88a00"
          emissiveIntensity={0.45}
        />
      </mesh>
      {label && revealed && (
        <Label
          text={
            def.content.type === "panel"
              ? ((dict.nav as Record<string, string>)[def.content.panel] ??
                label)
              : label
          }
          size={[1.7, 0.36]}
          position={[0, def.position[1] + 1.35, 0]}
          options={{
            ...font,
            color: "#ffffff",
            background: "#1a1410",
            fontSize: 44,
            height: 72,
          }}
        />
      )}
      {popup && (
        <Html
          position={[0, def.position[1] + 2.2, 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rounded bg-card px-3 py-1.5 font-display text-xs whitespace-nowrap text-foreground pixel-border-sm">
            ★ {popup}
          </div>
        </Html>
      )}
    </group>
  )
}

// ---------------------------------------------------------------- Pipes

function Pipe({
  def,
  onEnter,
}: {
  def: PipeDef
  onEnter: (def: PipeDef) => void
}) {
  const font = useSignFont()
  const tex = useMemo(() => {
    const t = textures().pipe.clone()
    t.repeat.set(2, def.height)
    t.needsUpdate = true
    return t
  }, [def.height])
  const lip = useMemo(() => textures().pipe, [])
  const project = !["secret", "exit"].includes(def.target)
  const [x, y, z] = def.position
  return (
    <Hotspot id={def.id} label={def.label} onActivate={() => onEnter(def)}>
      <group position={[x, y, z]}>
        <mesh position-y={(def.height - 0.5) / 2} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.85, def.height - 0.5, 24]} />
          <meshStandardMaterial map={tex} roughness={0.5} />
        </mesh>
        <mesh position-y={def.height - 0.25} castShadow>
          <cylinderGeometry args={[1, 1, 0.5, 24]} />
          <meshStandardMaterial map={lip} roughness={0.5} />
        </mesh>
        <mesh position-y={def.height + 0.001} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.8, 24]} />
          <meshBasicMaterial color="#0a1a0a" />
        </mesh>
        {project && (
          <>
            {/* Project color band. */}
            <mesh position-y={def.height - 0.25}>
              <cylinderGeometry args={[1.01, 1.01, 0.12, 24]} />
              <meshStandardMaterial
                color={def.color}
                emissive={def.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            <Label
              text={def.label}
              size={[3.6, 0.5]}
              position={[0, def.height + 1.6, 0]}
              options={{
                ...font,
                color: "#ffffff",
                background: "#1a1410",
                fontSize: 52,
                height: 80,
              }}
            />
          </>
        )}
      </group>
    </Hotspot>
  )
}

// ---------------------------------------------------------------- Coins

function Coin({ id, position }: { id: string; position: V3 }) {
  const ref = useRef<THREE.Group>(null)
  const taken = useRef(false)
  const t = useRef(0)
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    if (taken.current) {
      t.current += dt
      g.position.y = position[1] + t.current * 5
      g.rotation.y += dt * 25
      g.scale.setScalar(Math.max(0.01, 1 - t.current * 2.5))
      if (t.current > 0.4 && g.visible) {
        g.visible = false
        useMario.getState().collectCoin(id)
      }
      return
    }
    g.rotation.y = clock.elapsedTime * 3
    const b = hero.body
    const dx = b.x - position[0]
    const dz = b.z - position[2]
    const dy = position[1] - (b.y + 0.7)
    if (dx * dx + dz * dz < 0.5 && Math.abs(dy) < 1.1) {
      taken.current = true
      marioSfx.coin()
    }
  })
  return (
    <group ref={ref} position={position}>
      <mesh rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 20]} />
        <meshStandardMaterial
          color="#fbd000"
          metalness={0.1}
          roughness={0.35}
          emissive="#c88a00"
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-z={0.045}>
        <boxGeometry args={[0.08, 0.02, 0.32]} />
        <meshStandardMaterial color="#c88a00" />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- Enemies

/** A grumpy walking chestnut. Stomp it; don't walk into it. */
function Chestnut({
  from,
  to,
  z,
  y,
}: {
  from: number
  to: number
  z: number
  y: number
}) {
  const ref = useRef<THREE.Group>(null)
  const s = useRef({ x: from, dir: 1, squished: 0 })
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const g = ref.current
    if (!g) return
    const st = s.current
    const paused = !!useStage.getState().panel || !!useStage.getState().game
    if (st.squished > 0) {
      st.squished -= dt
      g.scale.set(1.2, 0.25, 1.2)
      if (st.squished <= 0) {
        st.x = from
        g.scale.set(1, 1, 1)
      }
      g.visible = st.squished > 18 || st.squished <= 0
      return
    }
    g.visible = true
    if (!paused) {
      st.x += st.dir * 1.3 * dt
      if (st.x > to || st.x < from) st.dir *= -1
    }
    g.position.set(st.x, y, z)
    g.rotation.y = st.dir > 0 ? Math.PI / 2 : -Math.PI / 2
    g.children[0].rotation.z = Math.sin(clock.elapsedTime * 10) * 0.12

    // Contact with the hero.
    const b = hero.body
    const dx = b.x - st.x
    const dz = b.z - z
    if (dx * dx + dz * dz > 0.7 || b.y > y + 1.1 || b.y + 1.4 < y) return
    if (b.vy < 0 && b.y > y + 0.45) {
      st.squished = 20
      g.position.y = y
      b.vy = 9
      marioSfx.stomp()
      useMario.getState().addScore(100)
    } else if (hero.star > 0) {
      st.squished = 20
      marioSfx.stomp()
      useMario.getState().addScore(200)
    } else if (hero.hurt <= 0) {
      hero.hurt = 1.6
      const d = Math.hypot(dx, dz) || 1
      b.vx = (dx / d) * 9
      b.vz = (dz / d) * 9
      b.vy = 6
      b.grounded = false
      marioSfx.hurt()
    }
  })
  return (
    <group ref={ref} position={[from, y, z]}>
      <group>
        <mesh position-y={0.62} scale={[1, 0.85, 1]} castShadow>
          <sphereGeometry args={[0.5, 18, 14]} />
          <meshStandardMaterial color="#a0522d" roughness={0.7} />
        </mesh>
        <mesh position-y={0.28}>
          <cylinderGeometry args={[0.3, 0.32, 0.3, 14]} />
          <meshStandardMaterial color="#f3d9a0" />
        </mesh>
        {[-0.18, 0.18].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.7, 0.4]}>
              <sphereGeometry args={[0.11, 10, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[x * 0.85, 0.68, 0.49]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial color="#1a1410" />
            </mesh>
            <mesh position={[x, 0.86, 0.4]} rotation-z={x > 0 ? 0.5 : -0.5}>
              <boxGeometry args={[0.22, 0.05, 0.05]} />
              <meshStandardMaterial color="#1a1410" />
            </mesh>
            <mesh position={[x * 1.3, 0.08, 0.05]} scale={[1, 0.6, 1.4]}>
              <sphereGeometry args={[0.16, 10, 8]} />
              <meshStandardMaterial color="#3a2010" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- Power-ups

function PowerUpMesh({ id }: { id: PowerUpId }) {
  switch (id) {
    case "mystery-mushroom":
    case "one-up": {
      const cap = id === "one-up" ? "#43b047" : "#e52521"
      return (
        <group>
          <mesh position-y={0.18}>
            <cylinderGeometry args={[0.2, 0.22, 0.32, 14]} />
            <meshStandardMaterial color="#fff4d6" />
          </mesh>
          <mesh position-y={0.36} scale={[1, 0.75, 1]}>
            <sphereGeometry
              args={[0.38, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={cap} />
          </mesh>
          {[0, 2.1, 4.2].map((a) => (
            <mesh
              key={a}
              position={[Math.cos(a) * 0.26, 0.5, Math.sin(a) * 0.26]}
              scale={[1, 0.6, 1]}
            >
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      )
    }
    case "super-star": {
      const shape = new THREE.Shape()
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.2 : 0.45
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      return (
        <mesh position-y={0.45}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.18,
                bevelEnabled: true,
                bevelSize: 0.04,
                bevelThickness: 0.04,
              },
            ]}
          />
          <meshStandardMaterial
            color="#fbd000"
            emissive="#ffb000"
            emissiveIntensity={0.6}
          />
        </mesh>
      )
    }
    case "fire-flower":
      return (
        <group>
          <mesh position-y={0.2}>
            <cylinderGeometry args={[0.04, 0.04, 0.4]} />
            <meshStandardMaterial color="#43b047" />
          </mesh>
          <mesh position-y={0.55}>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshStandardMaterial
              color="#ff8a00"
              emissive="#e52521"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0.55, 0.2]}>
            <sphereGeometry args={[0.15, 12, 10]} />
            <meshStandardMaterial color="#fff4d6" />
          </mesh>
        </group>
      )
    case "cloud-coin":
      return (
        <mesh position-y={0.45} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#fbd000"
            emissiveIntensity={0.5}
            metalness={0.4}
          />
        </mesh>
      )
    case "golden-key":
      return (
        <group position-y={0.5} rotation-z={0.3}>
          <mesh>
            <torusGeometry args={[0.16, 0.06, 8, 20]} />
            <meshStandardMaterial
              color="#fbd000"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position-x={0.38}>
            <boxGeometry args={[0.48, 0.08, 0.08]} />
            <meshStandardMaterial
              color="#fbd000"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.52, -0.1, 0]}>
            <boxGeometry args={[0.08, 0.16, 0.08]} />
            <meshStandardMaterial
              color="#fbd000"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      )
  }
}

function PowerUp({ id, position }: { id: PowerUpId; position: V3 }) {
  const { dict } = useDictionary()
  const ref = useRef<THREE.Group>(null)
  const found = useMario((s) => s.powerUps.includes(id))
  const hydrated = useHydrated()
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g || found) return
    g.rotation.y = clock.elapsedTime * 1.5
    g.position.y = position[1] + Math.sin(clock.elapsedTime * 2.5) * 0.08
    const b = hero.body
    const dx = b.x - position[0]
    const dz = b.z - position[2]
    if (dx * dx + dz * dz < 0.8 && Math.abs(position[1] - (b.y + 0.5)) < 1.3) {
      if (!useMario.getState().findPowerUp(id)) return
      if (id === "one-up") marioSfx.extraLife()
      else marioSfx.powerUp()
      if (id === "super-star") hero.star = 10
      const info = dict.mario.powerUps[id]
      toast.success(`${dict.mario.found}: ${info.name}`, {
        description: info.note,
      })
      if (allPowerUpsFound(useMario.getState().powerUps))
        setTimeout(() => toast.success(dict.mario.allFound), 1500)
    }
  })
  if (!hydrated || found) return null
  return (
    <group ref={ref} position={position}>
      <PowerUpMesh id={id} />
    </group>
  )
}

function PowerUps({ level }: { level: Level }) {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    spawnListeners.add(l)
    return () => void spawnListeners.delete(l)
  }, [])
  const hidden = level.blocks.find((b) => b.content.type === "powerup")
  const tall = level.tallest
  return (
    <group>
      {POWERUP_SPOTS.map((p) => (
        <PowerUp key={p.id} id={p.id} position={p.position} />
      ))}
      <PowerUp
        id="fire-flower"
        position={[tall.position[0], tall.height + 0.05, tall.position[2]]}
      />
      {hidden && spawned.has("mystery-mushroom") && (
        <PowerUp
          id="mystery-mushroom"
          position={[
            hidden.position[0],
            hidden.position[1] + 1,
            hidden.position[2],
          ]}
        />
      )}
    </group>
  )
}

// ---------------------------------------------------------------- All

export default function Things({
  level,
  onPipe,
}: {
  level: Level
  onPipe: (def: PipeDef) => void
}) {
  const hydrated = useHydrated()
  const [taken] = useState(() => new Set(useMario.getState().coins))
  return (
    <group>
      {level.blocks.map((b) => (
        <Block key={b.id} def={b} />
      ))}
      {level.pipes.map((p) => (
        <Pipe key={p.id} def={p} onEnter={onPipe} />
      ))}
      {hydrated &&
        level.coins.map((c) =>
          taken.has(c.id) ? null : (
            <Coin key={c.id} id={c.id} position={c.position} />
          )
        )}
      {level.enemies.map((e) => (
        <Chestnut key={e.id} from={e.from} to={e.to} z={e.z} y={e.y} />
      ))}
      <PowerUps level={level} />
    </group>
  )
}

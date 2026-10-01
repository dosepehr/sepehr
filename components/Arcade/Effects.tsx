"use client"

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { useMemo } from "react"
import * as THREE from "three"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"

/** Bloom does the neon. Emissive / toneMapped={false} materials push past the threshold. */
export default function Effects() {
  const tier = useStage((s) => s.tier)
  const reduced = usePrefersReducedMotion()
  const offset = useMemo(() => new THREE.Vector2(0.0007, 0.0005), [])
  if (tier === "low") return null
  const high = tier === "high"
  return (
    <EffectComposer multisampling={high ? 4 : 0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.2}
        intensity={reduced ? 0.6 : high ? 1.1 : 0.85}
        levels={high ? 8 : 6}
      />
      {/* A touch of CRT: lens fringing toward the edges and film grain. */}
      <ChromaticAberration
        offset={offset}
        radialModulation
        modulationOffset={0.35}
      />
      <Noise
        opacity={high ? 0.06 : 0.04}
        premultiply
        blendFunction={BlendFunction.SCREEN}
      />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  )
}

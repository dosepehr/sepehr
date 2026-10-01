"use client"

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing"
import { usePrefersReducedMotion } from "@/lib/hooks/useExperience"
import { useStage } from "@/lib/store/stage"

/** Bloom does the neon. Emissive / toneMapped={false} materials push past the threshold. */
export default function Effects() {
  const tier = useStage((s) => s.tier)
  const reduced = usePrefersReducedMotion()
  if (tier === "low") return null
  return (
    <EffectComposer multisampling={tier === "high" ? 4 : 0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.2}
        intensity={reduced ? 0.6 : tier === "high" ? 1.1 : 0.85}
        levels={tier === "high" ? 8 : 6}
      />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  )
}

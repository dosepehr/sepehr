// Downloads the CC0 models the arcade uses and writes compressed copies to public/models.
// Run: npm run models  (also rebuilds the procedural models first)
//
// Every file goes through the same pipeline: dedup, prune, weld, then meshopt
// compression (drei's useGLTF decodes it out of the box). Large textures are
// resized and re-encoded as WebP when sharp is installed (Next ships it).
// Credits and licenses: public/models/CREDITS.md

import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { NodeIO } from "@gltf-transform/core"
import { ALL_EXTENSIONS } from "@gltf-transform/extensions"
import {
  dedup,
  meshopt,
  prune,
  resample,
  textureCompress,
  weld,
} from "@gltf-transform/functions"
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer"

const OUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/models"
)
const RAW = "https://raw.githubusercontent.com"
const KENNEY = `${RAW}/KenneyNL`

/** [output name, source url, max texture size] */
const MODELS = [
  [
    "robot.glb",
    `${RAW}/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb`,
  ],
  [
    "boombox.glb",
    `${RAW}/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb`,
    1024,
  ],
  ["coin.glb", `${KENNEY}/Starter-Kit-3D-Platformer/main/models/coin.glb`],
  [
    "block-coin.glb",
    `${KENNEY}/Starter-Kit-3D-Platformer/main/models/block-coin.glb`,
  ],
  [
    "trophy.glb",
    `${KENNEY}/Starter-Kit-Basic-Scene/main/sample/Mini%20Arena/Models/GLB%20format/trophy.glb`,
  ],
  ["drone.glb", `${KENNEY}/Starter-Kit-FPS/main/models/enemy-flying.glb`],
  [
    "truck.glb",
    `${KENNEY}/Starter-Kit-Racing/main/models/vehicle-truck-purple.glb`,
  ],
]

await MeshoptDecoder.ready
await MeshoptEncoder.ready
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  })

let sharp = null
try {
  sharp = (await import("sharp")).default
} catch {
  console.warn("sharp not found: textures are kept as-is")
}

async function optimize(doc, maxTexture) {
  // keepAttributes: the cabinet has no textures yet its UVs drive the screen and marquee.
  const steps = [dedup(), prune({ keepAttributes: true }), weld(), resample()]
  if (sharp && maxTexture)
    steps.push(
      textureCompress({
        encoder: sharp,
        targetFormat: "webp",
        resize: [maxTexture, maxTexture],
      })
    )
  steps.push(meshopt({ encoder: MeshoptEncoder, level: "medium" }))
  await doc.transform(...steps)
  return doc
}

/** Read a GLB from a URL, pulling in textures it references by relative path (Kenney's do). */
async function readRemote(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const view = new DataView(bytes.buffer)
  const jsonLength = view.getUint32(12, true)
  const json = JSON.parse(
    new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength))
  )
  const binStart = 20 + jsonLength
  const resources = {}
  if (binStart < bytes.byteLength)
    resources["@glb.bin"] = bytes.subarray(
      binStart + 8,
      binStart + 8 + view.getUint32(binStart, true)
    )
  for (const image of json.images ?? []) {
    if (!image.uri || image.uri.startsWith("data:")) continue
    const imageRes = await fetch(new URL(image.uri, url))
    if (!imageRes.ok) throw new Error(`${imageRes.status} ${image.uri}`)
    resources[image.uri] = new Uint8Array(await imageRes.arrayBuffer())
  }
  for (const buffer of json.buffers ?? [])
    if (!buffer.uri) buffer.uri = "@glb.bin"
  return io.readJSON({ json, resources })
}

await mkdir(OUT_DIR, { recursive: true })

for (const [name, url, maxTexture] of MODELS) {
  const doc = await readRemote(url)
  await optimize(doc, maxTexture)
  const glb = await io.writeBinary(doc)
  await writeFile(resolve(OUT_DIR, name), glb)
  console.log(`${name.padEnd(16)} ${(glb.byteLength / 1024).toFixed(1)} KB`)
}

// Generated models (npm run models:build) are compressed in place.
for (const name of [
  "arcade-cabinet.glb",
  "payphone.glb",
  "printer.glb",
  "computer.glb",
]) {
  const file = resolve(OUT_DIR, name)
  const doc = await io.read(file)
  await optimize(doc)
  const glb = await io.writeBinary(doc)
  await writeFile(file, glb)
  console.log(`${name.padEnd(16)} ${(glb.byteLength / 1024).toFixed(1)} KB`)
}

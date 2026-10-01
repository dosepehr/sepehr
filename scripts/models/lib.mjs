// Shared helpers for the procedural model scripts (build-cabinet.mjs, build-props.mjs).

import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as THREE from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

// GLTFExporter reads Blobs through FileReader, which Node lacks.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    void blob.arrayBuffer().then((buf) => {
      this.result = buf
      this.onloadend?.()
    })
  }
  readAsDataURL(blob) {
    void blob.arrayBuffer().then((buf) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buf).toString("base64")}`
      this.onloadend?.()
    })
  }
}

export const MODELS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/models"
)

/** Add a named mesh to a parent and return it. */
export function add(parent, name, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  parent.add(mesh)
  return mesh
}

/** Box with rounded vertical edges and bevelled front/back, centred on the origin. */
export function roundedBox(w, h, d, r = 0.012) {
  r = Math.min(r, w / 2, h / 2, d / 2)
  const s = new THREE.Shape()
  const hw = w / 2 - r
  const hh = h / 2 - r
  s.moveTo(-hw, -hh - r)
  s.lineTo(hw, -hh - r)
  s.quadraticCurveTo(hw + r, -hh - r, hw + r, -hh)
  s.lineTo(hw + r, hh)
  s.quadraticCurveTo(hw + r, hh + r, hw, hh + r)
  s.lineTo(-hw, hh + r)
  s.quadraticCurveTo(-hw - r, hh + r, -hw - r, hh)
  s.lineTo(-hw - r, -hh)
  s.quadraticCurveTo(-hw - r, -hh - r, -hw, -hh - r)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.001, d - r * 2),
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: 0,
    bevelSegments: 2,
    curveSegments: 3,
  })
  g.translate(0, 0, -d / 2 + r)
  const flat = mergeVertices(g.deleteAttribute("normal"), 1e-4).toNonIndexed()
  flat.computeVertexNormals()
  return flat
}

/** Export a scene graph as GLB into public/models. */
export async function exportGLB(root, file) {
  root.updateMatrixWorld(true)
  const glb = await new GLTFExporter().parseAsync(root, { binary: true })
  const out = resolve(MODELS_DIR, file)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, Buffer.from(glb))
  console.log(`wrote ${file} (${(glb.byteLength / 1024).toFixed(1)} KB)`)
}

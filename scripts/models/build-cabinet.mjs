// Builds public/models/arcade-cabinet.glb: a classic upright cabinet, modelled in code
// so it can be tweaked and rebuilt. Run: npm run models:build
//
// Named nodes the scene relies on (components/Arcade/Cabinet.tsx):
//   Screen   CRT glass, gets the attract-mode shader
//   Marquee  lightbox face, gets the title texture
//   Trim     T-molding + accent strips, tinted per cabinet
//   SideArt  outer side panels, get the stripe shader
//   Button_0..2, Start_0..1, CoinLight  small emissive bits
// Front faces +Z, floor is y=0, units are metres.

import * as THREE from "three"
import { add as addTo, exportGLB, roundedBox } from "./lib.mjs"

const WIDTH = 1.1
const SIDE = 0.045 // side panel thickness
const INNER = WIDTH - SIDE * 2

// ---- Materials -----------------------------------------------------------
const mat = {
  body: new THREE.MeshStandardMaterial({
    name: "Body",
    color: "#17102b",
    roughness: 0.38,
    metalness: 0.15,
  }),
  side: new THREE.MeshStandardMaterial({
    name: "Side",
    color: "#120b22",
    roughness: 0.3,
    metalness: 0.2,
  }),
  black: new THREE.MeshStandardMaterial({
    name: "Black",
    color: "#050308",
    roughness: 0.18,
    metalness: 0.4,
  }),
  metal: new THREE.MeshStandardMaterial({
    name: "Metal",
    color: "#b9b4c9",
    roughness: 0.28,
    metalness: 1,
  }),
  rubber: new THREE.MeshStandardMaterial({
    name: "Rubber",
    color: "#0b0a0f",
    roughness: 0.85,
  }),
  trim: new THREE.MeshStandardMaterial({
    name: "Trim",
    color: "#000000",
    emissive: "#ff2d95",
    emissiveIntensity: 2.5,
    roughness: 0.4,
  }),
  sideArt: new THREE.MeshStandardMaterial({
    name: "SideArt",
    color: "#ff2d95",
    roughness: 0.5,
  }),
  screen: new THREE.MeshStandardMaterial({
    name: "Screen",
    color: "#000000",
    emissive: "#1a0b2e",
    roughness: 0.05,
  }),
  marquee: new THREE.MeshStandardMaterial({
    name: "Marquee",
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.6,
  }),
  stick: new THREE.MeshStandardMaterial({
    name: "StickBall",
    color: "#ff2d4a",
    roughness: 0.15,
    metalness: 0.05,
  }),
  buttons: ["#ffe14d", "#22e5ff", "#ff2d95"].map(
    (c, i) =>
      new THREE.MeshStandardMaterial({
        name: `ButtonMat_${i}`,
        color: c,
        emissive: c,
        emissiveIntensity: 0.9,
        roughness: 0.25,
      })
  ),
  start: new THREE.MeshStandardMaterial({
    name: "StartMat",
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.8,
    roughness: 0.3,
  }),
  coin: new THREE.MeshStandardMaterial({
    name: "CoinLightMat",
    color: "#ff3355",
    emissive: "#ff3355",
    emissiveIntensity: 2.5,
  }),
}

const root = new THREE.Group()
root.name = "ArcadeCabinet"

const add = (name, geometry, material, parent = root) =>
  addTo(parent, name, geometry, material)

// ---- Side profile (z, y). Front is +z. ------------------------------------
// Kick plate, control panel ledge, raked CRT face, marquee overhang, sloped roof.
const PROFILE = [
  [-0.42, 0],
  [0.4, 0],
  [0.4, 0.82],
  [0.58, 0.93],
  [0.58, 1.0],
  [0.36, 1.1],
  [0.2, 1.82],
  [0.4, 1.9],
  [0.42, 2.26],
  [-0.2, 2.3],
  [-0.42, 2.12],
]

const shape = new THREE.Shape(PROFILE.map(([z, y]) => new THREE.Vector2(z, y)))
const sideGeo = new THREE.ExtrudeGeometry(shape, {
  depth: SIDE - 0.012,
  bevelEnabled: true,
  bevelThickness: 0.006,
  bevelSize: 0.008,
  bevelSegments: 3,
  curveSegments: 1,
})
// Shape is drawn in the XY plane with x=z; turn it so x→z and extrude→x.
sideGeo.rotateY(-Math.PI / 2)
sideGeo.computeVertexNormals()

for (const side of [-1, 1]) {
  const m = add(`Side_${side < 0 ? "L" : "R"}`, sideGeo, mat.side)
  m.position.x = side < 0 ? -WIDTH / 2 + SIDE - 0.006 : WIDTH / 2 - 0.006
}

// Side art: a slightly inset copy of the profile on the outer faces, UVs in 0..1.
{
  const inset = [
    [-0.36, 0.08],
    [0.34, 0.08],
    [0.34, 0.86],
    [0.5, 0.95],
    [0.3, 1.06],
    [0.14, 1.84],
    [0.34, 1.94],
    [0.36, 2.2],
    [-0.2, 2.23],
    [-0.36, 2.08],
  ]
  const artShape = new THREE.Shape(
    inset.map(([z, y]) => new THREE.Vector2(z, y))
  )
  const art = new THREE.ShapeGeometry(artShape)
  art.computeBoundingBox()
  const { min, max } = art.boundingBox
  const uv = art.attributes.uv
  const pos = art.attributes.position
  for (let i = 0; i < uv.count; i++)
    uv.setXY(
      i,
      (pos.getX(i) - min.x) / (max.x - min.x),
      (pos.getY(i) - min.y) / (max.y - min.y)
    )
  for (const side of [-1, 1]) {
    const g = art.clone()
    g.rotateY(side < 0 ? -Math.PI / 2 : Math.PI / 2)
    // rotateY(+90°) flips z; undo it so the profile matches the panel.
    if (side > 0) g.scale(1, 1, -1)
    const m = add(`SideArt_${side < 0 ? "L" : "R"}`, g, mat.sideArt)
    m.position.x = side * (WIDTH / 2 + 0.0035)
  }
}

// T-molding: a tube following the profile edge on both sides.
{
  const path = new THREE.CurvePath()
  const pts = [...PROFILE, PROFILE[0]].map(
    ([z, y]) => new THREE.Vector3(0, y, z)
  )
  // Skip the bottom edge, which sits on the floor.
  for (let i = 1; i < pts.length - 1; i++)
    path.add(new THREE.LineCurve3(pts[i], pts[i + 1]))
  const tube = new THREE.TubeGeometry(path, 160, 0.011, 6, false)
  for (const side of [-1, 1]) {
    const m = add(`Trim_${side < 0 ? "L" : "R"}`, tube, mat.trim)
    m.position.x = side * (WIDTH / 2 - SIDE / 2)
  }
}

// ---- Panels between the sides --------------------------------------------
const box = roundedBox

/** Place a panel spanning from (z0,y0) to (z1,y1) along the profile, depth inward. */
const between = (name, [z0, y0], [z1, y1], depth, material, w = INNER) => {
  const len = Math.hypot(z1 - z0, y1 - y0)
  const g = box(w, len, depth, 0.008)
  const m = add(name, g, material)
  const angle = Math.atan2(z1 - z0, y1 - y0)
  m.position.set(0, (y0 + y1) / 2, (z0 + z1) / 2)
  m.rotation.x = angle
  // Push inward so the outer face sits flush with the profile.
  const n = new THREE.Vector3(0, -Math.sin(angle), Math.cos(angle))
  m.position.addScaledVector(n, -depth / 2)
  return m
}

// Lower front (holds the coin door), kick plate, back, roof.
between("FrontLower", [0.4, 0.06], [0.4, 0.82], 0.03, mat.body)
between("KickPlate", [0.405, 0], [0.405, 0.08], 0.02, mat.metal)
between("Back", [-0.42, 2.1], [-0.42, 0.02], 0.03, mat.body)
between("Roof", [0.42, 2.26], [-0.2, 2.3], 0.03, mat.body)
between("RoofBack", [-0.2, 2.3], [-0.42, 2.12], 0.03, mat.body)
between("PanelFront", [0.4, 0.82], [0.58, 0.93], 0.03, mat.black)
between("PanelLip", [0.58, 0.93], [0.58, 1.0], 0.02, mat.metal, WIDTH + 0.02)
between("UnderMarquee", [0.2, 1.82], [0.4, 1.9], 0.03, mat.black)

// Control panel top.
const panelTop = between(
  "ControlPanel",
  [0.58, 1.0],
  [0.36, 1.1],
  0.03,
  mat.black,
  WIDTH + 0.02
)

// Bezel on the raked face, CRT glass with a gentle bulge on top of it.
const FACE = { from: [0.36, 1.1], to: [0.2, 1.82] }
const faceTilt = -Math.atan2(
  FACE.from[0] - FACE.to[0],
  FACE.to[1] - FACE.from[1]
)
const faceNormal = new THREE.Vector3(0, -Math.sin(faceTilt), Math.cos(faceTilt))
{
  between("Bezel", FACE.from, FACE.to, 0.025, mat.black)

  const sw = 0.84
  const sh = 0.6
  const g = new THREE.PlaneGeometry(sw, sh, 24, 18)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (sw / 2)
    const y = p.getY(i) / (sh / 2)
    p.setZ(i, 0.018 * (1 - x * x) * (1 - y * y))
  }
  g.computeVertexNormals()
  const screen = add("Screen", g, mat.screen)
  screen.position
    .set(
      0,
      (FACE.from[1] + FACE.to[1]) / 2 + 0.03,
      (FACE.from[0] + FACE.to[0]) / 2
    )
    .addScaledVector(faceNormal, 0.003)
  screen.rotation.x = faceTilt

  // Thin glowing frame inside the bezel.
  const frame = new THREE.Shape()
  frame.moveTo(-sw / 2 - 0.03, -sh / 2 - 0.03)
  frame.lineTo(sw / 2 + 0.03, -sh / 2 - 0.03)
  frame.lineTo(sw / 2 + 0.03, sh / 2 + 0.03)
  frame.lineTo(-sw / 2 - 0.03, sh / 2 + 0.03)
  const hole = new THREE.Path()
  hole.moveTo(-sw / 2 - 0.012, -sh / 2 - 0.012)
  hole.lineTo(-sw / 2 - 0.012, sh / 2 + 0.012)
  hole.lineTo(sw / 2 + 0.012, sh / 2 + 0.012)
  hole.lineTo(sw / 2 + 0.012, -sh / 2 - 0.012)
  frame.holes.push(hole)
  const frameMesh = add("Trim_Screen", new THREE.ShapeGeometry(frame), mat.trim)
  frameMesh.position.copy(screen.position)
  frameMesh.rotation.x = faceTilt
  frameMesh.position.addScaledVector(faceNormal, 0.002)
}

// Marquee lightbox.
{
  const front = new THREE.PlaneGeometry(INNER - 0.04, 0.3)
  const m = add("Marquee", front, mat.marquee)
  m.position.set(0, 2.08, 0.416)
  m.rotation.x = -Math.atan2(0.02, 0.36)
  const glow = add("Trim_Marquee", box(INNER, 0.018, 0.02, 0.006), mat.trim)
  glow.position.set(0, 1.915, 0.4)
  const glowTop = add(
    "Trim_MarqueeTop",
    box(INNER, 0.018, 0.02, 0.006),
    mat.trim
  )
  glowTop.position.set(0, 2.245, 0.425)
  // Speaker grille strip under the marquee.
  for (let i = 0; i < 9; i++) {
    const slot = add(
      `Grille_${i}`,
      new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12),
      mat.metal
    )
    slot.rotation.x = Math.PI / 2 - Math.atan2(0.2, 0.08)
    slot.position.set(-0.32 + i * 0.08, 1.86, 0.3)
  }
}

// ---- Controls ------------------------------------------------------------
{
  const cp = new THREE.Group()
  cp.name = "Controls"
  cp.position.copy(panelTop.position)
  // Panels are built with their normal on local +z; controls want it on +y.
  cp.rotation.x = panelTop.rotation.x + Math.PI / 2
  root.add(cp)
  const surface = 0.017

  // Joystick: dust washer, shaft, ball top.
  const stick = new THREE.Group()
  stick.name = "Joystick"
  stick.position.set(-0.28, surface, 0.0)
  cp.add(stick)
  add(
    "StickWasher",
    new THREE.CylinderGeometry(0.045, 0.05, 0.008, 32),
    mat.rubber,
    stick
  ).position.y = 0.004
  const shaft = add(
    "StickShaft",
    new THREE.CylinderGeometry(0.008, 0.008, 0.09, 16),
    mat.metal,
    stick
  )
  shaft.position.y = 0.05
  const ball = add(
    "StickBall",
    new THREE.SphereGeometry(0.032, 32, 20),
    mat.stick,
    stick
  )
  ball.position.y = 0.1

  // Three action buttons in an arc + housings.
  ;[
    [0.02, -0.01],
    [0.13, 0.02],
    [0.24, 0.0],
  ].forEach(([x, z], i) => {
    const housing = add(
      `ButtonRing_${i}`,
      new THREE.CylinderGeometry(0.036, 0.038, 0.012, 32),
      mat.black,
      cp
    )
    housing.position.set(x, surface + 0.006, z)
    const b = add(
      `Button_${i}`,
      new THREE.CylinderGeometry(0.027, 0.027, 0.016, 32),
      mat.buttons[i],
      cp
    )
    b.position.set(x, surface + 0.016, z)
  })
  // Start buttons near the screen.
  ;[-0.06, 0.06].forEach((x, i) => {
    const s = add(
      `Start_${i}`,
      new THREE.CylinderGeometry(0.014, 0.014, 0.012, 24),
      mat.start,
      cp
    )
    s.position.set(x + 0.02, surface + 0.008, -0.075)
  })
}

// ---- Coin door -------------------------------------------------------------
{
  const door = new THREE.Group()
  door.name = "CoinDoor"
  door.position.set(0, 0.5, 0.405)
  root.add(door)
  add("CoinDoorPlate", box(0.36, 0.42, 0.012, 0.01), mat.metal, door)
  ;[-0.08, 0.08].forEach((x, i) => {
    const slot = add(
      `CoinSlot_${i}`,
      box(0.07, 0.1, 0.02, 0.006),
      mat.black,
      door
    )
    slot.position.set(x, 0.08, 0.008)
    const light = add(
      `CoinLight_${i}`,
      box(0.012, 0.05, 0.006, 0.002),
      mat.coin,
      door
    )
    light.position.set(x, 0.08, 0.02)
  })
  const ret = add("CoinReturn", box(0.24, 0.07, 0.02, 0.008), mat.black, door)
  ret.position.set(0, -0.11, 0.008)
}

// ---- Leveling feet ------------------------------------------------------------
for (const x of [-0.45, 0.45])
  for (const z of [-0.36, 0.34]) {
    const f = add(
      "Foot",
      new THREE.CylinderGeometry(0.025, 0.03, 0.02, 16),
      mat.rubber
    )
    f.position.set(x, 0.01, z)
  }

await exportGLB(root, "arcade-cabinet.glb")

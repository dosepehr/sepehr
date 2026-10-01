// Builds the room's smaller props as GLBs: payphone, dot-matrix printer and a
// retro computer. Run: npm run models:build
//
// Front faces +Z, units are metres. The payphone and printer stand on the floor
// (y=0); the computer's origin is the desk surface. Named parts the scene uses:
//   payphone.glb  Sign (title texture), Handset (wobbles), Trim (tinted)
//   printer.glb   Paper (slides out on hover), Trim (tinted)
//   computer.glb  Screen (terminal texture), Trim (tinted)

import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { add, exportGLB, roundedBox } from "./lib.mjs"

const std = (name, color, roughness = 0.5, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({
    name,
    color,
    roughness,
    metalness,
    ...extra,
  })
const glow = (name, color, intensity = 2) =>
  std(name, "#000000", 0.4, 0, { emissive: color, emissiveIntensity: intensity })

const at = (mesh, x, y, z) => {
  mesh.position.set(x, y, z)
  return mesh
}

/** Plane bulged toward +z like CRT glass, UVs intact. */
function crtGlass(w, h, bulge) {
  const g = new THREE.PlaneGeometry(w, h, 20, 16)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2)
    const y = p.getY(i) / (h / 2)
    p.setZ(i, bulge * (1 - x * x) * (1 - y * y))
  }
  g.computeVertexNormals()
  return g
}

// ---------------------------------------------------------------------------
// Payphone
// ---------------------------------------------------------------------------
async function payphone() {
  const m = {
    body: std("Body", "#1d1233", 0.35, 0.2),
    metal: std("Metal", "#d9d6e6", 0.3, 0.7),
    dark: std("Black", "#08060c", 0.3, 0.3),
    keys: std("Keys", "#f1eff8", 0.3, 0.3),
    glass: std("Glass", "#9fe8ff", 0.05, 0, {
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    trim: glow("Trim", "#ff2d95", 2.5),
    display: glow("Display", "#5dff9d", 1.6),
    sign: std("Sign", "#ffffff", 0.4, 0, {
      emissive: "#ffffff",
      emissiveIntensity: 0.6,
    }),
  }
  const root = new THREE.Group()
  root.name = "Payphone"

  // Pedestal and back panel.
  at(add(root, "Base", roundedBox(0.62, 0.06, 0.46, 0.02), m.metal), 0, 0.03, 0)
  at(add(root, "BaseGlow", roundedBox(0.64, 0.014, 0.48, 0.007), m.trim), 0, 0.064, 0)
  at(add(root, "Pillar", roundedBox(0.36, 0.92, 0.26, 0.03), m.body), 0, 0.52, -0.08)
  at(add(root, "BackPanel", roundedBox(0.84, 1.08, 0.05, 0.015), m.body), 0, 1.5, -0.2)
  at(add(root, "Shelf", roundedBox(0.62, 0.03, 0.22, 0.01), m.body), 0, 1.03, -0.07)

  // Side glass with neon edges.
  for (const side of [-1, 1]) {
    at(add(root, "Glass", roundedBox(0.025, 1.0, 0.42, 0.01), m.glass), side * 0.44, 1.48, 0.0)
    at(add(root, "Trim_Edge", roundedBox(0.03, 1.0, 0.02, 0.008), m.trim), side * 0.44, 1.48, 0.215)
  }

  // Sign box on top.
  at(add(root, "SignBox", roundedBox(0.96, 0.3, 0.5, 0.03), m.body), 0, 2.1, -0.01)
  at(add(root, "Sign", new THREE.PlaneGeometry(0.86, 0.22), m.sign), 0, 2.1, 0.242)
  at(add(root, "Trim_SignLow", roundedBox(0.96, 0.018, 0.02, 0.006), m.trim), 0, 1.948, 0.235)
  at(add(root, "Trim_SignHigh", roundedBox(0.96, 0.018, 0.02, 0.006), m.trim), 0, 2.252, 0.235)

  // The phone unit.
  const unit = new THREE.Group()
  unit.name = "Phone"
  unit.position.set(0, 0, -0.12)
  root.add(unit)
  at(add(unit, "Housing", roundedBox(0.42, 0.64, 0.11, 0.035), m.metal), 0, 1.45, 0)
  at(add(unit, "DisplayBezel", roundedBox(0.25, 0.08, 0.02, 0.008), m.dark), 0.05, 1.69, 0.06)
  at(add(unit, "Display", roundedBox(0.22, 0.05, 0.012, 0.004), m.display), 0.05, 1.69, 0.068)
  at(add(unit, "CoinSlot", roundedBox(0.016, 0.07, 0.02, 0.006), m.dark), 0.16, 1.6, 0.06)
  at(add(unit, "CoinReturn", roundedBox(0.11, 0.06, 0.05, 0.012), m.dark), 0.06, 1.2, 0.06)
  at(add(unit, "Hook", roundedBox(0.04, 0.05, 0.06, 0.01), m.dark), -0.14, 1.63, 0.07)

  // 4x3 keypad, merged into one mesh.
  const keys = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++)
      keys.push(
        roundedBox(0.046, 0.038, 0.018, 0.008).translate(
          0.0 + c * 0.058,
          1.56 - r * 0.052,
          0.062
        )
      )
  add(unit, "Keypad", mergeGeometries(keys), m.keys)

  // Handset hanging on the hook, with a coiled cord.
  const handset = new THREE.Group()
  handset.name = "Handset"
  handset.position.set(-0.14, 1.44, 0.085)
  unit.add(handset)
  add(handset, "Grip", new THREE.CapsuleGeometry(0.022, 0.2, 6, 16), m.dark)
  for (const y of [0.13, -0.13]) {
    const cup = add(
      handset,
      "Cup",
      new THREE.CylinderGeometry(0.042, 0.036, 0.04, 24),
      m.dark
    )
    cup.rotation.x = Math.PI / 2
    cup.position.set(0, y, 0.012)
  }
  class Coil extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const a = new THREE.Vector3(-0.14, 1.3, 0.085)
      const b = new THREE.Vector3(-0.17, 1.16, 0.05)
      const sag = new THREE.Vector3(-0.12, 1.02, 0.1)
      const base = new THREE.QuadraticBezierCurve3(a, sag, b).getPoint(t)
      const turn = t * Math.PI * 2 * 22
      return target.set(
        base.x + Math.cos(turn) * 0.011,
        base.y,
        base.z + Math.sin(turn) * 0.011
      )
    }
  }
  add(unit, "Cord", new THREE.TubeGeometry(new Coil(), 360, 0.0035, 4), m.dark)

  await exportGLB(root, "payphone.glb")
}

// ---------------------------------------------------------------------------
// Dot-matrix printer on a stand
// ---------------------------------------------------------------------------
async function printer() {
  const m = {
    body: std("Body", "#1d1233", 0.35, 0.2),
    shell: std("Shell", "#e6dfcf", 0.45, 0.05),
    dark: std("Black", "#0b0910", 0.35, 0.2),
    paper: std("PaperMat", "#fffdf5", 0.8, 0, { side: THREE.DoubleSide }),
    stripe: std("PaperStripe", "#cfe9d6", 0.8, 0, { side: THREE.DoubleSide }),
    trim: glow("Trim", "#ffe14d", 2.5),
    ledG: glow("LedGreen", "#5dff9d", 2.5),
    ledY: glow("LedAmber", "#ffb347", 2),
  }
  const root = new THREE.Group()
  root.name = "Printer"

  // Stand with a paper stack on the open shelf.
  at(add(root, "Stand", roundedBox(0.82, 0.56, 0.62, 0.025), m.body), 0, 0.28, 0)
  at(add(root, "Recess", roundedBox(0.7, 0.32, 0.02, 0.01), m.dark), 0, 0.24, 0.302)
  for (let i = 0; i < 6; i++)
    at(
      add(root, "Stack", roundedBox(0.5, 0.022, 0.04, 0.004), i % 2 ? m.stripe : m.paper),
      0,
      0.12 + i * 0.023,
      0.31
    )
  at(add(root, "Trim_Stand", roundedBox(0.82, 0.016, 0.016, 0.006), m.trim), 0, 0.555, 0.31)

  // Chassis.
  const top = 0.56
  at(add(root, "Chassis", roundedBox(0.7, 0.15, 0.48, 0.035), m.shell), 0, top + 0.075, 0)
  const lid = at(add(root, "Lid", roundedBox(0.66, 0.05, 0.28, 0.025), m.shell), 0, top + 0.16, -0.07)
  lid.rotation.x = -0.14
  at(add(root, "Slot", roundedBox(0.54, 0.018, 0.02, 0.006), m.dark), 0, top + 0.105, 0.236)
  at(add(root, "Trim_Chassis", roundedBox(0.7, 0.012, 0.012, 0.004), m.trim), 0, top + 0.03, 0.242)
  const knob = at(
    add(root, "Knob", new THREE.CylinderGeometry(0.038, 0.038, 0.045, 24), m.dark),
    0.37,
    top + 0.1,
    -0.06
  )
  knob.rotation.z = Math.PI / 2
  ;[m.ledG, m.ledY, m.ledG].forEach((mat, i) => {
    const led = at(
      add(root, "Led", new THREE.CylinderGeometry(0.009, 0.009, 0.01, 12), mat),
      -0.28 + i * 0.035,
      top + 0.152,
      0.17
    )
    led.rotation.x = 0
  })
  for (let i = 0; i < 2; i++)
    at(add(root, "Button", roundedBox(0.04, 0.014, 0.025, 0.006), m.dark), 0.18 + i * 0.055, top + 0.155, 0.17)

  // Tractor-feed paper going in at the back.
  {
    const g = new THREE.PlaneGeometry(0.5, 0.36, 1, 12)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const v = (p.getY(i) + 0.18) / 0.36
      p.setZ(i, -Math.sin(v * Math.PI * 0.5) * 0.09)
    }
    g.computeVertexNormals()
    const sheet = at(add(root, "PaperIn", g, m.paper), 0, top + 0.33, -0.19)
    sheet.rotation.x = -0.25
  }

  // Printed sheet curling out of the front slot. Its origin is the slot.
  {
    const R = 0.22
    const g = new THREE.PlaneGeometry(0.44, 0.5, 1, 24)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const v = (0.25 - p.getY(i)) / 0.5 // 0 at the slot
      const a = v * Math.PI * 0.75
      p.setY(i, -R * (1 - Math.cos(a)) + 0.02 * v)
      p.setZ(i, R * Math.sin(a))
    }
    g.computeVertexNormals()
    const paper = new THREE.Group()
    paper.name = "Paper"
    paper.position.set(0, top + 0.105, 0.24)
    root.add(paper)
    add(paper, "Sheet", g, m.paper)
  }

  await exportGLB(root, "printer.glb")
}

// ---------------------------------------------------------------------------
// Retro computer: desktop case, CRT monitor, keyboard and mouse
// ---------------------------------------------------------------------------
async function computer() {
  const m = {
    shell: std("Shell", "#e3dccb", 0.5, 0.05),
    shellDark: std("ShellDark", "#c9c1ad", 0.55, 0.05),
    dark: std("Black", "#0b0910", 0.3, 0.2),
    keys: std("Keys", "#2a2533", 0.6, 0.1),
    screen: std("Screen", "#000000", 0.08, 0, {
      emissive: "#0a2a1a",
      emissiveIntensity: 1,
    }),
    led: glow("Led", "#5dff9d", 3),
    trim: glow("Trim", "#b45cff", 2.5),
  }
  const root = new THREE.Group()
  root.name = "Computer"

  // Desktop case.
  const caseZ = -0.13
  at(add(root, "Case", roundedBox(0.74, 0.15, 0.52, 0.025), m.shell), 0, 0.075, caseZ)
  at(add(root, "Floppy", roundedBox(0.2, 0.014, 0.012, 0.005), m.dark), 0.17, 0.085, caseZ + 0.262)
  at(add(root, "FloppyLed", roundedBox(0.014, 0.008, 0.008, 0.003), m.led), 0.3, 0.085, caseZ + 0.263)
  for (let i = 0; i < 5; i++)
    at(add(root, "Vent", roundedBox(0.08, 0.006, 0.01, 0.002), m.shellDark), -0.24, 0.05 + i * 0.014, caseZ + 0.262)
  at(add(root, "Trim_Case", roundedBox(0.74, 0.01, 0.01, 0.004), m.trim), 0, 0.006, caseZ + 0.262)

  // Monitor on a swivel base.
  const swivel = add(root, "Swivel", new THREE.CylinderGeometry(0.15, 0.17, 0.03, 32), m.shellDark)
  swivel.position.set(0, 0.165, caseZ)
  const monZ = caseZ + 0.12
  const monY = 0.45
  at(add(root, "Bezel", roundedBox(0.64, 0.52, 0.09, 0.045), m.shell), 0, monY, monZ)
  {
    // Tapered tube at the back.
    const g = new THREE.BoxGeometry(0.58, 0.46, 0.34, 1, 1, 1)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++)
      if (p.getZ(i) < 0) {
        p.setX(i, p.getX(i) * 0.62)
        p.setY(i, p.getY(i) * 0.62 - 0.03)
      }
    g.computeVertexNormals()
    at(add(root, "Tube", g, m.shell), 0, monY, monZ - 0.045 - 0.17)
  }
  at(add(root, "Recess", roundedBox(0.53, 0.41, 0.012, 0.02), m.dark), 0, monY + 0.02, monZ + 0.042)
  at(add(root, "Screen", crtGlass(0.49, 0.37, 0.014), m.screen), 0, monY + 0.02, monZ + 0.046)
  at(add(root, "PowerLed", roundedBox(0.016, 0.016, 0.008, 0.004), m.led), 0.25, monY - 0.225, monZ + 0.046)
  at(add(root, "Trim_Monitor", roundedBox(0.12, 0.01, 0.006, 0.003), m.trim), -0.21, monY - 0.225, monZ + 0.046)

  // Keyboard: wedge base plus one merged mesh of keys.
  const kb = new THREE.Group()
  kb.name = "Keyboard"
  kb.position.set(0, 0.022, 0.29)
  kb.rotation.x = 0.07
  root.add(kb)
  add(kb, "KeyboardBase", roundedBox(0.62, 0.035, 0.2, 0.012), m.shell)
  const keyGeos = []
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 14; c++) {
      if (r === 4 && c > 0 && c < 13 && c !== 4) continue
      const w = r === 4 && c === 4 ? 0.3 : 0.034
      const x = r === 4 && c === 4 ? 0 : -0.27 + c * 0.0415 + (r % 2) * 0.01
      keyGeos.push(new THREE.BoxGeometry(w, 0.016, 0.03).translate(x, 0.022, -0.075 + r * 0.037))
    }
  add(kb, "Keys", mergeGeometries(keyGeos), m.keys)

  // Mouse and its cable.
  const mouse = add(root, "Mouse", new THREE.CapsuleGeometry(0.03, 0.04, 6, 16), m.shell)
  mouse.scale.set(1, 1, 0.55)
  mouse.rotation.x = Math.PI / 2
  mouse.position.set(0.42, 0.018, 0.28)
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.42, 0.012, 0.23),
    new THREE.Vector3(0.44, 0.008, 0.16),
    new THREE.Vector3(0.38, 0.008, 0.12),
    new THREE.Vector3(0.34, 0.03, caseZ + 0.26),
  ])
  add(root, "Cable", new THREE.TubeGeometry(cable, 48, 0.004, 6), m.dark)

  await exportGLB(root, "computer.glb")
}

await payphone()
await printer()
await computer()

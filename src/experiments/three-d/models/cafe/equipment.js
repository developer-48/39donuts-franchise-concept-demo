import * as THREE from 'three'
import { addMesh, cylinder, instanceParts, material } from '../model-helpers.js'
import { box, child, glass, logoPlate } from './building.js'

export function stainlessTable(parent, s, position, width = 1.65, depth = 0.72) {
  const table = child(parent, 'stainless-preparation-table', position)
  box(table, [width, 0.045, depth], s.steel, [0, 0.89, 0], 0.006)
  box(table, [width, 0.14, 0.025], s.steel, [0, 0.97, -depth / 2 + 0.01])
  const feet = [-1, 1].flatMap((x) =>
    [-1, 1].map((z) => ({
      position: [x * (width / 2 - 0.09), 0.45, z * (depth / 2 - 0.08)],
    })),
  )
  instanceParts(table, new THREE.CylinderGeometry(0.025, 0.025, 0.84, 10), s.steel, feet)
  box(table, [width - 0.1, 0.035, depth - 0.1], s.steel, [0, 0.22, 0])
  return table
}

export function espressoMachine(parent, s, position, rotation = 0) {
  const machine = child(parent, 'commercial-two-group-espresso-machine', position, rotation)
  box(machine, [0.76, 0.36, 0.46], s.steel, [0, 0.23, 0], 0.012)
  box(machine, [0.69, 0.04, 0.51], s.aluminium, [0, 0.035, 0.03], 0.004)
  box(machine, [0.64, 0.13, 0.025], s.black, [0, 0.26, 0.243], 0.003)
  box(machine, [0.64, 0.015, 0.18], s.chrome, [0, 0.062, 0.24], 0.003)
  const grille = Array.from({ length: 17 }, (_, index) => ({
    position: [-0.288 + index * 0.036, 0.072, 0.24],
  }))
  instanceParts(machine, new THREE.BoxGeometry(0.006, 0.002, 0.16), s.black, grille)
  ;[-0.19, 0.19].forEach((x) => {
    const dial = cylinder(machine, 0.035, 0.012, s.white, [x, 0.3, 0.265], 16)
    dial.rotation.x = Math.PI / 2
    const needle = box(machine, [0.003, 0.024, 0.002], s.black, [x + 0.004, 0.308, 0.272], 0.0005)
    needle.rotation.z = -0.4
    cylinder(machine, 0.04, 0.065, s.chrome, [x, 0.15, 0.23], 12)
    const handle = cylinder(machine, 0.014, 0.17, s.black, [x, 0.145, 0.32], 10)
    handle.rotation.x = Math.PI / 2
    cylinder(machine, 0.035, 0.052, s.white, [x, 0.065, 0.24], 16)
  })
  const wandPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.34, 0.23, 0.22),
    new THREE.Vector3(0.38, 0.15, 0.28),
    new THREE.Vector3(0.43, 0.09, 0.31),
    new THREE.Vector3(0.43, 0.045, 0.34),
  ])
  addMesh(machine, new THREE.TubeGeometry(wandPath, 14, 0.007, 7, false), s.chrome)
  box(machine, [0.028, 0.032, 0.045], s.black, [0.34, 0.23, 0.225], 0.004)
  const cups = [-0.23, 0, 0.23].map((x) => ({ position: [x, 0.45, 0] }))
  instanceParts(machine, new THREE.CylinderGeometry(0.033, 0.029, 0.055, 12), s.white, cups)
  const grinder = child(machine, 'burr-coffee-grinder', [0.55, 0, 0])
  box(grinder, [0.18, 0.29, 0.23], s.aluminium, [0, 0.16, 0], 0.008)
  cylinder(grinder, 0.085, 0.19, s.ovenGlass, [0, 0.4, -0.025], 20)
  cylinder(grinder, 0.09, 0.018, s.black, [0, 0.5, -0.025], 20)
  return machine
}

export function pastryCase(parent, s, position, width = 1.65, rotation = 0) {
  const display = child(parent, 'refrigerated-pastry-display', position, rotation)
  box(display, [width, 0.085, 0.62], s.steel, [0, 0.042, 0], 0.006)
  box(display, [width, 0.025, 0.64], s.aluminium, [0, 0.59, 0], 0.003)
  ;[-1, 1].forEach((side) => {
    box(display, [0.022, 0.51, 0.022], s.aluminium, [side * (width / 2 - 0.01), 0.33, 0.29])
    box(display, [0.022, 0.51, 0.022], s.aluminium, [side * (width / 2 - 0.01), 0.33, -0.29])
    glass(display, [0.012, 0.5, 0.56], s.glass, [side * (width / 2 - 0.01), 0.33, 0])
  })
  glass(display, [width - 0.04, 0.5, 0.012], s.glass, [0, 0.33, 0.3])
  glass(display, [width - 0.03, 0.012, 0.59], s.glass, [0, 0.58, 0])
  box(display, [width - 0.08, 0.012, 0.025], s.light, [0, 0.555, -0.23])
  const dough = [],
    chocolate = [],
    pistachio = [],
    berry = []
  for (let shelf = 0; shelf < 2; shelf += 1) {
    const height = 0.12 + shelf * 0.25
    box(display, [width - 0.075, 0.014, 0.54], s.white, [0, height, 0])
    for (let column = 0; column < 7; column += 1) {
      for (let row = 0; row < 2; row += 1) {
        const p = [((column - 3) * (width - 0.18)) / 7, height + 0.035, (row - 0.5) * 0.24]
        dough.push({ position: p, rotation: [Math.PI / 2, 0, 0] })
        const target = [chocolate, pistachio, berry][(column + shelf) % 3]
        target.push({
          position: [p[0], p[1] + 0.012, p[2]],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1, 1, 0.44],
        })
      }
    }
  }
  instanceParts(
    display,
    new THREE.TorusGeometry(0.047, 0.022, 6, 12),
    material('#bc8047', { roughness: 0.8 }),
    dough,
  )
  ;[chocolate, pistachio, berry].forEach((placements, index) => {
    const icing = material(['#68412e', '#8b9a5c', '#c5889b'][index], { roughness: 0.34 })
    instanceParts(display, new THREE.TorusGeometry(0.047, 0.022, 5, 12), icing, placements)
  })
  return display
}

export function salesCounter(parent, s, logo, position, width = 3.8, rotation = 0, display = true) {
  const counter = child(parent, 'retail-counter', position, rotation)
  box(counter, [width, 0.89, 0.83], s.oak, [0, 0.445, 0], 0.006)
  box(counter, [width - 0.06, 0.075, 0.02], s.aluminium, [0, 0.08, 0.426])
  box(counter, [width + 0.06, 0.045, 0.89], s.terrazzo, [0, 0.9125, 0], 0.006)
  const fronts = Array.from({ length: Math.floor(width / 0.28) }, (_, index) => ({
    position: [-width / 2 + 0.14 + index * 0.28, 0.48, 0.421],
  }))
  instanceParts(counter, new THREE.BoxGeometry(0.006, 0.73, 0.006), s.walnut, fronts)
  logoPlate(counter, s, logo, Math.min(1.45, width * 0.55), [0, 0.5, 0.442])
  if (display) pastryCase(counter, s, [width * 0.18, 0.94, 0], Math.min(1.9, width * 0.52))
  box(counter, [0.22, 0.025, 0.2], s.black, [-width * 0.3, 0.965, 0.2], 0.004)
  const pos = box(counter, [0.24, 0.035, 0.17], s.aluminium, [-width * 0.3, 1.08, 0.17], 0.004)
  pos.rotation.x = 0.6
  return counter
}

export function oven(parent, s, position) {
  const oven = child(parent, 'commercial-three-deck-oven', position)
  box(oven, [0.9, 1.72, 0.8], s.steel, [0, 0.91, 0], 0.006)
  box(oven, [0.91, 0.08, 0.82], s.black, [0, 0.15, 0])
  for (let shelf = 0; shelf < 3; shelf += 1) {
    const y = 0.52 + shelf * 0.46
    box(oven, [0.72, 0.29, 0.017], s.black, [-0.045, y, 0.409])
    box(oven, [0.6, 0.19, 0.012], s.ovenGlass, [-0.045, y, 0.422])
    box(oven, [0.5, 0.018, 0.055], s.chrome, [-0.045, y + 0.14, 0.44], 0.005)
    box(oven, [0.05, 0.045, 0.018], s.light, [0.38, y + 0.065, 0.42])
    const dial = cylinder(oven, 0.025, 0.018, s.black, [0.38, y - 0.045, 0.425], 12)
    dial.rotation.x = Math.PI / 2
  }
  box(oven, [1.1, 0.22, 0.93], s.steel, [0, 2.17, -0.1], 0.008)
  box(oven, [0.32, 0.5, 0.3], s.steel, [0, 2.53, -0.38])
}

export function mixer(parent, s, position) {
  const mixer = child(parent, 'commercial-planetary-dough-mixer', position)
  box(mixer, [0.58, 0.075, 0.71], s.steel, [0, 0.07, 0], 0.008)
  box(mixer, [0.23, 0.86, 0.27], s.white, [0, 0.5, -0.2], 0.013)
  box(mixer, [0.39, 0.24, 0.65], s.white, [0, 0.96, 0], 0.018)
  const bowlSteel = s.steel.clone()
  bowlSteel.side = THREE.DoubleSide
  const bowl = addMesh(
    mixer,
    new THREE.SphereGeometry(0.255, 28, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    bowlSteel,
    [0, 0.59, 0.1],
  )
  bowl.scale.set(1, 0.9, 1)
  const rim = addMesh(mixer, new THREE.TorusGeometry(0.254, 0.007, 6, 28), s.chrome, [0, 0.59, 0.1])
  rim.rotation.x = Math.PI / 2
  cylinder(mixer, 0.02, 0.29, s.chrome, [0, 0.73, 0.1], 10)
  const cage = addMesh(mixer, new THREE.TorusGeometry(0.23, 0.007, 5, 28), s.chrome, [0, 0.68, 0.1])
  cage.rotation.x = Math.PI / 2
  box(mixer, [0.04, 0.04, 0.02], s.orange, [0.205, 0.97, 0.21])
}

export function coolingRack(parent, s, position) {
  const rack = child(parent, 'bakery-sheet-pan-rack', position)
  const posts = [-1, 1].flatMap((x) =>
    [-1, 1].map((z) => ({ position: [x * 0.31, 0.94, z * 0.36] })),
  )
  instanceParts(rack, new THREE.CylinderGeometry(0.013, 0.013, 1.68, 8), s.steel, posts)
  const trays = []
  for (let row = 0; row < 9; row += 1) trays.push({ position: [0, 0.28 + row * 0.17, 0] })
  instanceParts(rack, new THREE.BoxGeometry(0.63, 0.018, 0.72), s.steel, trays)
  const wheels = [-1, 1].flatMap((x) =>
    [-1, 1].map((z) => ({ position: [x * 0.31, 0.08, z * 0.36], rotation: [0, 0, Math.PI / 2] })),
  )
  instanceParts(rack, new THREE.CylinderGeometry(0.045, 0.045, 0.022, 12), s.black, wheels)
}

export function refrigerator(parent, s, position) {
  const fridge = child(parent, 'commercial-upright-refrigerator', position)
  box(fridge, [0.88, 1.98, 0.8], s.steel, [0, 1.01, 0], 0.006)
  box(fridge, [0.82, 1.71, 0.014], s.black, [0, 0.92, 0.409])
  box(fridge, [0.79, 1.68, 0.018], s.steel, [0, 0.92, 0.423])
  box(fridge, [0.024, 0.54, 0.045], s.chrome, [-0.3, 1.12, 0.457], 0.005)
  box(fridge, [0.1, 0.05, 0.02], s.black, [0.23, 1.86, 0.415])
  const grilles = Array.from({ length: 7 }, (_, index) => ({
    position: [-0.27 + index * 0.09, 1.88, 0.414],
  }))
  instanceParts(fridge, new THREE.BoxGeometry(0.04, 0.055, 0.01), s.aluminium, grilles)
}

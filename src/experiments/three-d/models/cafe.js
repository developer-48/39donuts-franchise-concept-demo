import * as THREE from 'three'
import {
  addLogo,
  addMesh,
  architecturalMaterial,
  cylinder,
  instanceParts,
  label,
  loadLogoTexture,
  material,
  palette,
  roundedBox,
} from './model-helpers.js'

const FLOOR = 0.16

function surfaces() {
  return {
    plaster: architecturalMaterial('plaster', '#dedbd3'),
    concrete: architecturalMaterial('concrete', '#a4a39e'),
    terrazzo: architecturalMaterial('terrazzo', '#d3cfc4'),
    oak: architecturalMaterial('oak', '#af9170'),
    walnut: architecturalMaterial('oak', '#6e5742'),
    fabric: architecturalMaterial('fabric', '#aa8f71'),
    steel: architecturalMaterial('stainless', '#c0c5c5', { metalness: 0.9, roughness: 0.48 }),
    aluminium: material('#303635', { metalness: 0.7, roughness: 0.4 }),
    white: material('#f5f3ec', { roughness: 0.68 }),
    black: material('#171b1b', { metalness: 0.2, roughness: 0.42 }),
    orange: material(palette.orange, { roughness: 0.5 }),
    purple: material(palette.purple, { roughness: 0.57 }),
    chrome: material('#dadfdf', { metalness: 0.98, roughness: 0.19 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#d2e4e3',
      transparent: true,
      opacity: 0.13,
      metalness: 0,
      roughness: 0.045,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    ovenGlass: material('#1d2628', { metalness: 0.35, roughness: 0.12 }),
    light: material('#fff1da', { emissive: '#ffd7a3', emissiveIntensity: 0.45 }),
    leaf: material('#395240', { roughness: 0.7 }),
    soil: material('#362e25', { roughness: 1 }),
  }
}

function box(parent, size, surface, position, bevel = 0) {
  if (bevel) return roundedBox(parent, size, surface, position, bevel)
  return addMesh(parent, new THREE.BoxGeometry(...size), surface, position)
}

function child(parent, name, position = [0, 0, 0], rotation = 0) {
  const group = new THREE.Group()
  group.name = name
  group.position.set(...position)
  group.rotation.y = rotation
  parent.add(group)
  return group
}

function glass(parent, size, surface, position) {
  const pane = box(parent, size, surface, position)
  pane.castShadow = false
  pane.renderOrder = 3
  return pane
}

function frame(parent, s, width, height, position, rotation = 0, options = {}) {
  const group = child(parent, options.name || 'thermally-broken-window', position, rotation)
  const thickness = options.thickness || 0.04
  ;[-1, 1].forEach((side) => {
    box(group, [width, thickness, 0.065], s.aluminium, [0, (side * height) / 2, 0])
    box(group, [thickness, height, 0.065], s.aluminium, [(side * width) / 2, 0, 0])
  })
  if (options.glazed !== false)
    glass(group, [width - thickness, height - thickness, 0.013], s.glass, [0, 0, 0])
  if (options.mullion) box(group, [0.035, height - thickness, 0.067], s.aluminium, [0, 0, 0.006])
  return group
}

function floor(parent, s, width, depth, finish = s.terrazzo) {
  box(parent, [width + 0.2, 0.1, depth + 0.2], s.concrete, [0, 0.05, 0], 0.008)
  const surface = finish.clone()
  for (const slot of ['map', 'bumpMap', 'roughnessMap']) {
    if (!finish[slot]) continue
    surface[slot] = finish[slot].clone()
    surface[slot].repeat.set(width / 1.1, depth / 1.1)
    surface[slot].needsUpdate = true
  }
  // Finish layers receive furniture shadows but do not self-shadow a coplanar slab.
  box(parent, [width, 0.06, depth], surface, [0, 0.13, 0]).castShadow = false
  const joints = []
  for (let x = -width / 2 + 0.9; x < width / 2; x += 0.9) {
    joints.push({ position: [x, FLOOR + 0.001, 0] })
  }
  const inlays = instanceParts(
    parent,
    new THREE.BoxGeometry(0.004, 0.001, depth),
    s.concrete,
    joints,
  )
  inlays.castShadow = false
  inlays.receiveShadow = false
}

function logoPlate(parent, s, texture, width, position, rotation = 0) {
  const sign = child(parent, 'original-39-donuts-sign', position, rotation)
  box(sign, [width, width * 0.24, 0.025], s.white, [0, 0, 0], 0.006)
  addLogo(sign, texture, width * 0.84, [0, 0, 0.015])
  return sign
}

function stainlessTable(parent, s, position, width = 1.65, depth = 0.72) {
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

function espressoMachine(parent, s, position, rotation = 0) {
  const machine = child(parent, 'commercial-two-group-espresso-machine', position, rotation)
  box(machine, [0.76, 0.36, 0.46], s.steel, [0, 0.23, 0], 0.012)
  box(machine, [0.69, 0.04, 0.51], s.aluminium, [0, 0.035, 0.03], 0.004)
  box(machine, [0.64, 0.13, 0.025], s.black, [0, 0.26, 0.243], 0.003)
  ;[-0.19, 0.19].forEach((x) => {
    const dial = cylinder(machine, 0.035, 0.012, s.white, [x, 0.3, 0.265], 16)
    dial.rotation.x = Math.PI / 2
    cylinder(machine, 0.04, 0.065, s.chrome, [x, 0.15, 0.23], 12)
    const handle = cylinder(machine, 0.014, 0.17, s.black, [x, 0.145, 0.32], 10)
    handle.rotation.x = Math.PI / 2
    cylinder(machine, 0.035, 0.052, s.white, [x, 0.065, 0.24], 16)
  })
  const cups = [-0.23, 0, 0.23].map((x) => ({ position: [x, 0.45, 0] }))
  instanceParts(machine, new THREE.CylinderGeometry(0.033, 0.029, 0.055, 12), s.white, cups)
  const grinder = child(machine, 'burr-coffee-grinder', [0.55, 0, 0])
  box(grinder, [0.18, 0.29, 0.23], s.aluminium, [0, 0.16, 0], 0.008)
  cylinder(grinder, 0.085, 0.19, s.ovenGlass, [0, 0.4, -0.025], 20)
  cylinder(grinder, 0.09, 0.018, s.black, [0, 0.5, -0.025], 20)
  return machine
}

function pastryCase(parent, s, position, width = 1.65, rotation = 0) {
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

function salesCounter(parent, s, logo, position, width = 3.8, rotation = 0, display = true) {
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

function cafeTable(parent, s, position, square = false) {
  const table = child(parent, 'cafe-table', position)
  if (square) box(table, [0.65, 0.032, 0.65], s.terrazzo, [0, 0.75, 0], 0.005)
  else cylinder(table, 0.34, 0.032, s.oak, [0, 0.75, 0], 32)
  cylinder(table, 0.026, 0.69, s.chrome, [0, 0.39, 0], 12)
  cylinder(table, 0.2, 0.02, s.chrome, [0, 0.035, 0], 24)
  cylinder(table, 0.035, 0.075, s.white, [0.14, 0.802, 0.1], 16)
  cylinder(table, 0.075, 0.009, s.white, [-0.12, 0.774, -0.06], 20)
  return table
}

function chair(parent, s, position, rotation = 0) {
  const seat = child(parent, 'chrome-cafe-chair', position, rotation)
  box(seat, [0.38, 0.065, 0.37], s.fabric, [0, 0.45, 0], 0.014)
  box(seat, [0.39, 0.24, 0.04], s.oak, [0, 0.72, -0.17], 0.008)
  const legs = [-1, 1].flatMap((x) =>
    [-1, 1].map((z) => ({ position: [x * 0.155, 0.22, z * 0.14] })),
  )
  instanceParts(seat, new THREE.CylinderGeometry(0.012, 0.014, 0.43, 8), s.chrome, legs)
  instanceParts(
    seat,
    new THREE.CylinderGeometry(0.012, 0.012, 0.41, 8),
    s.chrome,
    [-1, 1].map((side) => ({ position: [side * 0.155, 0.61, -0.17] })),
  )
  return seat
}

function banquette(parent, s, position, length, rotation = 0) {
  const bench = child(parent, 'stitched-leather-banquette', position, rotation)
  box(bench, [length, 0.32, 0.55], s.walnut, [0, 0.2, 0], 0.005)
  box(bench, [length, 0.12, 0.57], s.fabric, [0, 0.42, 0], 0.017)
  box(bench, [length, 0.58, 0.12], s.fabric, [0, 0.74, -0.235], 0.012)
  const seams = Array.from({ length: Math.floor(length / 0.45) - 1 }, (_, index) => ({
    position: [-length / 2 + (index + 1) * 0.45, 0.76, -0.17],
  }))
  instanceParts(bench, new THREE.BoxGeometry(0.004, 0.49, 0.003), s.walnut, seams)
  return bench
}

function planter(parent, s, position, width = 0.52) {
  const pot = child(parent, 'architectural-planter', position)
  box(pot, [width, 0.4, width], s.concrete, [0, 0.2, 0], 0.005)
  box(pot, [width - 0.055, 0.008, width - 0.055], s.soil, [0, 0.404, 0])
  const leaves = []
  for (let index = 0; index < 25; index += 1) {
    const angle = index * 2.4
    const radius = 0.03 + (index % 5) * width * 0.035
    leaves.push({
      position: [Math.cos(angle) * radius, 0.62 + (index % 4) * 0.065, Math.sin(angle) * radius],
      rotation: [Math.cos(angle) * 0.6, angle, Math.sin(angle) * 0.6],
      scale: [0.025, 0.28 + (index % 3) * 0.04, 0.065],
    })
  }
  instanceParts(pot, new THREE.SphereGeometry(1, 7, 6), s.leaf, leaves)
  return pot
}

function pendant(parent, s, position, height = 0.5) {
  const lamp = child(parent, 'suspended-metal-pendant', position)
  cylinder(lamp, 0.004, height, s.black, [0, -height / 2, 0], 6)
  cylinder(lamp, 0.105, 0.075, s.aluminium, [0, -height - 0.0375, 0], 20)
  cylinder(lamp, 0.097, 0.006, s.light, [0, -height - 0.077, 0], 20)
}

function oven(parent, s, position) {
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

function mixer(parent, s, position) {
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

function coolingRack(parent, s, position) {
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

function refrigerator(parent, s, position) {
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

function partition(parent, s, width, z) {
  const glazed = child(parent, 'separate-production-room-glass-partition', [0, FLOOR, z])
  box(glazed, [width, 0.21, 0.1], s.plaster, [0, 0.105, 0])
  box(glazed, [width, 0.075, 0.08], s.aluminium, [0, 2.77, 0])
  const positions = [-4.58, -2.77, -0.96, 0.85, 1.82, 4.58]
  positions.forEach((x) => box(glazed, [0.045, 2.77, 0.08], s.aluminium, [x, 1.385, 0]))
  const panels = [
    [-3.675, 1.765],
    [-1.865, 1.765],
    [-0.055, 1.765],
    [3.2, 2.715],
  ]
  panels.forEach(([x, paneWidth]) =>
    glass(glazed, [paneWidth, 2.51, 0.012], s.glass, [x, 1.495, 0]),
  )
  const door = frame(glazed, s, 0.89, 2.52, [1.335, 1.5, 0], 0, {
    thickness: 0.025,
    name: 'glazed-staff-door',
  })
  box(door, [0.014, 0.3, 0.04], s.chrome, [-0.31, -0.1, 0.04], 0.003)
  return glazed
}

function workshopCafe(s, logo) {
  const group = new THREE.Group()
  group.name = 'cafe-and-independent-production-room'
  floor(group, s, 9.5, 7)
  box(group, [9.5, 3.05, 0.16], s.plaster, [0, FLOOR + 1.525, -3.42])
  box(group, [0.16, 3.05, 4.0], s.plaster, [-4.67, FLOOR + 1.525, -1.42])
  box(group, [0.16, 0.28, 2.8], s.plaster, [-4.67, FLOOR + 0.14, 2.02])
  box(group, [9.18, 0.012, 2.48], s.white, [0, FLOOR + 0.007, -2.1]).castShadow = false
  const rearJoints = []
  for (let x = -4.1; x < 4.5; x += 0.7) rearJoints.push({ position: [x, FLOOR + 0.015, -2.1] })
  const inlays = instanceParts(
    group,
    new THREE.BoxGeometry(0.004, 0.001, 2.48),
    s.concrete,
    rearJoints,
  )
  inlays.castShadow = false
  inlays.receiveShadow = false
  partition(group, s, 9.2, -0.81)
  const workshop = child(group, 'production-zone', [0, FLOOR, 0])
  stainlessTable(workshop, s, [-2.7, 0, -2.68], 2.8)
  box(workshop, [0.88, 0.025, 0.45], s.oak, [-2.8, 0.93, -2.65], 0.004)
  const pin = cylinder(workshop, 0.023, 0.5, s.oak, [-2.8, 0.97, -2.63], 12)
  pin.rotation.z = Math.PI / 2
  mixer(workshop, s, [-0.67, 0, -2.69])
  oven(workshop, s, [0.74, 0, -2.76])
  coolingRack(workshop, s, [2.08, 0, -2.7])
  refrigerator(workshop, s, [3.57, 0, -2.78])
  label(workshop, 'ПРОИЗВОДСТВО', 2.6, [-2.7, 2.42, -3.326], [0, 0, 0], '#504f4b')
  box(group, [3.8, 0.7, 0.62], s.walnut, [2.3, FLOOR + 0.35, -0.25])
  box(group, [3.85, 0.035, 0.66], s.terrazzo, [2.3, FLOOR + 0.718, -0.25])
  espressoMachine(group, s, [1.8, FLOOR + 0.74, -0.25])
  salesCounter(group, s, logo, [2.03, FLOOR, 0.92], 4.45)
  logoPlate(group, s, logo, 2.6, [2.7, 2.65, -0.749])
  banquette(group, s, [-3.92, FLOOR, 1.37], 3.1, Math.PI / 2)
  ;[0.55, 2.13].forEach((z) => {
    cafeTable(group, s, [-2.97, FLOOR, z])
    chair(group, s, [-2.27, FLOOR, z], -Math.PI / 2)
  })
  cafeTable(group, s, [-0.5, FLOOR, 2.55], true)
  chair(group, s, [-1.13, FLOOR, 2.55], Math.PI / 2)
  chair(group, s, [0.13, FLOOR, 2.55], -Math.PI / 2)
  planter(group, s, [4.12, FLOOR, 2.65])
  const roof = child(group, 'cutaway-roof-edge')
  box(roof, [9.5, 0.12, 0.4], s.white, [0, 3.27, -3.3])
  box(roof, [0.24, 0.12, 3.65], s.white, [-4.65, 3.27, -1.5])
  ;[-3.0, 0.1, 2.7].forEach((x) => pendant(group, s, [x, 3.2, 0.85], 0.64))
  return {
    group,
    roof,
    workshop,
    meta: {
      kind: 'cafe-workshop',
      label: 'Кофейня + цех',
      detail: 'Гостевой зал и собственное производство разделены стеклянной перегородкой.',
      footprint: { width: 9.5, depth: 7 },
      zoneCaption: 'Кофейня и отдельный производственный цех в одном помещении',
      zones: [
        { text: 'Производство', position: [-1.0, 1.15, -2.45] },
        { text: 'Гостевой зал', position: [-2.6, 0.3, 1.55] },
      ],
      conceptual: true,
    },
  }
}

function ordinaryCafe(s, logo) {
  const group = new THREE.Group()
  group.name = 'compact-neighbourhood-cafe-without-production'
  floor(group, s, 6.4, 5, s.terrazzo)
  box(group, [6.4, 3, 0.15], s.plaster, [0, FLOOR + 1.5, -2.425])
  box(group, [0.15, 3, 4.8], s.plaster, [-3.125, FLOOR + 1.5, 0])
  box(group, [0.15, 0.24, 4.8], s.plaster, [3.125, FLOOR + 0.12, 0])
  const slats = Array.from({ length: 26 }, (_, index) => ({
    position: [-0.54 + index * 0.134, 1.45, -2.322],
  }))
  instanceParts(group, new THREE.BoxGeometry(0.062, 2.45, 0.035), s.oak, slats)
  logoPlate(group, s, logo, 2.05, [0.3, 2.64, -2.29])
  box(group, [4.47, 0.77, 0.63], s.walnut, [-0.6, FLOOR + 0.385, -1.87])
  box(group, [4.53, 0.035, 0.69], s.terrazzo, [-0.6, FLOOR + 0.787, -1.87])
  espressoMachine(group, s, [-0.85, FLOOR + 0.81, -1.84])
  salesCounter(group, s, logo, [-1.9, FLOOR, -0.09], 3.15, Math.PI / 2)
  banquette(group, s, [1.54, FLOOR, -1.3], 2.47)
  banquette(group, s, [2.77, FLOOR, 0.31], 2.78, -Math.PI / 2)
  ;[
    [0.79, -0.45],
    [2.03, -0.45],
    [0.79, 1.27],
    [2.03, 1.27],
  ].forEach(([x, z], index) => {
    cafeTable(group, s, [x, FLOOR, z], index % 2 === 0)
    if (index < 2) chair(group, s, [x, FLOOR, z + 0.62], Math.PI)
    else chair(group, s, [x, FLOOR, z + 0.61], Math.PI)
  })
  planter(group, s, [-2.69, FLOOR, 2.01], 0.43)
  const roof = child(group, 'cutaway-roof-edge')
  box(roof, [6.4, 0.1, 0.22], s.white, [0, 3.21, -2.39])
  ;[0.77, 2.03].forEach((x) => pendant(group, s, [x, 3.15, 0.25], 0.65))
  return {
    group,
    roof,
    meta: {
      kind: 'cafe-separate',
      label: 'Кофейня',
      detail:
        'L-образный бар и четыре столика с банкеткой. Производственный цех расположен отдельно.',
      footprint: { width: 6.4, depth: 5 },
      zoneCaption: 'Компактная кофейня с баром и посадкой, производство отдельно',
      zones: [{ text: 'Гостевой зал', position: [1.5, 0.4, 0.6] }],
      conceptual: true,
    },
  }
}

function streetPavilion(s, logo) {
  const group = new THREE.Group()
  group.name = 'closed-all-season-square-street-pavilion'
  box(group, [6.1, 0.12, 6.1], s.concrete, [0, 0.06, 0], 0.006)
  const paving = []
  for (let x = 0; x < 10; x += 1)
    for (let z = 0; z < 10; z += 1)
      paving.push({ position: [-2.7 + x * 0.6, 0.13, -2.7 + z * 0.6] })
  const pavers = instanceParts(group, new THREE.BoxGeometry(0.59, 0.025, 0.59), s.terrazzo, paving)
  pavers.castShadow = false
  box(group, [4.5, 0.18, 4.5], s.aluminium, [0, 0.235, 0])
  box(group, [4.3, 0.035, 4.3], s.terrazzo, [0, 0.343, 0])
  const base = 0.36
  const wallTop = 3.14
  // The complete weatherproof shell has actual door and service-window apertures.
  box(group, [4.5, wallTop - base, 0.14], s.aluminium, [0, (wallTop + base) / 2, -2.18])
  box(group, [0.14, wallTop - base, 4.36], s.aluminium, [-2.18, (wallTop + base) / 2, 0])
  box(group, [0.14, wallTop - base, 0.7], s.aluminium, [2.18, (wallTop + base) / 2, -1.9])
  box(group, [0.14, wallTop - base, 0.5], s.aluminium, [2.18, (wallTop + base) / 2, 2])
  box(group, [0.14, 0.82, 3.16], s.oak, [2.18, base + 0.41, 0.03])
  box(group, [0.14, 0.6, 3.16], s.aluminium, [2.18, 2.84, 0.03])
  frame(group, s, 3.14, 1.34, [2.195, 1.86, 0.03], Math.PI / 2, {
    mullion: true,
    name: 'sealed-side-insulated-glazing',
  })
  const sideSlats = Array.from({ length: 36 }, (_, index) => ({
    position: [2.257, 0.78, -1.51 + index * 0.086],
  }))
  instanceParts(group, new THREE.BoxGeometry(0.026, 0.79, 0.044), s.walnut, sideSlats)
  box(group, [0.22, wallTop - base, 0.14], s.aluminium, [-2.14, (wallTop + base) / 2, 2.18])
  box(group, [0.14, wallTop - base, 0.14], s.aluminium, [-0.85, (wallTop + base) / 2, 2.18])
  box(group, [0.28, wallTop - base, 0.14], s.aluminium, [2.11, (wallTop + base) / 2, 2.18])
  box(group, [2.82, 0.82, 0.14], s.oak, [0.63, base + 0.41, 2.18])
  box(group, [4.5, 0.6, 0.14], s.aluminium, [0, 2.84, 2.18])
  const frontSlats = Array.from({ length: 33 }, (_, index) => ({
    position: [-0.69 + index * 0.086, 0.78, 2.257],
  }))
  instanceParts(group, new THREE.BoxGeometry(0.044, 0.79, 0.026), s.walnut, frontSlats)
  const serving = frame(group, s, 2.78, 1.34, [0.63, 1.86, 2.2], 0, {
    name: 'sliding-service-window',
    mullion: true,
  })
  box(serving, [0.33, 0.025, 0.02], s.chrome, [0.23, -0.29, 0.047], 0.002)
  box(group, [2.96, 0.055, 0.32], s.black, [0.63, 1.165, 2.3], 0.004)
  const door = frame(group, s, 1.08, 2.23, [-1.495, 1.475, 2.2], 0, {
    name: 'sealed-staff-entrance',
    thickness: 0.045,
  })
  box(door, [0.93, 0.35, 0.025], s.aluminium, [0, -0.91, 0])
  box(door, [0.018, 0.34, 0.055], s.chrome, [0.39, -0.15, 0.057], 0.004)
  box(group, [1.19, 0.085, 0.46], s.concrete, [-1.5, 0.19, 2.38])
  box(group, [1.12, 0.04, 0.38], s.black, [-1.5, 0.248, 2.4])
  // Interior remains legible through the glazing: counter, coffee equipment, storage.
  box(group, [3.8, 0.79, 0.66], s.walnut, [0.1, base + 0.395, -1.63])
  box(group, [3.85, 0.035, 0.7], s.terrazzo, [0.1, base + 0.807, -1.63])
  espressoMachine(group, s, [-0.5, base + 0.83, -1.62])
  salesCounter(group, s, logo, [0.55, base, 1.48], 2.54, 0, false)
  pastryCase(group, s, [0.53, base + 0.94, 1.48], 1.68)
  box(group, [0.9, 0.68, 0.035], s.black, [1.33, 2.23, -2.096])
  label(group, 'COFFEE & DONUTS', 0.76, [1.33, 2.37, -2.074], [0, 0, 0], '#f0ece0')
  const roof = child(group, 'complete-insulated-flat-roof')
  box(roof, [4.74, 0.22, 4.74], s.aluminium, [0, 3.3, 0], 0.004)
  box(roof, [4.8, 0.07, 4.8], s.black, [0, 3.445, 0], 0.004)
  box(roof, [4.79, 0.035, 0.045], s.orange, [0, 3.45, 2.418])
  box(roof, [0.045, 0.035, 4.79], s.orange, [2.418, 3.45, 0])
  box(roof, [4.62, 0.42, 0.1], s.orange, [0, 3.18, 2.28])
  logoPlate(roof, s, logo, 2.39, [0.3, 3.185, 2.34])
  box(roof, [0.1, 0.42, 4.62], s.orange, [2.28, 3.18, 0])
  logoPlate(roof, s, logo, 2.12, [2.34, 3.185, -0.1], Math.PI / 2)
  const drain = cylinder(group, 0.032, 2.9, s.aluminium, [2.24, 1.76, -2.22], 12)
  drain.name = 'roof-rainwater-downpipe'
  planter(group, s, [-2.53, 0.145, 2.43], 0.51)
  planter(group, s, [2.59, 0.145, 2.43], 0.51)
  return {
    group,
    roof,
    meta: {
      kind: 'island',
      label: 'Уличный павильон',
      detail: 'Закрытый квадратный павильон с утеплённым контуром, крышей, дверью и окном выдачи.',
      footprint: { width: 4.5, depth: 4.5 },
      zoneCaption: 'Закрытый уличный павильон с утеплённым контуром и окном выдачи',
      zones: [{ text: 'Уличный павильон', position: [0, 3.58, 0.5] }],
      conceptual: true,
      enclosed: true,
    },
  }
}

/** Architectural studies, not exact plans. Front faces +Z; dimensions deliberately differ. */
export function createCafe(kind = 'cafe-workshop') {
  const s = surfaces()
  const logo = loadLogoTexture()
  const model =
    kind === 'island'
      ? streetPavilion(s, logo)
      : kind === 'cafe-separate'
        ? ordinaryCafe(s, logo)
        : workshopCafe(s, logo)
  model.group.userData.architecture = model.meta
  return model
}

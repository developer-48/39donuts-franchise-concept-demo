import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  addLogo,
  addMesh,
  cylinder,
  instanceParts,
  label,
  loadLogoTexture,
  material,
  palette,
  roundedBox,
} from './model-helpers.js'

function createSurfaces() {
  return {
    cream: material(palette.cream),
    paper: material(palette.paper, { roughness: 0.82 }),
    floor: material('#e8d5bb', { roughness: 0.72 }),
    wood: material(palette.wood, { roughness: 0.63 }),
    darkWood: material(palette.woodDark, { roughness: 0.67 }),
    orange: material(palette.orange, { roughness: 0.35 }),
    purple: material(palette.purple, { roughness: 0.4 }),
    graphite: material(palette.graphite, { roughness: 0.4 }),
    metal: material(palette.metal, { metalness: 0.82, roughness: 0.24 }),
    brass: material('#b79b68', { metalness: 0.75, roughness: 0.32 }),
    green: material(palette.green),
    leaf: material('#406d43'),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#d4e4df',
      transparent: true,
      opacity: 0.19,
      roughness: 0.08,
      metalness: 0,
      depthWrite: false,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    glow: material('#fff1c5', { emissive: '#ffc965', emissiveIntensity: 0.55 }),
  }
}

function addFloor(group, surfaces, { width = 6.4, depth = 4.8 } = {}) {
  roundedBox(group, [width, 0.28, depth], surfaces.paper, [0, 0.14, 0], 0.18)
  roundedBox(group, [width - 0.18, 0.055, depth - 0.18], surfaces.floor, [0, 0.3, 0], 0.13)
  const tiles = []
  for (let column = 0; column < 8; column += 1) {
    for (let row = 0; row < 6; row += 1) {
      tiles.push({ position: [-2.73 + column * 0.78, 0.334, -1.93 + row * 0.77] })
    }
  }
  instanceParts(
    group,
    new THREE.BoxGeometry(0.755, 0.018, 0.745),
    material('#efe1ce', { roughness: 0.85 }),
    tiles,
  )
}

function addWall(group, surfaces, logo, separateWorkshop) {
  roundedBox(group, [6.1, 3.25, 0.16], surfaces.cream, [0, 1.95, -2.19], 0.06)
  roundedBox(group, [6.1, 0.1, 0.21], surfaces.darkWood, [0, 0.42, -2.16], 0.025)
  roundedBox(group, [3.15, 1.65, 0.13], surfaces.darkWood, [0.9, 1.31, -2.04], 0.025)
  instanceParts(
    group,
    new THREE.BoxGeometry(0.055, 1.57, 0.065),
    surfaces.wood,
    Array.from({ length: 35 }, (_, index) => ({
      position: [-0.56 + index * 0.087, 1.31, -1.94],
    })),
  )
  roundedBox(group, [3.45, 0.79, 0.12], surfaces.paper, [0.45, 2.85, -2.035], 0.1)
  addLogo(group, logo, 2.67, [0.45, 2.86, -1.964])
  label(group, 'КОФЕ · ПОНЧИКИ · РАДОСТЬ', 2.75, [0.45, 2.54, -1.962], [0, 0, 0])

  // A glazed production window distinguishes the in-house bakery model.
  roundedBox(group, [1.45, 2.3, 0.12], surfaces.graphite, [-2.11, 1.6, -2.035], 0.035)
  roundedBox(group, [1.27, 2.1, 0.06], surfaces.glass, [-2.11, 1.6, -1.951], 0.02)
  roundedBox(group, [0.04, 2.12, 0.075], surfaces.brass, [-2.11, 1.6, -1.9], 0.01)
  roundedBox(group, [1.28, 0.04, 0.075], surfaces.brass, [-2.11, 1.82, -1.9], 0.01)
  if (!separateWorkshop) {
    roundedBox(group, [1.05, 0.68, 0.16], surfaces.metal, [-2.11, 1.25, -2.01], 0.025)
    instanceParts(
      group,
      new THREE.BoxGeometry(0.91, 0.035, 0.21),
      surfaces.darkWood,
      [0.97, 1.14, 1.31, 1.48].map((height) => ({ position: [-2.11, height, -1.85] })),
    )
  } else {
    roundedBox(group, [1.05, 0.72, 0.08], surfaces.purple, [-2.11, 1.4, -1.88], 0.03)
    label(group, 'COFFEE & DONUTS', 0.95, [-2.11, 1.4, -1.831], [0, 0, 0], palette.cream)
  }

  // One short cutaway wall adds architectural depth without hiding the interior.
  roundedBox(group, [0.15, 1.16, 2.55], surfaces.cream, [-3.0, 0.91, -0.92], 0.04)
  roundedBox(group, [0.18, 0.09, 2.58], surfaces.wood, [-3.0, 1.52, -0.92], 0.025)
}

function addEspressoMachine(group, surfaces, position) {
  const machine = new THREE.Group()
  machine.position.set(...position)
  group.add(machine)
  roundedBox(machine, [0.84, 0.45, 0.48], surfaces.metal, [0, 0.27, 0], 0.06)
  roundedBox(machine, [0.77, 0.1, 0.53], surfaces.graphite, [0, 0.045, 0.04], 0.02)
  roundedBox(machine, [0.66, 0.16, 0.03], surfaces.graphite, [0, 0.31, 0.254], 0.01)
  const dials = [-0.23, 0, 0.23].map((x) => ({
    position: [x, 0.34, 0.282],
    rotation: [Math.PI / 2, 0, 0],
  }))
  instanceParts(machine, new THREE.CylinderGeometry(0.028, 0.028, 0.025, 12), surfaces.brass, dials)
  ;[-0.2, 0.2].forEach((x) => {
    cylinder(machine, 0.052, 0.09, surfaces.metal, [x, 0.16, 0.25], 12)
    const handle = cylinder(machine, 0.02, 0.16, surfaces.graphite, [x, 0.16, 0.35], 12)
    handle.rotation.x = Math.PI / 2
    cylinder(machine, 0.055, 0.075, surfaces.paper, [x, 0.1, 0.35], 16)
  })
  instanceParts(
    machine,
    new THREE.CylinderGeometry(0.052, 0.043, 0.072, 12),
    surfaces.paper,
    [-0.23, 0, 0.23].map((x) => ({ position: [x, 0.535, 0] })),
  )
}

function addPastries(group, surfaces, center, width = 1.9) {
  const frameWidth = width + 0.12
  roundedBox(
    group,
    [frameWidth, 0.055, 0.7],
    surfaces.metal,
    [center[0], center[1], center[2]],
    0.025,
  )
  ;[-1, 1].forEach((side) => {
    roundedBox(
      group,
      [0.025, 0.73, 0.025],
      surfaces.brass,
      [center[0] + (side * width) / 2, center[1] + 0.39, center[2] + 0.31],
      0.008,
    )
    roundedBox(
      group,
      [0.025, 0.73, 0.025],
      surfaces.brass,
      [center[0] + (side * width) / 2, center[1] + 0.39, center[2] - 0.31],
      0.008,
    )
    roundedBox(
      group,
      [0.015, 0.68, 0.59],
      surfaces.glass,
      [center[0] + (side * width) / 2, center[1] + 0.39, center[2]],
      0.005,
    )
  })
  roundedBox(
    group,
    [width, 0.7, 0.012],
    surfaces.glass,
    [center[0], center[1] + 0.39, center[2] + 0.32],
    0.005,
  )
  roundedBox(
    group,
    [frameWidth, 0.025, 0.7],
    surfaces.glass,
    [center[0], center[1] + 0.76, center[2]],
    0.008,
  )

  const flavors = ['#6d3f2b', '#a0b96f', '#d7a0b2'].map((color) =>
    material(color, { roughness: 0.35 }),
  )
  const bases = []
  const glaze = [[], [], []]
  for (let shelf = 0; shelf < 2; shelf += 1) {
    const height = center[1] + 0.08 + shelf * 0.35
    roundedBox(
      group,
      [width - 0.1, 0.025, 0.59],
      surfaces.paper,
      [center[0], height, center[2]],
      0.01,
    )
    for (let column = 0; column < 5; column += 1) {
      for (let row = 0; row < 2; row += 1) {
        const position = [
          center[0] + (column - 2) * ((width - 0.3) / 5),
          height + 0.06,
          center[2] + (row - 0.5) * 0.28,
        ]
        bases.push({ position, rotation: [Math.PI / 2, 0, 0] })
        glaze[(column + row + shelf) % 3].push({
          position: [position[0], position[1] + 0.023, position[2]],
          rotation: [Math.PI / 2, 0, 0],
          scale: [0.99, 0.99, 0.58],
        })
      }
    }
  }
  instanceParts(group, new THREE.TorusGeometry(0.075, 0.037, 7, 14), material('#ce8c48'), bases)
  glaze.forEach((placements, index) => {
    instanceParts(group, new THREE.TorusGeometry(0.076, 0.038, 6, 14), flavors[index], placements)
  })
}

function addCounter(group, surfaces, logo, island = false) {
  const counter = new THREE.Group()
  counter.position.set(island ? 0 : 0.7, 0, island ? 0 : -0.6)
  group.add(counter)
  const width = island ? 5.05 : 4.3
  roundedBox(counter, [width, 0.88, 1.15], surfaces.wood, [0, 0.79, 0], 0.075)
  roundedBox(counter, [width + 0.15, 0.12, 1.27], surfaces.paper, [0, 1.28, 0], 0.045)
  roundedBox(counter, [width - 0.08, 0.12, 0.035], surfaces.purple, [0, 0.44, 0.594], 0.014)
  instanceParts(
    counter,
    new THREE.BoxGeometry(0.035, 0.7, 0.033),
    surfaces.darkWood,
    Array.from({ length: 29 }, (_, index) => ({
      position: [-(width - 0.2) / 2 + (index * (width - 0.2)) / 28, 0.84, 0.587],
    })),
  )
  roundedBox(counter, [2.15, 0.63, 0.045], surfaces.cream, [0, 0.88, 0.628], 0.12)
  addLogo(counter, logo, 1.83, [0, 0.88, 0.659])
  addPastries(counter, surfaces, [island ? 1.08 : 0.98, 1.35, 0], island ? 2.3 : 1.95)
  addEspressoMachine(counter, surfaces, [-1.2, 1.36, -0.05])
  roundedBox(counter, [0.23, 0.24, 0.15], surfaces.graphite, [-0.45, 1.48, 0.26], 0.02)
  const terminal = roundedBox(
    counter,
    [0.27, 0.035, 0.25],
    surfaces.purple,
    [-0.45, 1.63, 0.29],
    0.02,
  )
  terminal.rotation.x = 0.28
}

function addPendant(group, surfaces, position) {
  const lamp = new THREE.Group()
  lamp.position.set(...position)
  group.add(lamp)
  cylinder(lamp, 0.015, 0.54, surfaces.graphite, [0, 0.27, 0], 8)
  addMesh(lamp, new THREE.ConeGeometry(0.25, 0.28, 24, 1, true), surfaces.orange, [0, -0.14, 0])
  cylinder(lamp, 0.217, 0.025, surfaces.glow, [0, -0.276, 0], 24)
}

function addSeating(group, surfaces, position, rotation = 0) {
  const seating = new THREE.Group()
  seating.position.set(...position)
  seating.rotation.y = rotation
  group.add(seating)
  cylinder(seating, 0.46, 0.065, surfaces.wood, [0, 1.04, 0], 32)
  cylinder(seating, 0.045, 0.67, surfaces.graphite, [0, 0.68, 0], 12)
  cylinder(seating, 0.28, 0.045, surfaces.graphite, [0, 0.35, 0], 20)
  ;[-0.74, 0.74].forEach((x) => {
    roundedBox(seating, [0.41, 0.09, 0.43], surfaces.purple, [x, 0.73, 0], 0.06)
    roundedBox(seating, [0.07, 0.44, 0.43], surfaces.wood, [x + Math.sign(x) * 0.2, 0.97, 0], 0.035)
    const legs = [-1, 1].flatMap((sideX) =>
      [-1, 1].map((sideZ) => ({
        position: [x + sideX * 0.15, 0.5, sideZ * 0.15],
      })),
    )
    instanceParts(
      seating,
      new THREE.CylinderGeometry(0.02, 0.027, 0.38, 8),
      surfaces.graphite,
      legs,
    )
  })
  cylinder(seating, 0.055, 0.1, surfaces.paper, [0.1, 1.115, 0.06], 14)
  cylinder(seating, 0.09, 0.015, surfaces.orange, [-0.15, 1.085, -0.09], 18)
}

function addPlant(group, surfaces, position) {
  const plant = new THREE.Group()
  plant.position.set(...position)
  group.add(plant)
  addMesh(plant, new THREE.CylinderGeometry(0.25, 0.2, 0.43, 20), surfaces.cream, [0, 0.55, 0])
  cylinder(plant, 0.22, 0.02, surfaces.darkWood, [0, 0.77, 0], 18)
  const leaves = []
  const stalks = []
  for (let index = 0; index < 9; index += 1) {
    const angle = index * 2.4
    const height = 0.56 + (index % 3) * 0.18
    const x = Math.cos(angle) * 0.19
    const z = Math.sin(angle) * 0.19
    stalks.push({ position: [x / 2, 0.76 + height / 2, z / 2], scale: [1, height, 1] })
    leaves.push({
      position: [x, 0.78 + height, z],
      rotation: [0.4 + (index % 2) * 0.2, angle, 0.5],
      scale: [0.12, 0.28, 0.04],
    })
  }
  instanceParts(plant, new THREE.CylinderGeometry(0.011, 0.011, 1, 6), surfaces.green, stalks)
  instanceParts(plant, new THREE.SphereGeometry(1, 10, 8), surfaces.leaf, leaves)
}

function addIslandCanopy(group, surfaces, logo) {
  const posts = [-2.55, 2.55].flatMap((x) => [-0.65, 0.65].map((z) => ({ position: [x, 1.9, z] })))
  instanceParts(group, new RoundedBoxGeometry(0.07, 3.15, 0.07, 1, 0.018), surfaces.brass, posts)
  roundedBox(group, [5.35, 0.55, 1.8], surfaces.paper, [0, 3.54, 0], 0.13)
  roundedBox(group, [5.43, 0.09, 1.87], surfaces.orange, [0, 3.24, 0], 0.035)
  addLogo(group, logo, 2.35, [0, 3.55, 0.908])
  addLogo(group, logo, 2.35, [0, 3.55, -0.908], [0, Math.PI, 0])
  roundedBox(group, [4.45, 0.015, 0.7], surfaces.glow, [0, 3.238, 0], 0.01)
}

/** A cutaway architectural miniature. Front faces +Z; the floor is centred on XZ. */
export function createCafe(kind = 'cafe-workshop') {
  const group = new THREE.Group()
  group.name = `39-donuts-${kind}`
  const surfaces = createSurfaces()
  const logo = loadLogoTexture()
  addFloor(group, surfaces)

  if (kind === 'island') {
    addCounter(group, surfaces, logo, true)
    addIslandCanopy(group, surfaces, logo)
    addPlant(group, surfaces, [-2.72, 0, 1.58])
    addPlant(group, surfaces, [2.72, 0, 1.58])
    roundedBox(group, [1.1, 0.045, 0.38], surfaces.purple, [0, 0.37, 1.94], 0.06)
    label(group, 'СЧАСТЬЕ РЯДОМ', 1, [0, 0.397, 1.94], [-Math.PI / 2, 0, 0], palette.cream)
  } else {
    addWall(group, surfaces, logo, kind === 'cafe-separate')
    addCounter(group, surfaces, logo)
    ;[-0.7, 1.5].forEach((x) => addPendant(group, surfaces, [x, 2.75, -0.55]))
    addSeating(group, surfaces, [-1.58, 0, 1.19], 0)
    addPlant(group, surfaces, [2.57, 0, 1.65])
    if (kind === 'cafe-separate') {
      addSeating(group, surfaces, [1.3, 0, 1.35], Math.PI / 2)
    }
    roundedBox(group, [0.76, 0.08, 1.72], surfaces.wood, [-2.6, 1.14, -0.7], 0.035)
    cylinder(group, 0.09, 0.15, surfaces.orange, [-2.6, 1.26, -0.7], 18)
  }

  return { group }
}

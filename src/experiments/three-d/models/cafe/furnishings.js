import * as THREE from 'three'
import { cylinder, instanceParts } from '../model-helpers.js'
import { box, child } from './building.js'

export function cafeTable(parent, s, position, square = false) {
  const table = child(parent, 'cafe-table', position)
  if (square) box(table, [0.65, 0.032, 0.65], s.terrazzo, [0, 0.75, 0], 0.005)
  else cylinder(table, 0.34, 0.032, s.oak, [0, 0.75, 0], 32)
  cylinder(table, 0.026, 0.69, s.chrome, [0, 0.39, 0], 12)
  cylinder(table, 0.2, 0.02, s.chrome, [0, 0.035, 0], 24)
  cylinder(table, 0.035, 0.075, s.white, [0.14, 0.802, 0.1], 16)
  cylinder(table, 0.075, 0.009, s.white, [-0.12, 0.774, -0.06], 20)
  return table
}

export function chair(parent, s, position, rotation = 0) {
  const seat = child(parent, 'chrome-cafe-chair', position, rotation)
  seat.userData.assetRole = 'dining-chair'
  seat.userData.seatHeight = 0.45
  seat.userData.facing = '+Z'
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

export function banquette(parent, s, position, length, rotation = 0) {
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

export function planter(parent, s, position, width = 0.52) {
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

export function pendant(parent, s, position, height = 0.5) {
  const lamp = child(parent, 'suspended-metal-pendant', position)
  cylinder(lamp, 0.004, height, s.black, [0, -height / 2, 0], 6)
  cylinder(lamp, 0.105, 0.075, s.aluminium, [0, -height - 0.0375, 0], 20)
  cylinder(lamp, 0.097, 0.006, s.light, [0, -height - 0.077, 0], 20)
}

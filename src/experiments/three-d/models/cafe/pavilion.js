import * as THREE from 'three'
import { cylinder, instanceParts, label } from '../model-helpers.js'
import { box, child, frame, logoPlate } from './building.js'
import { espressoMachine, salesCounter, pastryCase } from './equipment.js'
import { planter } from './furnishings.js'

export function streetPavilion(s, logo) {
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
  const cornerPosts = [
    { position: [-2.255, (wallTop + base) / 2, 2.175] },
    { position: [2.255, (wallTop + base) / 2, 2.175] },
    { position: [2.255, (wallTop + base) / 2, -2.175] },
  ]
  instanceParts(group, new THREE.BoxGeometry(0.035, wallTop - base, 0.05), s.black, cornerPosts)
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
  // A full-height fascia sits BELOW the roof. Both signs have real clearances;
  // the complete rear/side infill closes the insulated envelope up to its ceiling.
  box(roof, [4.5, 0.6, 0.14], s.aluminium, [0, 3.43, -2.18])
  box(roof, [0.14, 0.6, 4.36], s.aluminium, [-2.18, 3.43, 0])
  box(roof, [4.74, 0.18, 4.74], s.aluminium, [0, 3.82, 0], 0.004)
  box(roof, [4.8, 0.035, 4.8], s.black, [0, 3.9275, 0], 0.003)
  box(roof, [4.3, 0.018, 4.3], s.white, [0, 3.728, 0], 0.002)
  box(roof, [4.79, 0.028, 0.045], s.orange, [0, 3.932, 2.418])
  box(roof, [0.045, 0.028, 4.79], s.orange, [2.418, 3.932, 0])
  box(roof, [4.62, 0.64, 0.1], s.orange, [0, 3.39, 2.28], 0.004)
  box(roof, [4.5, 0.04, 0.14], s.black, [0, 3.72, 2.18])
  logoPlate(roof, s, logo, 2.58, [0.3, 3.39, 2.346], 0, 0.49)
  box(roof, [0.1, 0.64, 4.62], s.orange, [2.28, 3.39, 0], 0.004)
  box(roof, [0.14, 0.04, 4.5], s.black, [2.18, 3.72, 0])
  logoPlate(roof, s, logo, 2.3, [2.346, 3.39, -0.1], Math.PI / 2, 0.47)
  const seams = Array.from({ length: 7 }, (_, index) => ({
    position: [-1.98 + index * 0.66, 3.951, 0],
  }))
  instanceParts(roof, new THREE.BoxGeometry(0.009, 0.012, 4.68), s.aluminium, seams)
  box(roof, [3.88, 0.009, 0.025], s.light, [0, 3.076, 2.095], 0.002)
  const drain = cylinder(group, 0.032, 3.55, s.aluminium, [2.24, 2.12, -2.22], 12)
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
      zones: [{ text: 'Уличный павильон', position: [0, 4.06, 0.5] }],
      conceptual: true,
      enclosed: true,
    },
  }
}

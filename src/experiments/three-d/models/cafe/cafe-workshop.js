import * as THREE from 'three'
import { cylinder, instanceParts, label } from '../model-helpers.js'
import { FLOOR, box, child, floor, logoPlate, partition } from './building.js'
import {
  stainlessTable,
  espressoMachine,
  salesCounter,
  oven,
  mixer,
  coolingRack,
  refrigerator,
} from './equipment.js'
import { cafeTable, chair, banquette, planter, pendant } from './furnishings.js'

export function workshopCafe(s, logo) {
  const group = new THREE.Group()
  group.name = 'cafe-and-independent-production-room'
  floor(group, s, 9.5, 7)
  box(group, [9.5, 3.05, 0.16], s.plaster, [0, FLOOR + 1.525, -3.42])
  box(group, [0.16, 3.05, 4.0], s.plaster, [-4.67, FLOOR + 1.525, -1.42])
  box(group, [0.16, 0.28, 2.8], s.plaster, [-4.67, FLOOR + 0.14, 2.02])
  box(group, [9.18, 0.075, 0.018], s.walnut, [0, FLOOR + 0.0375, -3.326])
  box(group, [0.018, 0.075, 6.76], s.walnut, [-4.576, FLOOR + 0.0375, 0])
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
  box(roof, [9.18, 0.022, 0.035], s.aluminium, [0, 3.192, -3.2])
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

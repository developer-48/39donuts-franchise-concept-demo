import * as THREE from 'three'
import { instanceParts } from '../model-helpers.js'
import { FLOOR, box, child, floor, logoPlate } from './building.js'
import { espressoMachine, salesCounter } from './equipment.js'
import { cafeTable, chair, banquette, planter, pendant } from './furnishings.js'

export function ordinaryCafe(s, logo) {
  const group = new THREE.Group()
  group.name = 'compact-neighbourhood-cafe-without-production'
  floor(group, s, 6.4, 5, s.terrazzo)
  box(group, [6.4, 3, 0.15], s.plaster, [0, FLOOR + 1.5, -2.425])
  box(group, [0.15, 3, 4.8], s.plaster, [-3.125, FLOOR + 1.5, 0])
  box(group, [0.15, 0.24, 4.8], s.plaster, [3.125, FLOOR + 0.12, 0])
  box(group, [6.07, 0.075, 0.018], s.walnut, [0, FLOOR + 0.0375, -2.34])
  box(group, [0.018, 0.075, 4.67], s.walnut, [-3.04, FLOOR + 0.0375, 0])
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
  box(roof, [6.07, 0.022, 0.035], s.aluminium, [0, 3.142, -2.3])
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

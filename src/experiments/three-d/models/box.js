import * as THREE from 'three'
import { createDonut } from './donut.js'
import {
  addLogo,
  instanceParts,
  label,
  loadLogoTexture,
  material,
  palette,
  roundedBox,
} from './model-helpers.js'

function addPaper(group, surface) {
  roundedBox(group, [6.07, 0.012, 3.97], surface, [0, 0.17, 0], 0.02)
  // Shallow folded liner edges sit inside the carton rather than floating around it.
  ;[-1, 1].forEach((side) => {
    const edge = roundedBox(group, [6.03, 0.17, 0.025], surface, [0, 0.31, side * 1.92], 0.01)
    edge.rotation.x = side * 0.16
  })
}

function addDonuts(group) {
  const flavors = ['chocolate', 'pistachio', 'berry', 'vanilla', 'berry', 'chocolate']
  flavors.forEach((flavor, index) => {
    const { group: donut } = createDonut({ flavor, detail: 'low', seed: index + 31 })
    donut.scale.setScalar(0.51)
    donut.position.set(((index % 3) - 1) * 1.98, 0.42, index < 3 ? -0.97 : 0.97)
    donut.rotation.y = (index * 1.3) % (Math.PI * 2)
    group.add(donut)
  })
}

/** Six-donut carton with a rear hinge. setOpen is deterministic and owns no animation loop. */
export function createDonutBox() {
  const group = new THREE.Group()
  group.name = '39-donuts-unboxing'
  const orange = material(palette.orange, { roughness: 0.82 })
  const paper = material(palette.paper, { roughness: 0.88 })
  const cream = material(palette.cream, { roughness: 0.86 })
  const purple = material(palette.purple, { roughness: 0.48 })
  const logo = loadLogoTexture()
  const width = 6.4
  const depth = 4.3
  const wallHeight = 0.64

  roundedBox(group, [width, 0.055, depth], orange, [0, 0.12, 0], 0.015)
  addPaper(group, paper)

  ;[-1, 1].forEach((side) => {
    roundedBox(group, [width, wallHeight, 0.045], orange, [0, 0.49, side * 2.1], 0.012)
    roundedBox(
      group,
      [width - 0.17, wallHeight - 0.03, 0.025],
      cream,
      [0, 0.49, side * 2.068],
      0.01,
    )
    roundedBox(group, [0.045, wallHeight, depth - 0.1], orange, [side * 3.145, 0.49, 0], 0.012)
    roundedBox(
      group,
      [0.025, wallHeight - 0.03, depth - 0.23],
      cream,
      [side * 3.113, 0.49, 0],
      0.01,
    )
  })

  // White front label and restrained purple corner strips echo the existing identity.
  roundedBox(group, [2.4, 0.45, 0.006], cream, [0, 0.48, 2.127], 0.015)
  addLogo(group, logo, 1.98, [0, 0.48, 2.133])
  ;[-1, 1].forEach((side) => {
    roundedBox(group, [0.38, 0.14, 0.006], purple, [side * 2.67, 0.36, 2.128], 0.006)
  })
  addDonuts(group)

  const lid = new THREE.Group()
  lid.name = 'hinged-lid'
  lid.position.set(0, 0.84, -2.1)
  group.add(lid)

  roundedBox(lid, [6.43, 0.045, 4.31], orange, [0, 0, 2.1], 0.012)
  roundedBox(lid, [6.37, 0.008, 4.25], cream, [0, -0.027, 2.1], 0.006)
  roundedBox(lid, [3.95, 0.004, 1.22], paper, [0, 0.026, 2.1], 0.015)
  addLogo(lid, logo, 3.35, [0, 0.031, 2.1], [-Math.PI / 2, 0, 0])
  addLogo(lid, logo, 3.05, [0, -0.033, 2.02], [Math.PI / 2, 0, 0])
  label(lid, 'СЧАСТЬЕ В КАЖДОЙ КОРОБКЕ', 4.8, [0, -0.034, 2.8], [Math.PI / 2, 0, 0])

  // Small printed circles add physical packaging detail without additional scene effects.
  const ring = new THREE.TorusGeometry(0.15, 0.017, 6, 24)
  instanceParts(
    lid,
    ring,
    purple,
    [-2.46, 2.46].flatMap((x) =>
      [0.65, 3.48].map((z) => ({
        position: [x, 0.027, z],
        rotation: [Math.PI / 2, 0, 0],
      })),
    ),
  )

  function setOpen(amount) {
    const progress = THREE.MathUtils.clamp(amount, 0, 1)
    lid.rotation.x = -progress * THREE.MathUtils.degToRad(110)
  }

  setOpen(0)
  return { group, lid, setOpen }
}

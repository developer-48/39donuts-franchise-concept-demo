import * as THREE from 'three'
import { addLogo, addMesh, roundedBox } from '../model-helpers.js'

export const FLOOR = 0.16

export function box(parent, size, surface, position, bevel = 0.002) {
  if (bevel) return roundedBox(parent, size, surface, position, bevel)
  return addMesh(parent, new THREE.BoxGeometry(...size), surface, position)
}

export function child(parent, name, position = [0, 0, 0], rotation = 0) {
  const group = new THREE.Group()
  group.name = name
  group.position.set(...position)
  group.rotation.y = rotation
  parent.add(group)
  return group
}

export function glass(parent, size, surface, position) {
  const pane = box(parent, size, surface, position)
  pane.castShadow = false
  pane.renderOrder = 3
  return pane
}

export function frame(parent, s, width, height, position, rotation = 0, options = {}) {
  const group = child(parent, options.name || 'thermally-broken-window', position, rotation)
  const thickness = options.thickness || 0.04
  ;[-1, 1].forEach((side) => {
    box(group, [width, thickness, 0.085], s.aluminium, [0, (side * height) / 2, 0])
    box(group, [thickness, height, 0.085], s.aluminium, [(side * width) / 2, 0, 0])
    // Separate glazing bead and rubber gasket give the profile a real recessed section.
    box(
      group,
      [width - thickness, 0.01, 0.022],
      s.black,
      [0, (side * (height - thickness)) / 2, 0.02],
      0.001,
    )
    box(
      group,
      [0.01, height - thickness, 0.022],
      s.black,
      [(side * (width - thickness)) / 2, 0, 0.02],
      0.001,
    )
    box(
      group,
      [width - thickness, 0.007, 0.012],
      s.aluminium,
      [0, (side * (height - thickness * 0.7)) / 2, 0.034],
      0.001,
    )
    box(
      group,
      [0.007, height - thickness, 0.012],
      s.aluminium,
      [(side * (width - thickness * 0.7)) / 2, 0, 0.034],
      0.001,
    )
  })
  if (options.glazed !== false)
    glass(group, [width - thickness, height - thickness, 0.013], s.glass, [0, 0, -0.012])
  if (options.mullion) box(group, [0.035, height - thickness, 0.087], s.aluminium, [0, 0, 0.006])
  return group
}

export function floor(parent, s, width, depth, finish = s.terrazzo) {
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
}

export function logoPlate(
  parent,
  s,
  texture,
  width,
  position,
  rotation = 0,
  height = width * 0.24,
) {
  const sign = child(parent, 'original-39-donuts-sign', position, rotation)
  box(sign, [width, height, 0.025], s.white, [0, 0, 0], 0.004)
  const logoWidth = Math.min(width * 0.84, ((height - 0.08) * 129) / 24)
  addLogo(sign, texture, logoWidth, [0, 0, 0.015])
  return sign
}

export function partition(parent, s, width, z) {
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

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const palette = {
  purple: '#7a44ca',
  orange: '#fe7f16',
  cream: '#fff8ed',
  paper: '#fffdf7',
  wood: '#ad7650',
  woodDark: '#73513c',
  metal: '#a7a6a0',
  graphite: '#302735',
  green: '#7c9b55',
}

export function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...options })
}

export function addMesh(parent, geometry, surface, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, surface)
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function roundedBox(parent, size, surface, position, radius = 0.05) {
  const safeRadius = Math.min(radius, ...size.map((value) => value * 0.45))
  return addMesh(parent, new RoundedBoxGeometry(...size, 2, safeRadius), surface, position)
}

export function cylinder(parent, radius, height, surface, position, segments = 24) {
  return addMesh(
    parent,
    new THREE.CylinderGeometry(radius, radius, height, segments),
    surface,
    position,
  )
}

export function instanceParts(parent, geometry, surface, placements) {
  const mesh = new THREE.InstancedMesh(geometry, surface, placements.length)
  const transform = new THREE.Object3D()
  placements.forEach(({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }, index) => {
    transform.position.set(...position)
    transform.rotation.set(...rotation)
    transform.scale.set(...scale)
    transform.updateMatrix()
    mesh.setMatrixAt(index, transform.matrix)
  })
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function loadLogoTexture() {
  const base = import.meta.env?.BASE_URL || '/'
  const texture = new THREE.TextureLoader().load(`${base}assets/brand/logo.svg`)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function addLogo(parent, texture, width, position, rotation = [0, 0, 0]) {
  const surface = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, (width * 24) / 129), surface)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  parent.add(mesh)
  return mesh
}

export function labelTexture(text, color = palette.purple) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.fillStyle = color
  context.font = '800 38px Nunito, Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 512, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function label(parent, text, width, position, rotation = [0, 0, 0], color) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / 8),
    new THREE.MeshBasicMaterial({
      map: labelTexture(text, color),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  parent.add(mesh)
  return mesh
}

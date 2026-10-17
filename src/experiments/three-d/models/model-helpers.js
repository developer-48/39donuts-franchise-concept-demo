import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { hasPhotographicSurface } from '../architecture-materials.js'

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

const surfaceNoise = (x, y, seed) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return value - Math.floor(value)
}

function surfaceTexture(pixels, size, color = false) {
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/** Local material maps keep the architectural study self-contained and deterministic. */
export function architecturalMaterial(kind, color, options = {}) {
  if (hasPhotographicSurface(kind)) {
    // Avoid generating fallback maps that will immediately be replaced by prepared photographs.
    const surface = material(color, { roughness: 0.9, ...options })
    surface.name = `architecture/${kind}`
    surface.userData = {
      architectureSurface: kind,
      architectureColor: color,
      textureWorldSize: 1.2,
    }
    return surface
  }
  const size = 256
  const colorPixels = new Uint8Array(size * size * 4)
  const heightPixels = new Uint8Array(colorPixels.length)
  const roughnessPixels = new Uint8Array(colorPixels.length)
  const base = new THREE.Color(color).convertLinearToSRGB()
  const channels = [base.r * 255, base.g * 255, base.b * 255]
  const seed = kind.length * 11
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = surfaceNoise(x, y, seed)
      const broad = surfaceNoise(Math.floor(x / 13), Math.floor(y / 13), seed + 8)
      let shade = 0.97 + grain * 0.055 + broad * 0.025
      let relief = 122 + grain * 24
      let roughness = 185 + grain * 45
      if (kind === 'oak') {
        const ribbon = Math.sin(x * 0.61 + Math.sin(y * 0.025) * 3.5)
        const pores = Math.sin(x * 2.75 + Math.sin(y * 0.041) * 1.7)
        shade = 0.91 + ribbon * 0.035 + grain * 0.065 + pores * 0.016
        relief = 130 + ribbon * 8 + pores * 3 + grain * 4
        roughness = 171 + grain * 30
      } else if (kind === 'stainless') {
        shade = 0.97 + grain * 0.016 + surfaceNoise(y, 1, seed) * 0.024
        relief = 126 + surfaceNoise(y, 1, seed) * 5
        roughness = 80 + surfaceNoise(y, 1, seed) * 37
      } else if (kind === 'terrazzo') {
        // Fine limestone aggregate, not large high-contrast decorative chips.
        const fleck = surfaceNoise(x, y, seed + 3)
        shade = fleck > 0.985 ? 0.91 : fleck < 0.02 ? 1.04 : 0.99 + grain * 0.018
        relief = 128 + grain * 3
        roughness = 198 + grain * 20
      } else if (kind === 'fabric') {
        const weave = ((x % 3) + (y % 3)) / 6
        shade = 0.93 + weave * 0.07 + grain * 0.045
        relief = 120 + weave * 23
      }
      const index = (y * size + x) * 4
      for (let channel = 0; channel < 3; channel += 1) {
        colorPixels[index + channel] = Math.min(255, channels[channel] * shade)
        heightPixels[index + channel] = relief
        roughnessPixels[index + channel] = roughness
      }
      colorPixels[index + 3] = heightPixels[index + 3] = roughnessPixels[index + 3] = 255
    }
  }
  const surface = material('#ffffff', {
    map: surfaceTexture(colorPixels, size, true),
    bumpMap: surfaceTexture(heightPixels, size),
    roughnessMap: surfaceTexture(roughnessPixels, size),
    bumpScale:
      kind === 'oak' ? 0.003 : kind === 'stainless' ? 0.0003 : kind === 'terrazzo' ? 0.001 : 0.006,
    roughness: 0.9,
    ...options,
  })
  surface.name = `architecture/${kind}`
  surface.userData.architectureSurface = kind
  surface.userData.architectureColor = color
  surface.userData.textureWorldSize = kind === 'oak' ? 1.2 : kind === 'stainless' ? 0.6 : 1.5
  return surface
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

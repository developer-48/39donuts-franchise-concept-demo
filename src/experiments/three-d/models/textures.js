import * as THREE from 'three'

const TAU = Math.PI * 2

/** Small deterministic helpers shared by geometry and its baked surface maps. */
export function seededRandom(seed = 1) {
  let state = (Number(seed) || 1) >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function lattice(x, y, seed) {
  let value = Math.imul(x + 381, 374761393) + Math.imul(y + 173, 668265263)
  value = Math.imul(value ^ (value >>> 13) ^ seed, 1274126177)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295
}

/** Fine baked cavities with irregular, softly rounded rims rather than uniform dots. */
function poreDistance(u, v, columns, rows, seed) {
  const x = u * columns
  const y = v * rows
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  let nearest = 2
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const column = ix + offsetX
      const row = iy + offsetY
      const localX = column + 0.12 + lattice(wrap(column, columns), wrap(row, rows), seed) * 0.76
      const localY = row + 0.12 + lattice(wrap(column, columns), wrap(row, rows), seed + 17) * 0.76
      nearest = Math.min(nearest, (x - localX) ** 2 + (y - localY) ** 2)
    }
  }
  return Math.sqrt(nearest)
}

const wrap = (value, period) => ((value % period) + period) % period
const smooth = (value) => value * value * (3 - 2 * value)
const mix = (a, b, amount) => a + (b - a) * amount
const clamp = (value) => Math.max(0, Math.min(1, value))

/** Periodic value noise: neither the pastry seam nor its height-map seam is visible. */
export function surfaceNoise(u, v, columns = 8, rows = 4, seed = 1) {
  const x = u * columns
  const y = v * rows
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const sx = smooth(x - ix)
  const sy = smooth(y - iy)
  const a = lattice(wrap(ix, columns), wrap(iy, rows), seed)
  const b = lattice(wrap(ix + 1, columns), wrap(iy, rows), seed)
  const c = lattice(wrap(ix, columns), wrap(iy + 1, rows), seed)
  const d = lattice(wrap(ix + 1, columns), wrap(iy + 1, rows), seed)
  return mix(mix(a, b, sx), mix(c, d, sx), sy)
}

function textureFromPixels(pixels, width, height, color = false) {
  let texture
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (context) {
      const image = context.createImageData(width, height)
      image.data.set(pixels)
      context.putImageData(image, 0, 0)
      texture = new THREE.CanvasTexture(canvas)
    }
  }
  // Also permits deterministic model inspection in Node without a canvas polyfill.
  texture ||= new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat)
  texture.flipY = false
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function writePixel(array, index, red, green = red, blue = red) {
  array[index] = Math.max(0, Math.min(255, Math.round(red)))
  array[index + 1] = Math.max(0, Math.min(255, Math.round(green)))
  array[index + 2] = Math.max(0, Math.min(255, Math.round(blue)))
  array[index + 3] = 255
}

/** Golden fried dough, including a pale proofing belt, baked pores and tiny creases. */
export function createDoughTextures(seed, detail) {
  const width = detail === 'high' ? 1024 : 512
  const height = detail === 'high' ? 256 : 128
  const color = new Uint8ClampedArray(width * height * 4)
  const bump = new Uint8ClampedArray(color.length)
  const roughness = new Uint8ClampedArray(color.length)
  const random = seededRandom(seed + 81)

  for (let y = 0; y < height; y += 1) {
    const v = y / height
    const heightOnBun = Math.cos(v * Math.PI)
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const index = (y * width + x) * 4
      const broad = surfaceNoise(u, v, 11, 6, seed)
      const middle = surfaceNoise(u, v, 43, 23, seed + 7)
      const fine = surfaceNoise(u, v, 181, 77, seed + 11)
      const fleck = random()
      const beltCenter = -0.055 + 0.016 * Math.sin(u * TAU * 7) + (broad - 0.5) * 0.07
      const belt = Math.exp(-(((heightOnBun - beltCenter) / 0.22) ** 2))
      const bake = clamp(0.42 + Math.abs(heightOnBun) * 0.23 + (broad - 0.5) * 0.38 - belt * 0.16)
      const cavity = poreDistance(u, v, 241, 91, seed + 45)
      const pore = Math.exp(-(cavity * cavity) / 0.021)
      const rim = Math.exp(-(((cavity - 0.2) / 0.07) ** 2))
      const fold = Math.pow(Math.max(0, 1 - Math.abs(middle - 0.51) * 23), 3)
      const grain = (fleck - 0.5) * 7
      const red = mix(239, 145, bake) - pore * 19 + rim * 2 + grain
      const green = mix(185, 76, bake) - pore * 16 + rim * 2 + grain
      const blue = mix(113, 27, bake) - pore * 9 + grain * 0.6
      writePixel(color, index, red, green, blue)
      writePixel(
        bump,
        index,
        134 + (middle - 0.5) * 48 + (fine - 0.5) * 28 - pore * 76 + rim * 11 + fold * 14,
      )
      writePixel(roughness, index, 201 + fine * 36 + pore * 13 - belt * 7)
    }
  }

  return {
    map: textureFromPixels(color, width, height, true),
    bumpMap: textureFromPixels(bump, width, height),
    roughnessMap: textureFromPixels(roughness, width, height),
  }
}

/** Subtle swirls and micro pits prevent icing from reading as untextured plastic. */
export function createIcingTextures(seed, detail, palette) {
  const width = detail === 'high' ? 512 : 256
  const height = detail === 'high' ? 192 : 96
  const color = new Uint8ClampedArray(width * height * 4)
  const bump = new Uint8ClampedArray(color.length)
  const roughness = new Uint8ClampedArray(color.length)
  const base = new THREE.Color(palette)
  // Canvas pixels are sRGB; THREE.Color stores the converted linear components.
  const srgb = base.clone().convertLinearToSRGB()
  const channels = [srgb.r * 255, srgb.g * 255, srgb.b * 255]
  const random = seededRandom(seed + 907)

  for (let y = 0; y < height; y += 1) {
    const v = y / height
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const index = (y * width + x) * 4
      const broad = surfaceNoise(u, v, 11, 7, seed + 13)
      const fine = surfaceNoise(u, v, 93, 47, seed + 31)
      const streak = Math.sin((u * 13 + v * 0.7 + broad * 0.4) * TAU)
      const variation = 0.91 + broad * 0.18 + streak * 0.018
      const speckle = (random() - 0.5) * 1.7
      writePixel(
        color,
        index,
        channels[0] * variation + speckle,
        channels[1] * variation + speckle,
        channels[2] * variation + speckle,
      )
      writePixel(bump, index, 133 + (fine - 0.5) * 27 + streak * 3)
      writePixel(roughness, index, 187 + broad * 42 + fine * 12)
    }
  }

  return {
    map: textureFromPixels(color, width, height, true),
    bumpMap: textureFromPixels(bump, width, height),
    roughnessMap: textureFromPixels(roughness, width, height),
  }
}

/** A real cut crumb needs irregular alveoli and toasted, compressed biscuit layers. */
export function createCookieTextures(seed, detail) {
  const width = detail === 'high' ? 384 : 192
  const height = detail === 'high' ? 192 : 96
  const color = new Uint8ClampedArray(width * height * 4)
  const bump = new Uint8ClampedArray(color.length)
  const roughness = new Uint8ClampedArray(color.length)
  const random = seededRandom(seed + 417)
  for (let y = 0; y < height; y += 1) {
    const v = y / height
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const index = (y * width + x) * 4
      const broad = surfaceNoise(u, v, 23, 11, seed)
      const fine = surfaceNoise(u, v, 83, 39, seed + 13)
      const cavity = poreDistance(u, v, 59, 31, seed + 21)
      const pore = Math.exp(-(cavity * cavity) / 0.035)
      const fleck = (random() - 0.5) * 11
      const compressed = Math.sin((v * 11 + broad * 0.13) * TAU) ** 16
      const bake = 0.2 + broad * 0.28 + pore * 0.29 + compressed * 0.06
      writePixel(
        color,
        index,
        mix(222, 137, bake) + fleck,
        mix(172, 87, bake) + fleck,
        mix(92, 31, bake) + fleck,
      )
      writePixel(bump, index, 153 + (fine - 0.5) * 34 - pore * 87 - compressed * 11)
      writePixel(roughness, index, 223 + fine * 22)
    }
  }
  return {
    map: textureFromPixels(color, width, height, true),
    bumpMap: textureFromPixels(bump, width, height),
    roughnessMap: textureFromPixels(roughness, width, height),
  }
}

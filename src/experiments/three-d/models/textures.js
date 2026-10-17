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

const wrap = (value, period) => ((value % period) + period) % period
const smooth = (value) => value * value * (3 - 2 * value)
const mix = (a, b, amount) => a + (b - a) * amount
const clamp = (value) => Math.max(0, Math.min(1, value))

/** Periodic value noise: neither the torus seam nor its height-map seam is visible. */
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
    const tubeHeight = Math.sin(v * TAU)
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const index = (y * width + x) * 4
      const broad = surfaceNoise(u, v, 9, 5, seed)
      const middle = surfaceNoise(u, v, 37, 17, seed + 7)
      const fine = surfaceNoise(u, v, 143, 61, seed + 11)
      const fleck = random()
      const beltCenter = 0.024 * Math.sin(u * TAU * 7) + (broad - 0.5) * 0.12
      const belt = Math.exp(-(((tubeHeight - beltCenter) / 0.28) ** 2))
      const bake = clamp(0.34 + Math.abs(tubeHeight) * 0.24 + (broad - 0.5) * 0.31 - belt * 0.12)
      const pore = Math.max(0, (fine - 0.58) * 2.9)
      const ridge = Math.pow(Math.max(0, 1 - Math.abs(middle - 0.51) * 23), 3)
      const grain = (fleck - 0.5) * 8
      const red = mix(242, 163, bake) - pore * 12 + grain
      const green = mix(185, 77, bake) - pore * 16 + grain
      const blue = mix(102, 24, bake) - pore * 12 + grain * 0.6
      writePixel(color, index, red, green, blue)
      writePixel(bump, index, 118 + (middle - 0.5) * 70 + fine * 43 - pore * 55 + ridge * 18)
      writePixel(roughness, index, 190 + fine * 47 - belt * 16)
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
      const streak = Math.sin((u * 19 + v * 1.2 + broad * 0.6) * TAU)
      const variation = 0.94 + broad * 0.13 + streak * 0.022
      const speckle = (random() - 0.5) * 2.4
      writePixel(
        color,
        index,
        channels[0] * variation + speckle,
        channels[1] * variation + speckle,
        channels[2] * variation + speckle,
      )
      writePixel(bump, index, 132 + (fine - 0.5) * 47 + streak * 4)
      writePixel(roughness, index, 169 + broad * 55 + fine * 16)
    }
  }

  return {
    map: textureFromPixels(color, width, height, true),
    bumpMap: textureFromPixels(bump, width, height),
    roughnessMap: textureFromPixels(roughness, width, height),
  }
}

import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { createDoughTextures, createIcingTextures, seededRandom, surfaceNoise } from './textures.js'

const TAU = Math.PI * 2
const UP = new THREE.Vector3(0, 1, 0)
const FLAVORS = {
  chocolate: {
    icing: '#3b1d11',
    drizzle: '#261008',
    crumbs: ['#a66e37', '#b8894b', '#d8b178', '#76502d', '#dec19a'],
    nuts: ['#d4b477', '#e4c99d', '#a57a42', '#bf965b'],
    roughness: 0.42,
    clearcoat: 0.28,
  },
  pistachio: {
    icing: '#99a64f',
    drizzle: '#d7ce9a',
    crumbs: ['#71823d', '#9ba34d', '#c4bb78', '#d6caa1', '#697236'],
    nuts: ['#9ca858', '#d9ca96', '#708039', '#b4b46a'],
    roughness: 0.43,
    clearcoat: 0.22,
  },
  berry: {
    icing: '#ca5278',
    drizzle: '#f1d3bc',
    crumbs: ['#9b234e', '#b53261', '#d99bac', '#ebcdb1', '#7b1638'],
    nuts: ['#f0d8b8', '#d997ac', '#a82c50', '#e7bdc4'],
    roughness: 0.4,
    clearcoat: 0.25,
  },
  vanilla: {
    icing: '#e5cb98',
    drizzle: '#67371d',
    crumbs: ['#c08b4a', '#8f552b', '#dab97e', '#e6c896', '#a26b35'],
    nuts: ['#d1a96b', '#edcca1', '#b78244', '#dcbc88'],
    roughness: 0.43,
    clearcoat: 0.24,
  },
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function toroidalShape(seed) {
  const phase = seededRandom(seed)() * TAU
  const outerDrips = Array.from({ length: 13 }, (_, index) => {
    const random = seededRandom(seed + index * 103 + 13)
    return {
      angle: ((index + random() * 0.63) / 13) * TAU,
      width: 0.038 + random() * 0.059,
      depth: 0.15 + random() * 0.5,
    }
  })
  const innerDrips = outerDrips.filter((_, index) => index % 2 === 0)

  function surface(theta, phi, offset = 0) {
    const cosine = Math.cos(theta)
    const sine = Math.sin(theta)
    const ringRadius =
      0.984 + 0.017 * Math.sin(3 * theta + phase) + 0.011 * Math.sin(7 * theta - phase)
    const doughRadius =
      0.465 * (1 + 0.027 * Math.sin(theta * 5 + phase) + 0.016 * Math.cos(theta * 9))
    const undulation =
      0.006 * Math.sin(theta * 17 + phi * 3 + phase) +
      0.003 * Math.sin(theta * 29 - phi * 7) +
      0.004 * (surfaceNoise(theta / TAU, phi / TAU, 23, 11, seed) - 0.5)
    const radial = ringRadius + (doughRadius + undulation + offset) * Math.cos(phi)
    const verticalRadius = 0.337 * (1 + 0.036 * Math.sin(theta * 3 + phase))
    let y =
      (verticalRadius + undulation + offset) * Math.sin(phi) + 0.008 * Math.sin(theta * 4 + phase)
    // The ring has rested on a baking tray, rather than floating as a perfect torus.
    y = Math.max(y, -0.298 + 0.005 * Math.cos(theta * 6 + phase))
    return new THREE.Vector3(radial * cosine, y, radial * sine)
  }

  function edge(theta, inner = false) {
    let dip = 0
    const drips = inner ? innerDrips : outerDrips
    for (const drip of drips) {
      const shifted = theta - drip.angle - (inner ? 0.18 : 0)
      const distance = Math.atan2(Math.sin(shifted), Math.cos(shifted))
      dip += Math.exp(-0.5 * (distance / drip.width) ** 2) * drip.depth
    }
    const ripple = Math.sin(theta * 11 + phase) * 0.035 + Math.cos(theta * 19) * 0.021
    return inner ? Math.PI + 0.015 + ripple + dip * 0.34 : 0.075 + ripple - dip
  }

  function icingSurface(theta, across, offset = 0.041) {
    const start = edge(theta)
    const end = edge(theta, true)
    const phi = start + (end - start) * across
    const smoothSpread = Math.sin(Math.PI * across) ** 0.55
    const ripple = Math.sin(theta * 9 + across * 13 + phase) * 0.0025 * smoothSpread
    return surface(theta, phi, offset + ripple)
  }

  return { surface, edge, icingSurface }
}

function surfaceGeometry(segments, rows, getPoint, closedShell = false) {
  const positions = []
  const uvs = []
  const indices = []
  const layers = closedShell ? 2 : 1
  const rowLength = rows + 1
  const layerLength = (segments + 1) * rowLength

  for (let layer = 0; layer < layers; layer += 1) {
    for (let segment = 0; segment <= segments; segment += 1) {
      const u = segment / segments
      for (let row = 0; row <= rows; row += 1) {
        const v = row / rows
        const point = getPoint(u * TAU, v, layer)
        positions.push(point.x, point.y, point.z)
        uvs.push(u, v)
      }
    }
  }

  for (let layer = 0; layer < layers; layer += 1) {
    const base = layer * layerLength
    for (let segment = 0; segment < segments; segment += 1) {
      for (let row = 0; row < rows; row += 1) {
        const a = base + segment * rowLength + row
        const b = a + rowLength
        if (layer === 0) indices.push(a, a + 1, b, b, a + 1, b + 1)
        else indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }

  if (closedShell) {
    for (let segment = 0; segment < segments; segment += 1) {
      for (const row of [0, rows]) {
        const a = segment * rowLength + row
        const b = a + rowLength
        const c = a + layerLength
        const d = b + layerLength
        if (row === 0) indices.push(a, b, c, b, d, c)
        else indices.push(a, c, b, b, c, d)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  // BufferGeometry does not merge duplicated UV seam normals by itself.
  const normal = geometry.getAttribute('normal')
  for (let layer = 0; layer < layers; layer += 1) {
    for (let row = 0; row <= rows; row += 1) {
      const a = layer * layerLength + row
      const b = layer * layerLength + segments * rowLength + row
      const average = new THREE.Vector3()
        .fromBufferAttribute(normal, a)
        .add(new THREE.Vector3().fromBufferAttribute(normal, b))
        .normalize()
      normal.setXYZ(a, average.x, average.y, average.z)
      normal.setXYZ(b, average.x, average.y, average.z)
    }
  }
  if (!closedShell) {
    for (let segment = 0; segment <= segments; segment += 1) {
      const a = segment * rowLength
      const b = a + rows
      const average = new THREE.Vector3()
        .fromBufferAttribute(normal, a)
        .add(new THREE.Vector3().fromBufferAttribute(normal, b))
        .normalize()
      normal.setXYZ(a, average.x, average.y, average.z)
      normal.setXYZ(b, average.x, average.y, average.z)
    }
  }
  normal.needsUpdate = true
  geometry.computeBoundingSphere()
  return geometry
}

function crumbGeometry(seed, detail) {
  const geometry = new THREE.IcosahedronGeometry(1, detail === 'high' ? 1 : 0)
  const positions = geometry.getAttribute('position')
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const z = positions.getZ(index)
    // Use position rather than vertex index so shared face corners stay joined.
    const wave = Math.sin(x * 11.2 + y * 17.3 + z * 21.1 + seed) * 0.15
    positions.setXYZ(index, x * (1 + wave), y * (0.72 + wave), z * (0.9 + wave))
  }
  geometry.computeVertexNormals()
  return geometry
}

function createToppings(shape, flavor, detail, seed) {
  const group = new THREE.Group()
  group.name = 'nut-and-cookie-toppings'
  const random = seededRandom(seed + 331)
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const spin = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const color = new THREE.Color()

  const batches = [
    { count: detail === 'high' ? 250 : 114, min: 0.009, max: 0.033, palette: flavor.crumbs },
    { count: detail === 'high' ? 76 : 34, min: 0.026, max: 0.065, palette: flavor.nuts },
  ]

  batches.forEach((batch, batchIndex) => {
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.85,
      metalness: 0,
      bumpScale: 0,
    })
    const mesh = new THREE.InstancedMesh(
      crumbGeometry(seed + batchIndex * 137, detail),
      material,
      batch.count,
    )
    mesh.name = batchIndex ? 'pistachio-and-nut-pieces' : 'fine-baked-crumbs'

    for (let index = 0; index < batch.count; index += 1) {
      const theta = random() * TAU
      // Scatter across the broad upper shoulder, leaving the rounded icing edge visible.
      const across = 0.16 + random() * 0.67
      const phi = shape.edge(theta) + (shape.edge(theta, true) - shape.edge(theta)) * across
      const point = shape.icingSurface(theta, across, 0.045)
      const size = batch.min + random() ** 1.4 * (batch.max - batch.min)
      const normal = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi),
        Math.sin(phi),
        Math.sin(theta) * Math.cos(phi),
      ).normalize()
      point.addScaledVector(normal, size * 0.36)
      quaternion.setFromUnitVectors(UP, normal)
      spin.setFromAxisAngle(UP, random() * TAU)
      quaternion.multiply(spin)
      scale.set(size * (0.6 + random() * 0.9), size * (0.55 + random() * 0.8), size)
      matrix.compose(point, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      color.set(batch.palette[Math.floor(random() * batch.palette.length)])
      color.multiplyScalar(0.86 + random() * 0.23)
      mesh.setColorAt(index, color)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.computeBoundingSphere()
    group.add(mesh)
  })

  return group
}

function createDrizzle(shape, flavor, detail, seed) {
  const group = new THREE.Group()
  group.name = 'hand-piped-drizzle'
  const ribbons = []
  const material = new THREE.MeshPhysicalMaterial({
    color: flavor.drizzle,
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.34,
    envMapIntensity: 0.48,
    specularIntensity: 0.65,
    ior: 1.4,
  })
  const random = seededRandom(seed + 523)
  const direction = 0.48 + random() * 0.13
  const cosine = Math.cos(direction)
  const sine = Math.sin(direction)
  const stripeCount = detail === 'high' ? 6 : 4

  for (let stripe = 0; stripe < stripeCount; stripe += 1) {
    const stripeZ = -0.97 + (stripe / (stripeCount - 1)) * 1.94
    const chunks = []
    let points = []
    const samples = detail === 'high' ? 105 : 63
    for (let sample = 0; sample <= samples; sample += 1) {
      const localX = -1.46 + (sample / samples) * 2.92
      const localZ = stripeZ + Math.sin(localX * 3.4 + stripe * 1.13) * 0.035
      const x = localX * cosine - localZ * sine
      const z = localX * sine + localZ * cosine
      const theta = Math.atan2(z, x)
      const radius = Math.hypot(x, z)
      const outer = shape.surface(theta, 0)
      const inner = shape.surface(theta, Math.PI)
      const outerRadius = Math.hypot(outer.x, outer.z)
      const innerRadius = Math.hypot(inner.x, inner.z)
      const q = (radius - (outerRadius + innerRadius) / 2) / ((outerRadius - innerRadius) / 2)
      if (q < -0.94 || q > 0.95) {
        if (points.length > 3) chunks.push(points)
        points = []
        continue
      }
      const phi = Math.acos(q)
      const point = shape.surface(theta, phi, 0.056)
      point.y += 0.006
      points.push(point)
    }
    if (points.length > 3) chunks.push(points)
    chunks.forEach((chunk) => {
      const curve = new THREE.CatmullRomCurve3(chunk)
      const radius = 0.012 + random() * 0.009
      const geometry = new THREE.TubeGeometry(
        curve,
        detail === 'high' ? Math.max(18, chunk.length) : Math.max(10, Math.ceil(chunk.length / 2)),
        radius,
        detail === 'high' ? 7 : 5,
        false,
      )
      ribbons.push(geometry)
    })
  }
  // A single draw call covers all piped lines, including in the six-donut box scene.
  const geometry = mergeGeometries(ribbons)
  ribbons.forEach((ribbon) => ribbon.dispose())
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'merged-chocolate-ribbons'
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return group
}

/**
 * A locally generated food model. Y is up; its golden dough rests horizontally on XZ.
 * All geometry, maps and materials are owned by this group and can be disposed by traversal.
 */
export function createDonut({ flavor = 'chocolate', detail = 'high', seed = 1 } = {}) {
  const quality = detail === 'low' ? 'low' : 'high'
  const recipe = FLAVORS[flavor] || FLAVORS.chocolate
  const shape = toroidalShape(seed)
  const segments = quality === 'high' ? 144 : 76
  const group = new THREE.Group()
  group.name = `${flavor}-artisan-donut`
  group.userData.flavor = flavor
  group.userData.detail = quality

  const doughMaterial = new THREE.MeshStandardMaterial({
    ...createDoughTextures(seed, quality),
    color: '#ffffff',
    roughness: 0.93,
    bumpScale: 0.029,
    metalness: 0,
    envMapIntensity: 0.2,
  })
  const dough = new THREE.Mesh(
    surfaceGeometry(segments, quality === 'high' ? 56 : 30, (theta, v) =>
      shape.surface(theta, v * TAU),
    ),
    doughMaterial,
  )
  dough.name = 'golden-fried-dough'
  dough.castShadow = true
  dough.receiveShadow = true
  group.add(dough)

  const icing = new THREE.Group()
  icing.name = 'glaze-layer'
  const icingMaterial = new THREE.MeshPhysicalMaterial({
    ...createIcingTextures(seed, quality, recipe.icing),
    color: '#ffffff',
    roughness: recipe.roughness,
    bumpScale: 0.009,
    metalness: 0,
    clearcoat: recipe.clearcoat,
    clearcoatRoughness: 0.36,
    envMapIntensity: 0.42,
    specularIntensity: 0.65,
    ior: 1.38,
    sheen: 0.02,
    sheenColor: recipe.icing,
  })
  const icingMesh = new THREE.Mesh(
    surfaceGeometry(
      segments,
      quality === 'high' ? 29 : 18,
      (theta, across, layer) => {
        // A round meniscus at the coating edges gives the shell visible, soft thickness.
        const edgeRound = Math.sin(Math.PI * across) ** 0.38
        const offset = layer === 0 ? 0.019 + edgeRound * 0.024 : 0.012
        return shape.icingSurface(theta, across, offset)
      },
      true,
    ),
    icingMaterial,
  )
  icingMesh.name = 'thick-irregular-glaze'
  icingMesh.castShadow = true
  icingMesh.receiveShadow = true
  icing.add(icingMesh)
  group.add(icing)

  const drizzle = createDrizzle(shape, recipe, quality, seed)
  const toppings = createToppings(shape, recipe, quality, seed)
  group.add(drizzle, toppings)

  function setExplode(amount = 0) {
    const progress = clamp(Number(amount) || 0, 0, 1)
    icing.position.y = progress * 0.76
    drizzle.position.y = progress * 1.015
    toppings.position.y = progress * 1.28
  }

  return { group, setExplode }
}

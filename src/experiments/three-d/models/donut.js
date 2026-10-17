import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import {
  createCookieTextures,
  createDoughTextures,
  createIcingTextures,
  seededRandom,
  surfaceNoise,
} from './textures.js'

const TAU = Math.PI * 2
const UP = new THREE.Vector3(0, 1, 0)
const FLAVORS = {
  chocolate: {
    icing: '#37190d',
    drizzle: '#241007',
    crumbs: ['#8e572a', '#a57138', '#bd8e52', '#694022', '#ceaa72'],
    nuts: ['#be9d62', '#d5b982', '#99703c', '#b18a51'],
    roughness: 0.39,
  },
  pistachio: {
    icing: '#798239',
    drizzle: '#c2ae72',
    crumbs: ['#647235', '#929741', '#ac9f62', '#baac7b', '#5b632f'],
    nuts: ['#879344', '#c4b17a', '#637034', '#a0a05a'],
    roughness: 0.44,
  },
  berry: {
    icing: '#872c41',
    drizzle: '#bf8d77',
    crumbs: ['#771d37', '#962346', '#b87182', '#c1a279', '#5e142a'],
    nuts: ['#ccad83', '#b26f82', '#8f2541', '#c4949e'],
    roughness: 0.4,
  },
  vanilla: {
    icing: '#c7a66c',
    drizzle: '#61331b',
    crumbs: ['#ae793d', '#7f4826', '#c19a60', '#cfad77', '#8e5a30'],
    nuts: ['#b78e52', '#d4b17f', '#a06d37', '#c5a16e'],
    roughness: 0.43,
  },
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

/** A filled, proofed brioche with a fried shoulder; there is deliberately no torus hole. */
function pastryShape(seed) {
  const phase = seededRandom(seed)() * TAU
  const random = seededRandom(seed + 103)
  const drips = Array.from({ length: 12 }, (_, index) => ({
    angle: ((index + random() * 0.7) / 12) * TAU,
    width: 0.045 + random() * 0.074,
    depth: 0.11 + random() * 0.19,
  }))

  function radiusAt(theta) {
    return (
      1.455 +
      0.021 * Math.sin(theta * 3 + phase) +
      0.013 * Math.sin(theta * 7 - phase) +
      0.006 * Math.cos(theta * 11 + phase)
    )
  }

  function surface(theta, phi, offset = 0) {
    const sine = Math.sin(phi)
    const cosine = Math.cos(phi)
    const shoulder = sine ** 3
    const radialRatio = Math.max(0, sine) ** 0.9
    const crease =
      (0.0055 * Math.sin(theta * 29 + phi * 6 + phase) +
        0.003 * Math.sin(theta * 53 - phi * 9) +
        0.008 * Math.sin(theta * 13 + phi * 4 + phase)) *
      shoulder
    const proofingSeam = -0.008 * Math.exp(-(((phi - Math.PI * 0.54) / 0.055) ** 2))
    let radius = (radiusAt(theta) + crease + proofingSeam) * radialRatio
    const height =
      cosine >= 0
        ? 0.37 * cosine ** 0.71 - 0.045 * Math.exp(-(radius * radius) / 0.24)
        : -0.346 * (-cosine) ** 0.57
    let y =
      height +
      0.009 * Math.sin(theta * 4 + phase) * radialRatio +
      (surfaceNoise(theta / TAU, phi / Math.PI, 31, 15, seed) - 0.5) * 0.008 * shoulder
    y = Math.max(y, -0.315 + Math.cos(theta * 5 + phase) * 0.003 * radialRatio)

    // Outward normal of the oblate bun, used only to offset the thin coating.
    const normal = new THREE.Vector3(
      (Math.cos(theta) * sine) / 1.455,
      cosine / 0.35,
      (Math.sin(theta) * sine) / 1.455,
    ).normalize()
    radius += offset * Math.hypot(normal.x, normal.z)
    y += offset * normal.y
    return new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta))
  }

  function edge(theta) {
    let dripDepth = 0
    for (const drip of drips) {
      const delta = theta - drip.angle
      const distance = Math.atan2(Math.sin(delta), Math.cos(delta))
      dripDepth += Math.exp(-0.5 * (distance / drip.width) ** 2) * drip.depth
    }
    return (
      Math.PI * 0.418 +
      Math.sin(theta * 9 + phase) * 0.028 +
      Math.cos(theta * 17 - phase) * 0.017 +
      dripDepth
    )
  }

  function topAt(x, z, offset = 0.042) {
    const theta = Math.atan2(z, x)
    const radialRatio = clamp(Math.hypot(x, z) / radiusAt(theta), 0, 0.998)
    const phi = Math.asin(radialRatio ** (1 / 0.9))
    return surface(theta, phi, offset)
  }

  function normalAt(x, z) {
    const delta = 0.003
    const left = topAt(x - delta, z)
    const right = topAt(x + delta, z)
    const front = topAt(x, z - delta)
    const back = topAt(x, z + delta)
    return back.sub(front).cross(right.sub(left)).normalize()
  }

  return { surface, edge, topAt, normalAt, radiusAt }
}

/** Closed latitude surface; both poles and the duplicated texture seam are smoothed explicitly. */
function pastryGeometry(segments, rows, pointAt, shell = false) {
  const positions = []
  const uvs = []
  const indices = []
  const rowLength = rows + 1
  const layerLength = (segments + 1) * rowLength
  const layers = shell ? 2 : 1
  for (let layer = 0; layer < layers; layer += 1) {
    for (let segment = 0; segment <= segments; segment += 1) {
      for (let row = 0; row <= rows; row += 1) {
        const point = pointAt((segment / segments) * TAU, row / rows, layer)
        positions.push(point.x, point.y, point.z)
        uvs.push(segment / segments, row / rows)
      }
    }
  }
  for (let layer = 0; layer < layers; layer += 1) {
    const start = layer * layerLength
    for (let segment = 0; segment < segments; segment += 1) {
      for (let row = 0; row < rows; row += 1) {
        const a = start + segment * rowLength + row
        const b = a + rowLength
        if (layer === 0) indices.push(a, b, a + 1, b, b + 1, a + 1)
        else indices.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
  }
  if (shell) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = segment * rowLength + rows
      const b = a + rowLength
      const c = a + layerLength
      const d = b + layerLength
      indices.push(a, b, c, b, d, c)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const normal = geometry.getAttribute('normal')
  const average = new THREE.Vector3()
  const neighbor = new THREE.Vector3()
  for (let layer = 0; layer < layers; layer += 1) {
    for (let row = 0; row <= rows; row += 1) {
      const a = layer * layerLength + row
      const b = a + segments * rowLength
      average.fromBufferAttribute(normal, a)
      neighbor.fromBufferAttribute(normal, b)
      average.add(neighbor).normalize()
      normal.setXYZ(a, average.x, average.y, average.z)
      normal.setXYZ(b, average.x, average.y, average.z)
    }
    for (let segment = 0; segment <= segments; segment += 1) {
      const top = layer * layerLength + segment * rowLength
      normal.setXYZ(top, 0, layer === 0 ? 1 : -1, 0)
      if (!shell) normal.setXYZ(top + rows, 0, -1, 0)
    }
  }
  normal.needsUpdate = true
  geometry.computeBoundingSphere()
  return geometry
}

function crumbGeometry(seed, detail, flake = false) {
  const geometry = new THREE.IcosahedronGeometry(1, detail === 'high' ? 1 : 0)
  const positions = geometry.getAttribute('position')
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const z = positions.getZ(index)
    const wave = Math.sin(x * 11.2 + y * 17.3 + z * 21.1 + seed) * 0.19
    positions.setXYZ(index, x * (1 + wave), y * ((flake ? 0.35 : 0.65) + wave), z * (0.86 + wave))
  }
  geometry.computeVertexNormals()
  return geometry
}

function gaussian(random) {
  return Math.sqrt(-2 * Math.log(Math.max(random(), 0.0001))) * Math.cos(random() * TAU)
}

function createToppings(shape, flavor, detail, seed) {
  const group = new THREE.Group()
  group.name = 'clustered-cookie-and-nut-crumbs'
  const random = seededRandom(seed + 331)
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const spin = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const color = new THREE.Color()
  const clusterAngle = 0.38
  const clusters = [
    [-0.92, -0.19],
    [-0.61, 0.53],
    [0.58, 0.59],
    [0.91, -0.26],
    [0.08, -0.88],
    [-0.13, 0.83],
  ]
  const batches = [
    { count: detail === 'high' ? 330 : 130, min: 0.007, max: 0.026, palette: flavor.crumbs },
    { count: detail === 'high' ? 68 : 29, min: 0.024, max: 0.067, palette: flavor.nuts },
  ]
  batches.forEach((batch, batchIndex) => {
    const mesh = new THREE.InstancedMesh(
      crumbGeometry(seed + batchIndex * 137, detail, batchIndex === 1),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.88, metalness: 0 }),
      batch.count,
    )
    mesh.name = batchIndex ? 'rough-chopped-nuts' : 'cookie-dust-clusters'
    for (let index = 0; index < batch.count; index += 1) {
      const cluster = clusters[Math.floor(random() * clusters.length)]
      let x = cluster[0] + gaussian(random) * (batchIndex ? 0.18 : 0.145)
      let z = cluster[1] + gaussian(random) * (batchIndex ? 0.15 : 0.12)
      const distance = Math.hypot(x, z)
      if (distance > 1.3) {
        x *= 1.3 / distance
        z *= 1.3 / distance
      }
      const rotatedX = x * Math.cos(clusterAngle) - z * Math.sin(clusterAngle)
      z = x * Math.sin(clusterAngle) + z * Math.cos(clusterAngle)
      x = rotatedX
      const point = shape.topAt(x, z, 0.045)
      const normal = shape.normalAt(x, z)
      const size = batch.min + random() ** 1.7 * (batch.max - batch.min)
      point.addScaledVector(normal, size * 0.28)
      quaternion.setFromUnitVectors(UP, normal)
      spin.setFromAxisAngle(UP, random() * TAU)
      quaternion.multiply(spin)
      scale.set(size * (0.65 + random() * 0.9), size * (0.55 + random() * 0.7), size)
      matrix.compose(point, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
      color.set(batch.palette[Math.floor(random() * batch.palette.length)])
      color.multiplyScalar(0.86 + random() * 0.2)
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

function pipeGeometry(points, radius, detail) {
  const curve = new THREE.CatmullRomCurve3(points)
  return new THREE.TubeGeometry(
    curve,
    detail === 'high' ? Math.max(28, points.length) : Math.max(16, Math.ceil(points.length / 2)),
    radius,
    detail === 'high' ? 8 : 5,
    false,
  )
}

function createDrizzle(shape, flavor, detail, seed) {
  const random = seededRandom(seed + 523)
  const ribbons = []
  const direction = 0.38
  const cosine = Math.cos(direction)
  const sine = Math.sin(direction)
  const count = detail === 'high' ? 7 : 5
  for (let stripe = 0; stripe < count; stripe += 1) {
    const stripeZ = -1.05 + (stripe / (count - 1)) * 2.1
    const points = []
    const samples = detail === 'high' ? 82 : 47
    for (let sample = 0; sample <= samples; sample += 1) {
      const localX = -1.46 + (sample / samples) * 2.92
      const localZ = stripeZ + Math.sin(localX * 2.2 + stripe * 0.7) * 0.055
      const x = localX * cosine - localZ * sine
      const z = localX * sine + localZ * cosine
      const angle = Math.atan2(z, x)
      if (Math.hypot(x, z) / shape.radiusAt(angle) > 0.958) continue
      points.push(shape.topAt(x, z, 0.057))
    }
    if (points.length > 4) ribbons.push(pipeGeometry(points, 0.015 + random() * 0.008, detail))
  }
  const geometry = mergeGeometries(ribbons)
  ribbons.forEach((ribbon) => ribbon.dispose())
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: flavor.drizzle,
      roughness: 0.33,
      metalness: 0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.38,
      envMapIntensity: 0.62,
      specularIntensity: 0.55,
      ior: 1.45,
    }),
  )
  mesh.name = 'thin-hand-piped-chocolate'
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Chocolate-covered biscuit: bevelled coat, a porous cut face and fine wafer layers. */
function createCookieBar(seed, detail) {
  const group = new THREE.Group()
  group.name = 'chocolate-covered-cookie-piece'
  const chocolate = new THREE.MeshPhysicalMaterial({
    color: '#32170c',
    roughness: 0.36,
    clearcoat: 0.17,
    clearcoatRoughness: 0.35,
    specularIntensity: 0.5,
    envMapIntensity: 0.64,
    ior: 1.45,
  })
  const shellGeometry = new RoundedBoxGeometry(0.89, 0.3, 0.48, 5, 0.055)
  const position = shellGeometry.getAttribute('position')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    position.setY(index, y + Math.sin(x * 25 + z * 17 + seed) * 0.0025)
  }
  shellGeometry.computeVertexNormals()
  const shell = new THREE.Mesh(shellGeometry, chocolate)
  shell.name = 'dark-chocolate-cookie-coat'
  group.add(shell)

  const crumb = new THREE.MeshStandardMaterial({
    ...createCookieTextures(seed + 117, detail),
    color: '#ffffff',
    roughness: 0.96,
    bumpScale: 0.013,
    envMapIntensity: 0.15,
  })
  const cutGeometry = new RoundedBoxGeometry(0.016, 0.22, 0.377, 4, 0.008)
  const cutPosition = cutGeometry.getAttribute('position')
  for (let index = 0; index < cutPosition.count; index += 1) {
    const x = cutPosition.getX(index)
    const y = cutPosition.getY(index)
    const z = cutPosition.getZ(index)
    cutPosition.setXYZ(
      index,
      x + Math.sin(y * 43 + z * 37 + seed) * 0.003,
      y + Math.sin(z * 31 + seed) * 0.004 * (Math.abs(y) / 0.11),
      z + Math.sin(y * 47 + seed) * 0.004 * (Math.abs(z) / 0.1885),
    )
  }
  cutGeometry.computeVertexNormals()
  const cut = new THREE.Mesh(cutGeometry, crumb)
  cut.position.set(0.445, -0.006, 0)
  cut.name = 'porous-cut-biscuit-face'
  group.add(cut)

  const waferLayers = []
  for (let index = 0; index < 4; index += 1) {
    const layer = new THREE.BoxGeometry(0.003, 0.004, 0.344, 1, 1, 24)
    const layerPosition = layer.getAttribute('position')
    for (let vertex = 0; vertex < layerPosition.count; vertex += 1) {
      const z = layerPosition.getZ(vertex)
      layerPosition.setY(
        vertex,
        layerPosition.getY(vertex) + Math.sin(z * 35 + index * 0.63 + seed) * 0.0018,
      )
    }
    layer.computeVertexNormals()
    layer.translate(0.455, -0.077 + index * 0.046, 0)
    waferLayers.push(layer)
  }
  const waferGeometry = mergeGeometries(waferLayers)
  waferLayers.forEach((layer) => layer.dispose())
  const wafer = new THREE.Mesh(
    waferGeometry,
    new THREE.MeshStandardMaterial({ color: '#8a5829', roughness: 0.88 }),
  )
  wafer.name = 'thin-biscuit-and-caramel-layers'
  group.add(wafer)

  const stripes = []
  for (const x of [-0.26, -0.015, 0.23]) {
    const points = []
    for (let index = 0; index <= 16; index += 1) {
      const z = -0.23 + (index / 16) * 0.46
      const drop = Math.max(0, Math.abs(z) - 0.16) ** 1.1 * 1.2
      points.push(new THREE.Vector3(x + z * 0.13, 0.159 - drop, z))
    }
    stripes.push(pipeGeometry(points, 0.014, detail))
  }
  const stripesGeometry = mergeGeometries(stripes)
  stripes.forEach((stripe) => stripe.dispose())
  group.add(new THREE.Mesh(stripesGeometry, chocolate))

  const caramel = new THREE.Mesh(
    new THREE.SphereGeometry(1, 28, 14),
    new THREE.MeshPhysicalMaterial({
      color: '#a76c2d',
      roughness: 0.35,
      clearcoat: 0.16,
      specularIntensity: 0.45,
      envMapIntensity: 0.45,
    }),
  )
  caramel.scale.set(0.48, 0.063, 0.32)
  caramel.position.y = -0.17
  caramel.name = 'caramel-under-cookie'
  group.add(caramel)

  group.position.set(-0.11, 0.59, -0.12)
  group.rotation.set(-0.1, -0.48, 0.11)
  group.traverse((object) => {
    if (!object.isMesh) return
    object.castShadow = true
    object.receiveShadow = true
  })
  return group
}

/** Filled artisan donut. Y up, XZ horizontal; every generated resource belongs to this group. */
export function createDonut({ flavor = 'chocolate', detail = 'high', seed = 1 } = {}) {
  const quality = detail === 'low' ? 'low' : 'high'
  const recipe = FLAVORS[flavor] || FLAVORS.chocolate
  const shape = pastryShape(seed)
  const segments = quality === 'high' ? 160 : 80
  const group = new THREE.Group()
  group.name = `${flavor}-filled-artisan-donut`
  group.userData.flavor = flavor
  group.userData.detail = quality
  group.userData.shape = 'filled-brioche'

  const dough = new THREE.Mesh(
    pastryGeometry(segments, quality === 'high' ? 64 : 32, (theta, v) =>
      shape.surface(theta, v * Math.PI),
    ),
    new THREE.MeshStandardMaterial({
      ...createDoughTextures(seed, quality),
      color: '#ffffff',
      roughness: 0.94,
      bumpScale: 0.021,
      metalness: 0,
      envMapIntensity: 0.15,
    }),
  )
  dough.name = 'golden-fried-dough'
  dough.castShadow = true
  dough.receiveShadow = true
  group.add(dough)

  const glazeLayer = new THREE.Group()
  glazeLayer.name = 'complete-glaze-and-crumb-layer'
  const icing = new THREE.Mesh(
    pastryGeometry(
      segments,
      quality === 'high' ? 42 : 24,
      (theta, across, layer) => {
        const edgeRound = Math.sin(Math.PI * across) ** 0.4
        const thickness = layer === 0 ? 0.022 + edgeRound * 0.016 : 0.008
        return shape.surface(theta, shape.edge(theta) * across, thickness)
      },
      true,
    ),
    new THREE.MeshPhysicalMaterial({
      ...createIcingTextures(seed, quality, recipe.icing),
      color: '#ffffff',
      roughness: recipe.roughness,
      bumpScale: 0.005,
      metalness: 0,
      clearcoat: 0.17,
      clearcoatRoughness: 0.37,
      envMapIntensity: 0.64,
      specularIntensity: 0.5,
      ior: 1.45,
    }),
  )
  icing.name = 'thick-irregular-glaze'
  icing.castShadow = true
  icing.receiveShadow = true
  glazeLayer.add(icing, createDrizzle(shape, recipe, quality, seed))
  glazeLayer.add(createToppings(shape, recipe, quality, seed))
  group.add(glazeLayer)

  const garnishLayer = new THREE.Group()
  garnishLayer.name = 'cookie-garnish-layer'
  if (quality === 'high') garnishLayer.add(createCookieBar(seed, quality))
  group.add(garnishLayer)

  function setExplode(amount = 0) {
    const progress = clamp(Number(amount) || 0, 0, 1)
    // Crumbs and piped chocolate stay attached to their coating, never flying as confetti.
    glazeLayer.position.y = progress * 0.53
    garnishLayer.position.y = progress * 1.01
  }

  return { group, setExplode }
}

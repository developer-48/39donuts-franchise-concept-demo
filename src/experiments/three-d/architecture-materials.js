import * as THREE from 'three'

const surfaces = new Map()
let preparation
const definitions = {
  oak: { name: 'oak_veneer_01', size: 1.4 },
  concrete: { name: 'brushed_concrete', size: 2 },
  plaster: { name: 'white_plaster_02', size: 1 },
  fabric: { name: 'fabric_leather_01', size: 0.5 },
  terrazzo: { name: 'terrazzo_tiles', size: 1.2 },
}

export function hasPhotographicSurface(kind) {
  const maps = surfaces.get(kind)
  return Boolean(maps?.diffuse && maps.roughness && maps.normal)
}

/** Local photographic maps are optional; failed maps retain the procedural surface. */
export function prepareArchitectureMaterials() {
  preparation ??= Promise.all(
    Object.entries(definitions).map(async ([kind, { name }]) => {
      const loader = new THREE.TextureLoader()
      const maps = await Promise.allSettled(
        ['diffuse', 'rough', 'normal'].map((channel) =>
          loader.loadAsync(
            `${import.meta.env.BASE_URL}assets/three-d/materials/${name}-${channel}.jpg`,
          ),
        ),
      )
      const [diffuse, roughness, normal] = maps.map((result) =>
        result.status === 'fulfilled' ? result.value : null,
      )
      if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace
      surfaces.set(kind, { diffuse, roughness, normal })
    }),
  )
  return preparation
}

function metreUvs(geometry) {
  if (geometry.userData.metreUvs || !geometry.attributes.uv) return
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i += 1) {
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)]
    const [nx, ny, nz] = [normal.getX(i), normal.getY(i), normal.getZ(i)].map(Math.abs)
    if (ny >= nx && ny >= nz) uv.setXY(i, x, z)
    else if (nx >= nz) uv.setXY(i, z, y)
    else uv.setXY(i, x, y)
  }
  uv.needsUpdate = true
  geometry.userData.metreUvs = true
}

export function applyArchitectureMaterials(group) {
  const visited = new Set()
  group.traverse((object) => {
    for (const material of [object.material].flat().filter(Boolean)) {
      const kind = material.userData.architectureSurface
      const maps = surfaces.get(kind)
      if (!maps) continue
      if (object.geometry) metreUvs(object.geometry)
      if (visited.has(material)) continue
      visited.add(material)
      const size = definitions[kind].size
      for (const [source, slot] of [
        ['diffuse', 'map'],
        ['roughness', 'roughnessMap'],
        ['normal', 'normalMap'],
      ]) {
        if (!maps[source]) continue
        const texture = maps[source].clone()
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.setScalar(1 / size)
        texture.anisotropy = 4
        texture.needsUpdate = true
        material[slot]?.dispose()
        material[slot] = texture
      }
      if (maps.normal) {
        material.bumpMap?.dispose()
        material.bumpMap = null
        material.normalScale.setScalar(kind === 'plaster' ? 0.12 : kind === 'terrazzo' ? 0.25 : 0.6)
      }
      if (maps.diffuse) {
        const color = material.userData.architectureColor
        material.color.set(kind === 'oak' && color === '#6e5742' ? '#9c795b' : '#ffffff')
        if (kind === 'plaster' || kind === 'terrazzo') {
          // Keep the approved pale finishes; photographed texture contributes fine surface variation.
          const paint = new THREE.Color(material.userData.architectureColor)
          material.onBeforeCompile = (shader) => {
            shader.uniforms.architecturePaint = { value: paint }
            shader.fragmentShader = `uniform vec3 architecturePaint;\n${shader.fragmentShader}`
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              '#include <map_fragment>\ndiffuseColor.rgb = mix(architecturePaint, diffuseColor.rgb, 0.16);',
            )
          }
          material.customProgramCacheKey = () => `architecture-paint/${kind}`
        }
      }
      material.needsUpdate = true
    }
  })
}

import * as THREE from 'three'

const surfaces = new Map()
let preparation

/** CC0 image maps are local assets, loaded only when the formats study is requested. */
export function prepareArchitectureMaterials() {
  preparation ??= Promise.all(
    ['oak_veneer_01', 'brushed_concrete'].map(async (name) => {
      const loader = new THREE.TextureLoader()
      const textures = await Promise.allSettled(
        ['diffuse', 'rough'].map((kind) =>
          loader.loadAsync(
            `${import.meta.env.BASE_URL}assets/three-d/materials/${name}-${kind}.jpg`,
          ),
        ),
      )
      const [diffuse, roughness] = textures.map((result) =>
        result.status === 'fulfilled' ? result.value : null,
      )
      if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace
      surfaces.set(name === 'oak_veneer_01' ? 'oak' : 'concrete', { diffuse, roughness })
    }),
  )
  return preparation
}

export function applyArchitectureMaterials(group) {
  const visited = new Set()
  group.traverse((object) => {
    for (const material of [object.material].flat().filter(Boolean)) {
      if (visited.has(material)) continue
      visited.add(material)
      const kind = material.userData.architectureSurface
      const maps = surfaces.get(kind)
      if (!maps) continue
      for (const [source, slot] of [
        ['diffuse', 'map'],
        ['roughness', 'roughnessMap'],
      ]) {
        if (!maps[source]) continue
        // Each scene owns its copies, so disabling one scene cannot dispose another's maps.
        const texture = maps[source].clone()
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(kind === 'oak' ? 1.5 : 2, kind === 'oak' ? 1.5 : 2)
        texture.anisotropy = 4
        texture.needsUpdate = true
        material[slot]?.dispose()
        material[slot] = texture
      }
      material.color.set('#ffffff')
      material.needsUpdate = true
    }
  })
}

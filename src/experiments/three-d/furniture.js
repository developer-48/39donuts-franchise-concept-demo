import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let chair
let preparation

export function prepareFurniture() {
  preparation ??= new GLTFLoader()
    .loadAsync(
      `${import.meta.env.BASE_URL}assets/three-d/models/dining-chair/dining_chair_02_1k.gltf`,
    )
    .then((gltf) => {
      chair = gltf.scene
    })
    .catch(() => {
      chair = null
    })
  return preparation
}

/** Detailed CC0 furniture reuses the existing seating positions and human scale. */
export function applyFurniture(group) {
  if (!chair) return
  const positions = []
  const geometryCopies = new Map()
  const materialCopies = new Map()
  const textureCopies = new Map()
  const copy = (cache, source) => {
    if (!cache.has(source)) cache.set(source, source.clone())
    return cache.get(source)
  }
  group.traverse((object) => {
    if (object.userData.assetRole === 'dining-chair' || object.name === 'chrome-cafe-chair')
      positions.push(object)
  })
  positions.forEach((position) => {
    position.traverse((object) => object.geometry?.dispose())
    position.clear()
    const model = chair.clone(true)
    const bounds = new THREE.Box3().setFromObject(model)
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = 0.9 / (bounds.max.y - bounds.min.y)
    model.scale.multiplyScalar(scale)
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    model.traverse((object) => {
      if (!object.isMesh) return
      object.geometry = copy(geometryCopies, object.geometry)
      object.material = [object.material].flat().map((source) => {
        const material = copy(materialCopies, source)
        Object.entries(source).forEach(([key, value]) => {
          if (value?.isTexture) material[key] = copy(textureCopies, value)
        })
        return material
      })
      if (object.material.length === 1) object.material = object.material[0]
      object.castShadow = object.receiveShadow = true
    })
    position.add(model)
  })
}

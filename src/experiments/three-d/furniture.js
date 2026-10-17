import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let chair
let chairPlacement
let preparation

export function prepareFurniture() {
  preparation ??= new GLTFLoader()
    .loadAsync(
      `${import.meta.env.BASE_URL}assets/three-d/models/dining-chair/dining_chair_02_1k.gltf`,
    )
    .then((gltf) => {
      chair = gltf.scene
      const bounds = new THREE.Box3().setFromObject(chair)
      const center = bounds.getCenter(new THREE.Vector3())
      const scale = 0.9 / (bounds.max.y - bounds.min.y)
      chairPlacement = {
        scale,
        position: new THREE.Vector3(-center.x * scale, -bounds.min.y * scale, -center.z * scale),
      }
    })
    .catch(() => {
      chair = null
      chairPlacement = null
    })
  return preparation
}

/** One scene shares owned clones; cached GLTF sources survive disposal and remounting. */
export function applyFurniture(group, copies = new Map()) {
  if (!chair) return
  const positions = []
  const copy = (source) => {
    if (!copies.has(source)) copies.set(source, source.clone())
    return copies.get(source)
  }
  group.traverse((object) => {
    if (object.userData.assetRole === 'dining-chair' || object.name === 'chrome-cafe-chair')
      positions.push(object)
  })
  positions.forEach((position) => {
    position.traverse((object) => object.geometry?.dispose())
    position.clear()
    const model = chair.clone(true)
    model.scale.multiplyScalar(chairPlacement.scale)
    model.position.copy(chairPlacement.position)
    model.traverse((object) => {
      if (!object.isMesh) return
      object.geometry = copy(object.geometry)
      object.material = [object.material].flat().map((source) => {
        if (copies.has(source)) return copies.get(source)
        const material = copy(source)
        Object.entries(source).forEach(([key, value]) => {
          if (value?.isTexture) material[key] = copy(value)
        })
        return material
      })
      if (object.material.length === 1) object.material = object.material[0]
      object.castShadow = object.receiveShadow = true
    })
    position.add(model)
  })
}

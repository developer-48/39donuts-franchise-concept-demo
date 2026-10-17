import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

function canBatch(object, root) {
  const geometry = object.geometry
  const material = object.material
  if (
    object === root ||
    object.children.length > 0 ||
    !object.isMesh ||
    object.isInstancedMesh ||
    object.isSkinnedMesh ||
    !geometry?.attributes.position ||
    geometry.attributes.tangent ||
    Object.values(geometry.attributes).some(
      (attribute) => attribute.isInstancedBufferAttribute || attribute.isInterleavedBufferAttribute,
    ) ||
    Object.keys(geometry.morphAttributes).length ||
    geometry.drawRange.start !== 0 ||
    geometry.drawRange.count !== Infinity ||
    !material?.isMaterial ||
    Array.isArray(material) ||
    material.transparent ||
    material.transmission > 0 ||
    material.alphaTest > 0 ||
    material.alphaHash ||
    material.displacementMap ||
    (material.normalMap && material.normalMapType === THREE.ObjectSpaceNormalMap) ||
    material.polygonOffset ||
    material.stencilWrite ||
    !material.depthTest ||
    !material.depthWrite ||
    material.blending !== THREE.NormalBlending ||
    object.customDepthMaterial ||
    object.customDistanceMaterial
  )
    return false
  for (const callback of ['onBeforeRender', 'onAfterRender', 'onBeforeShadow', 'onAfterShadow']) {
    if (object[callback] !== THREE.Object3D.prototype[callback]) return false
  }
  // The imported furniture owns shared geometry and can have tangent-space authoring details.
  // Its original instances are deliberately retained. So are independently hidden subassemblies.
  for (let node = object; node !== root; node = node.parent) {
    if (
      !node.visible ||
      node.userData.assetRole === 'dining-chair' ||
      node.name === 'chrome-cafe-chair' ||
      (node.isGroup && node.renderOrder !== 0)
    )
      return false
  }
  return true
}

function schema(geometry) {
  return Object.entries(geometry.attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, attribute]) => {
      return `${name}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}:${attribute.gpuType}`
    })
    .join('/')
}

/** Combine only immutable opaque surfaces. No triangles, UVs, materials or animation roots change. */
export function batchStaticMeshes(root, retiredGeometries) {
  root.updateWorldMatrix(true, true)
  const inverseRoot = root.matrixWorld.clone().invert()
  const buckets = new Map()
  root.traverse((object) => {
    if (!canBatch(object, root)) return
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, object.matrixWorld)
    // A negative determinant requires changing face winding; leave those objects untouched.
    if (matrix.determinant() <= 0) return
    const key = [
      object.material.uuid,
      object.castShadow,
      object.receiveShadow,
      object.layers.mask,
      object.renderOrder,
      object.frustumCulled,
      Boolean(object.geometry.index),
      schema(object.geometry),
    ].join('|')
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push({ object, matrix })
  })

  const stats = { meshesBefore: 0, meshesAfter: 0, batches: 0 }
  for (const entries of buckets.values()) {
    stats.meshesBefore += entries.length
    stats.meshesAfter += entries.length
    if (entries.length < 2) continue
    const copies = []
    let merged
    try {
      for (const { object, matrix } of entries) {
        copies.push(object.geometry.clone().applyMatrix4(matrix))
      }
      merged = mergeGeometries(copies, false)
    } finally {
      copies.forEach((geometry) => geometry.dispose())
    }
    if (!merged) continue
    merged.computeBoundingBox()
    merged.computeBoundingSphere()
    const original = entries[0].object
    const batch = new THREE.Mesh(merged, original.material)
    batch.name = `static-surfaces-${stats.batches}`
    batch.castShadow = original.castShadow
    batch.receiveShadow = original.receiveShadow
    batch.layers.mask = original.layers.mask
    batch.renderOrder = original.renderOrder
    batch.frustumCulled = original.frustumCulled
    for (const { object } of entries) {
      retiredGeometries.add(object.geometry)
      object.removeFromParent()
    }
    root.add(batch)
    stats.meshesAfter -= entries.length - 1
    stats.batches += 1
  }
  root.userData.staticBatching = stats
  return stats
}

/** A geometry shared with an untouched mesh remains owned by the scene's normal disposal path. */
export function disposeRetiredGeometries(scene, retiredGeometries) {
  scene.traverse((object) => retiredGeometries.delete(object.geometry))
  retiredGeometries.forEach((geometry) => geometry.dispose())
  retiredGeometries.clear()
}

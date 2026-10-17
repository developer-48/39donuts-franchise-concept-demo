import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {
  batchStaticMeshes,
  disposeRetiredGeometries,
} from '../src/experiments/three-d/static-meshes.js'

function mesh(material, parent) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 3), material)
  object.castShadow = object.receiveShadow = true
  parent.add(object)
  return object
}

function near(actual, expected) {
  assert.equal(actual.length, expected.length)
  for (let i = 0; i < actual.length; i += 1) {
    assert.ok(Math.abs(actual[i] - expected[i]) < 0.000002, `${i}: ${actual[i]} != ${expected[i]}`)
  }
}

test('static batching preserves all vertices, normals, UVs and triangles under nested transforms', () => {
  const scene = new THREE.Scene()
  const root = new THREE.Group()
  root.position.set(4, -2, 1)
  root.rotation.set(0.1, 0.3, 0)
  root.visible = false // Inactive formats are still prepared, without changing root visibility.
  scene.add(root)
  const material = new THREE.MeshStandardMaterial()
  const a = new THREE.Group()
  const b = new THREE.Group()
  a.position.set(1, 2, -3)
  a.scale.set(2, 1.3, 0.8)
  a.rotation.set(0.2, -0.1, 0.4)
  b.position.set(-2, 0, 3)
  b.rotation.y = 0.9
  root.add(a, b)
  const first = mesh(material, a)
  const second = mesh(material, b)
  second.scale.set(0.3, 1.1, 0.7)
  second.position.set(1, -1, 2)
  root.updateWorldMatrix(true, true)
  const inverseRoot = root.matrixWorld.clone().invert()
  const expected = { position: [], normal: [], uv: [] }
  let triangles = 0
  for (const original of [first, second]) {
    const matrix = inverseRoot.clone().multiply(original.matrixWorld)
    const normal = new THREE.Matrix3().getNormalMatrix(matrix)
    const geometry = original.geometry
    triangles += geometry.index.count / 3
    for (let i = 0; i < geometry.attributes.position.count; i += 1) {
      const vertex = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i)
      expected.position.push(...vertex.applyMatrix4(matrix).toArray())
      const direction = new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal, i)
      expected.normal.push(...direction.applyMatrix3(normal).normalize().toArray())
    }
    expected.uv.push(...geometry.attributes.uv.array)
  }
  const retired = new Set()
  assert.deepEqual(batchStaticMeshes(root, retired), {
    meshesBefore: 2,
    meshesAfter: 1,
    batches: 1,
  })
  const batch = root.children.find((object) => object.isMesh)
  assert.equal(root.visible, false)
  assert.equal(batch.material, material)
  assert.equal(batch.castShadow, true)
  assert.equal(batch.receiveShadow, true)
  assert.equal(batch.geometry.index.count / 3, triangles)
  near(batch.geometry.attributes.position.array, expected.position)
  near(batch.geometry.attributes.normal.array, expected.normal)
  assert.deepEqual([...batch.geometry.attributes.uv.array], expected.uv)
  assert.equal(first.parent, null)
  assert.equal(second.parent, null)
  assert.equal(retired.size, 2)
  assert.ok(batch.geometry.boundingSphere.radius > 0)
  // Animation still acts on the exact same model root after vertices are combined.
  root.rotation.y += 0.2
  root.updateWorldMatrix(true, true)
  const animatedVertex = new THREE.Vector3()
    .fromBufferAttribute(batch.geometry.attributes.position, 0)
    .applyMatrix4(batch.matrixWorld)
  const expectedAnimated = new THREE.Vector3(...expected.position.slice(0, 3)).applyMatrix4(
    root.matrixWorld,
  )
  near(animatedVertex.toArray(), expectedAnimated.toArray())
})

test('batching respects material identity and shadow flags while excluding nonstatic rendering', () => {
  const root = new THREE.Group()
  const material = new THREE.MeshStandardMaterial()
  const one = mesh(material, root)
  const two = mesh(material, root)
  const anotherMaterial = mesh(material.clone(), root)
  const otherShadow = mesh(material, root)
  otherShadow.receiveShadow = false
  const hidden = mesh(material, root)
  hidden.visible = false
  const mirrored = mesh(material, root)
  mirrored.scale.x = -1
  const callback = mesh(material, root)
  callback.onBeforeRender = () => {}
  const parentMesh = mesh(material, root)
  const childLogo = mesh(new THREE.MeshBasicMaterial({ transparent: true }), parentMesh)
  const glass = mesh(new THREE.MeshPhysicalMaterial({ transmission: 0.9 }), root)
  const label = mesh(new THREE.MeshBasicMaterial({ transparent: true }), root)
  const displaced = mesh(
    new THREE.MeshStandardMaterial({ displacementMap: new THREE.Texture() }),
    root,
  )
  const objectSpace = mesh(
    new THREE.MeshStandardMaterial({
      normalMap: new THREE.Texture(),
      normalMapType: THREE.ObjectSpaceNormalMap,
    }),
    root,
  )
  const chair = new THREE.Group()
  chair.userData.assetRole = 'dining-chair'
  root.add(chair)
  const importedFurniture = mesh(material, chair)
  const tangent = mesh(material, root)
  tangent.geometry.setAttribute(
    'tangent',
    new THREE.Float32BufferAttribute(new Float32Array(24 * 4), 4),
  )
  const customAttribute = mesh(material, root)
  customAttribute.geometry.setAttribute('uv1', customAttribute.geometry.attributes.uv.clone())
  const instanced = new THREE.InstancedMesh(new THREE.BoxGeometry(), material, 2)
  root.add(instanced)
  const retired = new Set()
  const stats = batchStaticMeshes(root, retired)
  assert.equal(stats.batches, 1)
  assert.equal(one.parent, null)
  assert.equal(two.parent, null)
  for (const original of [
    anotherMaterial,
    otherShadow,
    hidden,
    mirrored,
    callback,
    parentMesh,
    glass,
    label,
    displaced,
    objectSpace,
    tangent,
    customAttribute,
    instanced,
  ])
    assert.equal(original.parent, root)
  assert.equal(importedFurniture.parent, chair)
  assert.equal(childLogo.parent, parentMesh)
})

test('a mesh used as the animation root is never detached or replaced', () => {
  const material = new THREE.MeshStandardMaterial()
  const root = new THREE.Mesh(new THREE.BoxGeometry(), material)
  const scene = new THREE.Scene()
  scene.add(root)
  root.add(new THREE.Mesh(new THREE.BoxGeometry(), material))
  batchStaticMeshes(root, new Set())
  assert.equal(root.parent, scene)
  assert.equal(root.geometry.attributes.position.count, 24)
})

test('retired geometry is released once only when no remaining scene object references it', () => {
  const scene = new THREE.Scene()
  const root = new THREE.Group()
  scene.add(root)
  const material = new THREE.MeshStandardMaterial()
  const shared = new THREE.BoxGeometry()
  let sharedDisposals = 0
  shared.addEventListener('dispose', () => (sharedDisposals += 1))
  const retained = new THREE.Mesh(shared, material)
  scene.add(retained)
  root.add(new THREE.Mesh(shared, material), new THREE.Mesh(shared, material))
  const retired = new Set()
  batchStaticMeshes(root, retired)
  const unused = new THREE.BoxGeometry()
  let unusedDisposals = 0
  unused.addEventListener('dispose', () => (unusedDisposals += 1))
  retired.add(unused)
  disposeRetiredGeometries(scene, retired)
  assert.equal(sharedDisposals, 0)
  assert.equal(unusedDisposals, 1)
  assert.equal(retired.size, 0)
  assert.equal(retained.geometry, shared)
})

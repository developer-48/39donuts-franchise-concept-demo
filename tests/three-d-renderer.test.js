import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { ArchitecturalAO } from '../src/experiments/three-d/architecture-renderer.js'

function fixture() {
  const scene = new THREE.Scene()
  const active = new THREE.Group()
  const inactive = new THREE.Group()
  inactive.visible = false
  scene.add(active, inactive)
  const glass = new THREE.Mesh(undefined, new THREE.MeshPhysicalMaterial({ transparent: true }))
  const transmission = new THREE.Mesh(
    undefined,
    new THREE.MeshPhysicalMaterial({ transmission: 0.8 }),
  )
  const hiddenGlass = glass.clone()
  hiddenGlass.visible = false
  const inactiveGlass = glass.clone()
  const line = new THREE.Line()
  active.add(glass, transmission, hiddenGlass, line)
  inactive.add(inactiveGlass)
  const ao = new ArchitecturalAO(scene, new THREE.PerspectiveCamera())
  ao.refreshObjects()
  const renderer = { shadowMap: { autoUpdate: true, needsUpdate: true } }
  return { scene, ao, renderer, glass, transmission, hiddenGlass, inactiveGlass, line }
}

function withNormalPass(render, callback) {
  const original = GTAOPass.prototype.render
  GTAOPass.prototype.render = render
  try {
    callback()
  } finally {
    GTAOPass.prototype.render = original
  }
}

test('AO retains the colour pass shadow map and excludes only currently visible glazing', () => {
  const { scene, ao, renderer, glass, transmission, hiddenGlass, inactiveGlass, line } = fixture()
  // After model registration, normal passes must not rediscover static material membership.
  scene.traverse = scene.traverseVisible = () => assert.fail('Repeated whole-scene discovery')
  withNormalPass(
    function (receivedRenderer) {
      assert.equal(receivedRenderer, renderer)
      assert.deepEqual(renderer.shadowMap, { autoUpdate: false, needsUpdate: false })
      assert.equal(glass.visible, false)
      assert.equal(transmission.visible, false)
      assert.equal(hiddenGlass.visible, false)
      assert.equal(inactiveGlass.visible, true)
      this._overrideVisibility()
      assert.equal(line.visible, false)
      this._restoreVisibility()
    },
    () => ao.render(renderer),
  )
  assert.deepEqual(renderer.shadowMap, { autoUpdate: true, needsUpdate: true })
  assert.equal(glass.visible, true)
  assert.equal(transmission.visible, true)
  assert.equal(hiddenGlass.visible, false)
  assert.equal(inactiveGlass.visible, true)
  assert.equal(line.visible, true)
  ao.dispose()
})

test('a failed normal pass restores visibility and shadow update state', () => {
  const { ao, renderer, glass, transmission, hiddenGlass, line } = fixture()
  renderer.shadowMap = { autoUpdate: false, needsUpdate: false }
  withNormalPass(
    function () {
      this._overrideVisibility()
      throw new Error('GPU pass failed')
    },
    () => assert.throws(() => ao.render(renderer), /GPU pass failed/),
  )
  assert.deepEqual(renderer.shadowMap, { autoUpdate: false, needsUpdate: false })
  assert.equal(glass.visible, true)
  assert.equal(transmission.visible, true)
  assert.equal(hiddenGlass.visible, false)
  assert.equal(line.visible, true)
  assert.equal(ao._visibilityCache.length, 0)
  assert.equal(ao.hiddenGlazing.length, 0)
  ao.dispose()
})

test('AO disposal releases every pass material, including GTAO and blending shaders', () => {
  const { ao } = fixture()
  const materials = [
    'gtaoMaterial',
    'blendMaterial',
    'normalMaterial',
    'pdMaterial',
    'copyMaterial',
    'depthRenderMaterial',
  ]
  const disposed = new Map(materials.map((name) => [name, 0]))
  for (const name of materials) {
    ao[name].addEventListener('dispose', () => disposed.set(name, disposed.get(name) + 1))
  }
  ao.dispose()
  for (const name of materials) assert.equal(disposed.get(name), 1, `${name} must be released`)
})

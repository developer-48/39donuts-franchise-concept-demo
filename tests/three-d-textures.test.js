import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { prepareTextureUploads } from '../src/experiments/three-d/stage.js'

test('preparation uploads each owned texture once and yields before continuing', async () => {
  const scene = new THREE.Scene()
  const map = new THREE.Texture()
  const normalMap = new THREE.Texture()
  const material = new THREE.MeshStandardMaterial({ map, roughnessMap: map, normalMap })
  scene.add(new THREE.Mesh(undefined, material), new THREE.Mesh(undefined, [material, material]))
  const uploaded = []
  let yielded = false
  setTimeout(() => (yielded = true), 0)
  await prepareTextureUploads(scene, {
    initTexture(texture) {
      if (uploaded.length) assert.equal(yielded, true)
      uploaded.push(texture)
    },
  })
  assert.deepEqual(uploaded, [map, normalMap])
})

test('preparation stops uploading after cancellation and reports scene cancellation', async () => {
  const scene = new THREE.Scene()
  const controller = new AbortController()
  scene.add(
    new THREE.Mesh(
      undefined,
      new THREE.MeshStandardMaterial({ map: new THREE.Texture(), normalMap: new THREE.Texture() }),
    ),
  )
  let uploads = 0
  await assert.rejects(
    prepareTextureUploads(
      scene,
      {
        initTexture() {
          uploads += 1
          controller.abort()
        },
      },
      controller.signal,
    ),
    /Scene preparation cancelled/,
  )
  assert.equal(uploads, 1)
  await assert.rejects(
    prepareTextureUploads(
      scene,
      { initTexture: () => assert.fail('Destroyed scene upload') },
      null,
      () => true,
    ),
    /Scene preparation cancelled/,
  )
})

test('render targets and pending or failed brand images retain their existing loading path', async () => {
  const OriginalImage = globalThis.HTMLImageElement
  class Image {
    complete = false
    naturalWidth = 0
  }
  globalThis.HTMLImageElement = Image
  try {
    const scene = new THREE.Scene()
    const pending = new THREE.Texture(new Image())
    const failedImage = new Image()
    failedImage.complete = true
    const failed = new THREE.Texture(failedImage)
    const target = new THREE.WebGLRenderTarget(2, 2)
    scene.add(
      new THREE.Mesh(
        undefined,
        new THREE.MeshStandardMaterial({ map: pending, normalMap: failed }),
      ),
      new THREE.Mesh(undefined, new THREE.MeshBasicMaterial({ map: target.texture })),
    )
    await prepareTextureUploads(scene, { initTexture: () => assert.fail('Texture not uploadable') })
    target.dispose()
  } finally {
    if (OriginalImage === undefined) delete globalThis.HTMLImageElement
    else globalThis.HTMLImageElement = OriginalImage
  }
})

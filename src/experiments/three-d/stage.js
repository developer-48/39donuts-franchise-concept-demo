import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/** Each visible block owns a renderer. No permanent render loop is used. */
export function createStage(host, options) {
  const rollback = []
  try {
    return configureStage(host, options, rollback)
  } catch (error) {
    for (const release of rollback.reverse()) {
      try {
        release()
      } catch {
        /* Continue releasing the remaining GPU resources. */
      }
    }
    throw error
  }
}

function disposeScene(scene) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    if (object.material) {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material)
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value)
        })
      }
    }
    object.shadow?.dispose()
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
}

function configureStage(
  host,
  { width, minHeight = 0, target, direction, ground, onError },
  rollback,
) {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  rollback.push(() => {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.6))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.append(renderer.domElement)

  const scene = new THREE.Scene()
  rollback.push(() => disposeScene(scene))
  const focus = new THREE.Vector3(...target)
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    width / 2,
    -width / 2,
    0.1,
    100,
  )
  camera.position.copy(focus).add(new THREE.Vector3(...direction))
  camera.lookAt(focus)

  const environment = new RoomEnvironment()
  rollback.push(() => environment.dispose())
  const generator = new THREE.PMREMGenerator(renderer)
  rollback.push(() => generator.dispose())
  const environmentTarget = generator.fromScene(environment, 0.035)
  rollback.push(() => environmentTarget.dispose())
  scene.environment = environmentTarget.texture
  scene.environmentIntensity = 0.65
  environment.dispose()
  generator.dispose()

  scene.add(new THREE.HemisphereLight('#fff5e5', '#846652', 1.45))
  const key = new THREE.DirectionalLight('#fff5e8', 3.0)
  key.position.set(-4.5, 8, 6)
  key.castShadow = true
  key.shadow.mapSize.setScalar(coarse ? 512 : 1024)
  key.shadow.camera.left = -7
  key.shadow.camera.right = 7
  key.shadow.camera.top = 8
  key.shadow.camera.bottom = -7
  key.shadow.camera.updateProjectionMatrix()
  key.shadow.normalBias = 0.035
  key.shadow.bias = -0.00015
  key.shadow.radius = 3
  scene.add(key)
  const fill = new THREE.DirectionalLight('#e5deff', 0.85)
  fill.position.set(5, 2, -4)
  scene.add(fill)
  const rim = new THREE.DirectionalLight('#fff7ea', 1.8)
  rim.position.set(2, 5, -6)
  scene.add(rim)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.ShadowMaterial({ opacity: 0.16 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = ground
  floor.receiveShadow = true
  scene.add(floor)

  let visible = false
  let destroyed = false
  let frame = 0
  let drawCount = 0

  function draw() {
    if (destroyed) return
    renderer.render(scene, camera)
    drawCount += 1
    host.dataset.renders = String(drawCount)
    host.dataset.drawCalls = String(renderer.info.render.calls)
    host.dataset.triangles = String(renderer.info.render.triangles)
  }

  function invalidate() {
    if (destroyed || !visible || document.hidden || frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      try {
        draw()
      } catch (error) {
        onError(error)
      }
    })
  }

  function resize() {
    const bounds = host.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return
    renderer.setSize(bounds.width, bounds.height, false)
    const aspect = bounds.width / bounds.height
    const height = Math.max(width / aspect, minHeight)
    camera.left = -(height * aspect) / 2
    camera.right = (height * aspect) / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.updateProjectionMatrix()
    invalidate()
  }

  const observer = new ResizeObserver(resize)
  rollback.push(() => observer.disconnect())
  observer.observe(host)
  resize()
  const lost = (event) => {
    event.preventDefault()
    if (!destroyed) onError(new Error('WebGL context lost'))
  }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  rollback.push(() => renderer.domElement.removeEventListener('webglcontextlost', lost))

  return {
    scene,
    camera,
    renderer,
    invalidate,
    draw,
    setVisible(value) {
      visible = value
      if (value) invalidate()
      else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      disposeScene(scene)
      environmentTarget.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

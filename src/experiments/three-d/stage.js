import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { getStudio } from './studio.js'

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
  {
    width,
    minHeight = 0,
    target,
    direction,
    ground,
    perspective = false,
    footerHeight = 0,
    onError,
  },
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
  renderer.toneMappingExposure = 0.94
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  if (footerHeight) renderer.domElement.style.height = `calc(100% - ${footerHeight}px)`
  host.append(renderer.domElement)

  const scene = new THREE.Scene()
  rollback.push(() => disposeScene(scene))
  const focus = new THREE.Vector3(...target)
  const camera = perspective
    ? new THREE.PerspectiveCamera(32, 1, 0.1, 150)
    : new THREE.OrthographicCamera(-width / 2, width / 2, width / 2, -width / 2, 0.1, 100)
  const framing = { width, minHeight, target: [...target], direction: [...direction] }

  const generator = new THREE.PMREMGenerator(renderer)
  rollback.push(() => generator.dispose())
  const studio = getStudio()
  let environmentTarget
  if (studio) {
    environmentTarget = generator.fromEquirectangular(studio)
  } else {
    const environment = new RoomEnvironment()
    rollback.push(() => environment.dispose())
    environmentTarget = generator.fromScene(environment, 0.05)
    environment.dispose()
  }
  rollback.push(() => environmentTarget.dispose())
  scene.environment = environmentTarget.texture
  scene.environmentIntensity = 0.85
  scene.environmentRotation.y = 0.45
  generator.dispose()

  scene.add(new THREE.HemisphereLight('#fff9ed', '#554539', 0.35))
  const key = new THREE.DirectionalLight('#fff2df', 1.3)
  key.position.set(-4.5, 8, 6)
  key.castShadow = true
  key.shadow.mapSize.setScalar(coarse ? 1024 : 2048)
  key.shadow.camera.left = -7
  key.shadow.camera.right = 7
  key.shadow.camera.top = 8
  key.shadow.camera.bottom = -7
  key.shadow.camera.updateProjectionMatrix()
  key.shadow.normalBias = 0.035
  key.shadow.bias = -0.00015
  key.shadow.radius = 5
  key.shadow.blurSamples = 8
  scene.add(key)
  const fill = new THREE.DirectionalLight('#eef0f6', 0.18)
  fill.position.set(5, 2, -4)
  scene.add(fill)
  const rim = new THREE.DirectionalLight('#fff7ea', 0.45)
  rim.position.set(2, 5, -6)
  scene.add(rim)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.ShadowMaterial({ opacity: 0.09 }),
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
    const canvasHeight = Math.max(1, bounds.height - footerHeight)
    renderer.setSize(bounds.width, canvasHeight, false)
    const aspect = bounds.width / canvasHeight
    const height = Math.max(framing.width / aspect, framing.minHeight)
    focus.set(...framing.target)
    const axis = new THREE.Vector3(...framing.direction)
    if (perspective) {
      camera.aspect = aspect
      const distance = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))
      camera.position.copy(focus).add(axis.normalize().multiplyScalar(distance))
    } else {
      camera.left = -(height * aspect) / 2
      camera.right = (height * aspect) / 2
      camera.top = height / 2
      camera.bottom = -height / 2
      camera.position.copy(focus).add(axis)
    }
    camera.lookAt(focus)
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
    setView(next) {
      Object.assign(framing, next)
      resize()
    },
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

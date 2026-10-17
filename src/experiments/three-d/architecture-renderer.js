import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'
import * as THREE from 'three'

/** Contact shading grounds furniture and reveals wall thickness without a permanent render loop. */
export class ArchitecturalAO extends GTAOPass {
  glazing = []
  pointsAndLines = []
  hiddenGlazing = []

  refreshObjects() {
    this.glazing = []
    this.pointsAndLines = []
    this.scene.traverse((object) => {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      if (materials.some((material) => material?.transparent || material?.transmission > 0)) {
        this.glazing.push(object)
      }
      if (object.isPoints || object.isLine || object.isLine2) this.pointsAndLines.push(object)
    })
    this.hiddenGlazing = []
  }

  _overrideVisibility() {
    // Model membership and materials are static after construction; only their visibility changes.
    for (const object of this.pointsAndLines) {
      if (object.visible) {
        object.visible = false
        this._visibilityCache.push(object)
      }
    }
  }

  render(renderer, ...args) {
    for (const object of this.glazing) {
      let ancestor = object
      while (ancestor?.visible) ancestor = ancestor.parent
      if (ancestor) continue
      this.hiddenGlazing.push(object)
      object.visible = false
    }
    // Colour has already been drawn by RenderPass. Glass must not become an opaque AO wall.
    // Its VSM map is also complete. The normal/depth pass never samples shadows and must not
    // repeat the shadow geometry and blur passes with temporarily hidden glazing.
    const { autoUpdate, needsUpdate } = renderer.shadowMap
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = false
    try {
      super.render(renderer, ...args)
    } finally {
      renderer.shadowMap.autoUpdate = autoUpdate
      renderer.shadowMap.needsUpdate = needsUpdate
      for (const object of this.hiddenGlazing) object.visible = true
      this.hiddenGlazing.length = 0
      this._restoreVisibility()
    }
  }

  dispose() {
    super.dispose()
    // Three.js r186's GTAOPass.dispose does not release these two owned materials.
    this.gtaoMaterial.dispose()
    this.blendMaterial.dispose()
  }
}

export function createArchitectureRenderer(renderer, scene, camera, coarse) {
  const owned = []
  try {
    const composer = new EffectComposer(renderer)
    owned.push(composer)
    composer.renderTarget1.samples = coarse ? 2 : 4
    composer.renderTarget2.samples = coarse ? 2 : 4
    const diffuse = new RenderPass(scene, camera)
    owned.push(diffuse)
    const ao = new ArchitecturalAO(scene, camera)
    owned.push(ao)
    ao.blendIntensity = 0.7
    ao.updateGtaoMaterial({
      radius: 0.55,
      thickness: 0.7,
      samples: coarse ? 8 : 16,
      distanceFallOff: 1,
    })
    ao.updatePdMaterial({ radius: 6, samples: 8 })
    const output = new OutputPass()
    owned.push(output)
    const antialias = new ShaderPass(FXAAShader)
    owned.push(antialias)
    composer.addPass(diffuse)
    composer.addPass(ao)
    composer.addPass(output)
    composer.addPass(antialias)
    let destroyed = false
    return {
      render: () => composer.render(),
      async prepare(signal) {
        const geometry = new THREE.PlaneGeometry(2, 2)
        const previousTarget = renderer.getRenderTarget()
        const shaders = [
          ao.gtaoMaterial,
          ao.pdMaterial,
          ao.copyMaterial,
          ao.blendMaterial,
          output.material,
          antialias.material,
        ]
        try {
          const check = () => {
            if (destroyed || signal?.aborted) throw new Error('Architecture preparation cancelled')
          }
          check()
          ao.refreshObjects()
          // Match RenderPass's linear offscreen target, otherwise compileAsync warms the wrong variant.
          renderer.setRenderTarget(composer.readBuffer)
          await renderer.compileAsync(scene, camera)
          check()
          const normalScene = new THREE.Scene()
          scene.traverse((object) => {
            if (!object.isMesh) return
            const mesh = object.clone(false)
            mesh.material = ao.normalMaterial
            normalScene.add(mesh)
          })
          await renderer.compileAsync(normalScene, camera, scene)
          check()
          output.material.defines = { SRGB_TRANSFER: '', ACES_FILMIC_TONE_MAPPING: '' }
          for (const material of shaders) {
            check()
            renderer.setRenderTarget(material === antialias.material ? null : composer.readBuffer)
            const scene = new THREE.Scene()
            scene.add(new THREE.Mesh(geometry, material))
            await renderer.compileAsync(scene, camera)
            await new Promise((resolve) => setTimeout(resolve, 0))
          }
        } finally {
          geometry.dispose()
          if (!destroyed) renderer.setRenderTarget(previousTarget)
        }
      },
      setSize(width, height) {
        composer.setSize(width, height)
        const ratio = renderer.getPixelRatio()
        antialias.uniforms.resolution.value.set(1 / (width * ratio), 1 / (height * ratio))
      },
      destroy() {
        if (destroyed) return
        destroyed = true
        owned.reverse().forEach((resource) => resource.dispose())
      },
    }
  } catch (error) {
    owned.reverse().forEach((resource) => resource.dispose())
    throw error
  }
}

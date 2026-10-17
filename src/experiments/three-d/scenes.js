import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStage } from './stage.js'
import { createDonut } from './models/donut.js'
import { createCafe } from './models/cafe.js'
import { createDonutBox } from './models/box.js'
import { prepareStudio } from './studio.js'
import { prepareFurniture, applyFurniture } from './furniture.js'
import {
  prepareArchitectureMaterials,
  applyArchitectureMaterials,
} from './architecture-materials.js'

gsap.registerPlugin(ScrollTrigger)

export async function prepareSceneAssets(id) {
  await Promise.all([
    prepareStudio(id === 'formats' ? 'architecture' : 'product'),
    id === 'formats' && prepareArchitectureMaterials(),
    id === 'formats' && prepareFurniture(),
  ])
}

const settings = {
  hero: {
    width: 4.5,
    minHeight: 3.2,
    target: [0, 0.2, 0],
    direction: [4, 3.1, 5],
    ground: -0.33,
    perspective: true,
  },
  product: {
    width: 4.9,
    minHeight: 4.2,
    target: [0, 0.65, 0],
    direction: [4, 3.4, 6],
    ground: -0.33,
    perspective: true,
  },
  formats: {
    width: 14.3,
    minHeight: 9.4,
    target: [0, 1.2, 0],
    direction: [11, 13, 17],
    ground: -0.02,
    perspective: true,
    footerHeight: 70,
    architecture: true,
  },
  box: {
    width: 11.6,
    minHeight: 8.8,
    target: [0, 2.15, -0.6],
    direction: [4, 7, 11],
    ground: 0.01,
    perspective: true,
  },
}
const formatNames = ['cafe-workshop', 'cafe-separate', 'island']
const formatViews = [
  { width: 13.4, minHeight: 9.1, target: [0, 1.45, 0], direction: [10, 9.5, 17] },
  { width: 9.6, minHeight: 6.6, target: [0, 1.35, 0], direction: [9, 7.8, 15] },
  { width: 9.2, minHeight: 6.8, target: [0, 1.65, 0], direction: [8, 4.7, 15] },
]

export async function createScene(
  id,
  host,
  { reducedMotion = false, paused = false, onError, signal },
) {
  const stage = createStage(host, { ...settings[id], onError })
  let instance
  const abort = () => (instance ? instance.destroy() : stage.destroy())
  signal?.addEventListener('abort', abort, { once: true })
  try {
    if (signal?.aborted) throw new Error('Scene removed before construction')
    instance = await configureScene(id, host, { reducedMotion, paused, signal }, stage)
    await stage.prepare(signal)
    if (signal?.aborted || !host.isConnected) throw new Error('Scene removed during preparation')
    stage.draw()
    return instance
  } catch (error) {
    if (instance) instance.destroy()
    else stage.destroy()
    throw error
  } finally {
    signal?.removeEventListener('abort', abort)
  }
}

async function configureScene(id, host, { reducedMotion, paused, signal }, stage) {
  const rig = new THREE.Group()
  const hover = new THREE.Group()
  rig.add(hover)
  stage.scene.add(rig)
  const events = new AbortController()
  let visible = false
  let started = false
  let timeline
  let pointerTween
  let scrollTween
  let scrollTrigger
  let destroyed = false
  let currentFormat = Number(
    document.querySelector('[data-format-index][aria-selected="true"]')?.dataset.formatIndex ?? 0,
  )
  const models = new Map()
  const descriptions = new Map()
  let caption
  const state = { open: 0, spread: 0, progress: 0 }
  let donut
  let box

  if (id === 'hero' || id === 'product') {
    donut = createDonut({ flavor: 'chocolate', detail: 'high', seed: id === 'hero' ? 12 : 39 })
    hover.add(donut.group)
    rig.rotation.z = id === 'hero' ? -0.09 : -0.04
    rig.rotation.y = id === 'hero' ? -0.12 : 0.04
  } else if (id === 'formats') {
    caption = document.createElement('div')
    caption.className = 'three-d-format-caption'
    host.append(caption)
    for (const [index, kind] of formatNames.entries()) {
      const { group, meta } = createCafe(kind)
      applyArchitectureMaterials(group)
      applyFurniture(group)
      descriptions.set(index, meta)
      group.visible = index === currentFormat
      models.set(index, group)
      hover.add(group)
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (signal?.aborted || !host.isConnected) throw new Error('Scene removed during construction')
    }
    rig.rotation.y = 0
    settleFormat(currentFormat)
  } else {
    box = createDonutBox()
    hover.add(box.group)
    box.setOpen(1)
  }

  const animate = !reducedMotion
  const render = () => stage.invalidate()
  const applyProduct = () => {
    donut.setExplode(state.spread)
    rig.rotation.y = -0.25 + state.progress * 0.55
    render()
  }

  function settleFormat(index) {
    for (const [key, model] of models) {
      model.visible = key === index
      model.position.y = 0
      model.scale.setScalar(1)
    }
    stage.renderer.domElement.style.opacity = '1'
    stage.setView(formatViews[index])
    const description = descriptions.get(index)
    if (caption && description) {
      const title = document.createElement('strong')
      title.textContent = description.label
      const detail = document.createElement('span')
      detail.textContent = description.detail
      caption.replaceChildren(title, detail)
    }
  }

  function resume() {
    timeline?.resume()
    pointerTween?.resume()
    scrollTween?.resume()
    render()
  }

  function makeEntrance() {
    timeline?.kill()
    if (id === 'formats') settleFormat(currentFormat)
    if (!animate || paused || !visible || destroyed) return
    started = true
    timeline = gsap.timeline({ onUpdate: render })
    if (id === 'hero') {
      timeline.fromTo(
        rig.rotation,
        { y: -0.4, z: -0.12 },
        { y: -0.12, z: -0.09, duration: 2.4, ease: 'power2.out' },
        0,
      )
    } else if (id === 'product') {
      timeline
        .to(state, { spread: 0.7, duration: 1.4, ease: 'power2.inOut', onUpdate: applyProduct })
        .to(
          state,
          { spread: 0, duration: 1.4, ease: 'power2.inOut', onUpdate: applyProduct },
          '+=0.4',
        )
    } else if (id === 'formats') {
      timeline.fromTo(rig.rotation, { y: -0.14 }, { y: 0, duration: 1.7, ease: 'power2.out' }, 0)
    } else {
      state.open = 0
      box.setOpen(0)
      timeline.to(
        state,
        { open: 1, duration: 2.8, ease: 'power2.inOut', onUpdate: () => box.setOpen(state.open) },
        0.2,
      )
    }
  }

  if (id === 'product' && animate) {
    scrollTrigger = ScrollTrigger.create({
      trigger: host.parentElement,
      start: 'top 86%',
      end: 'bottom 12%',
      onUpdate: (trigger) => {
        if (!visible || paused || timeline?.isActive()) return
        scrollTween?.kill()
        scrollTween = gsap.to(state, {
          progress: trigger.progress,
          spread: Math.sin(trigger.progress * Math.PI) * 0.68,
          duration: 0.55,
          ease: 'power2.out',
          onUpdate: applyProduct,
        })
      },
    })
  }

  host.addEventListener(
    'pointermove',
    (event) => {
      if (!animate || paused || !visible || event.pointerType === 'touch') return
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      pointerTween?.kill()
      pointerTween = gsap.to(hover.rotation, {
        x: y * 0.045,
        y: x * 0.1,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: render,
      })
    },
    { signal: events.signal },
  )
  host.addEventListener(
    'pointerleave',
    () => {
      pointerTween?.kill()
      if (!animate || paused) return
      pointerTween = gsap.to(hover.rotation, {
        x: 0,
        y: 0,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: render,
      })
    },
    { signal: events.signal },
  )

  // SVG brand textures load locally after model construction. Render their completion once.
  const ready = () => {
    if (!destroyed) stage.invalidate()
  }
  const pendingImages = []
  stage.scene.traverse((object) => {
    const material = object.material
    if (material?.map?.image instanceof HTMLImageElement && !material.map.image.complete) {
      const image = material.map.image
      if (!pendingImages.includes(image)) {
        pendingImages.push(image)
        image.addEventListener('load', ready, { once: true, signal: events.signal })
      }
    }
  })
  const instance = {
    setVisible(value) {
      visible = value
      stage.setVisible(value)
      if (!value) {
        timeline?.pause()
        pointerTween?.pause()
        scrollTween?.pause()
      } else if (!started) {
        makeEntrance()
      } else if (!paused) {
        resume()
      }
    },
    setPaused(value) {
      if (paused === value) return
      paused = value
      if (value) {
        timeline?.pause()
        pointerTween?.pause()
        scrollTween?.pause()
      } else if (visible) {
        if (!started) makeEntrance()
        else resume()
      }
    },
    replay: makeEntrance,
    setFormat(index) {
      if (id !== 'formats' || currentFormat === index || !models.has(index)) return
      timeline?.kill()
      currentFormat = index
      if (!animate || paused || !visible) {
        settleFormat(index)
        render()
        return
      }
      timeline = gsap.timeline({ onUpdate: render })
      timeline
        .to(stage.renderer.domElement, { opacity: 0, duration: 0.22, ease: 'power1.in' })
        .call(() => {
          settleFormat(index)
          stage.renderer.domElement.style.opacity = '0'
          rig.rotation.y = -0.1
        })
        .to(stage.renderer.domElement, { opacity: 1, duration: 0.65, ease: 'power1.out' })
        .to(rig.rotation, { y: 0, duration: 0.85, ease: 'power2.out' }, '<')
    },
    destroy() {
      destroyed = true
      events.abort()
      timeline?.kill()
      pointerTween?.kill()
      scrollTween?.kill()
      scrollTrigger?.kill()
      caption?.remove()
      stage.destroy()
    },
  }
  return instance
}

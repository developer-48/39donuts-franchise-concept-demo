import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStage } from './stage.js'
import { createDonut } from './models/donut.js'
import { createCafe } from './models/cafe.js'
import { createDonutBox } from './models/box.js'

gsap.registerPlugin(ScrollTrigger)

const settings = {
  hero: { width: 4.55, target: [0, 0.1, 0], direction: [0.6, 4.2, 6.5], ground: -0.33 },
  product: { width: 4.5, target: [0, 0.48, 0], direction: [0.3, 3.8, 7], ground: -0.33 },
  formats: { width: 10.7, target: [0, 1.5, 0], direction: [8, 7.5, 10], ground: -0.02 },
  box: { width: 11.6, minHeight: 7.2, target: [0, 2, -0.6], direction: [4, 7, 11], ground: 0.01 },
}
const formatNames = ['cafe-workshop', 'cafe-separate', 'island']

export function createScene(id, host, { reducedMotion = false, paused = false, onError }) {
  const stage = createStage(host, { ...settings[id], onError })
  try {
    return configureScene(id, host, { reducedMotion, paused }, stage)
  } catch (error) {
    stage.destroy()
    throw error
  }
}

function configureScene(id, host, { reducedMotion, paused }, stage) {
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
  const state = { open: 0, spread: 0, progress: 0 }
  let donut
  let box

  if (id === 'hero' || id === 'product') {
    donut = createDonut({ flavor: 'chocolate', detail: 'high', seed: id === 'hero' ? 12 : 39 })
    hover.add(donut.group)
    rig.rotation.z = id === 'hero' ? -0.22 : -0.12
    rig.rotation.y = id === 'hero' ? -0.22 : 0.1
  } else if (id === 'formats') {
    formatNames.forEach((kind, index) => {
      const { group } = createCafe(kind)
      group.visible = index === currentFormat
      models.set(index, group)
      hover.add(group)
    })
    rig.rotation.y = -0.08
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
      timeline.fromTo(rig.position, { y: -0.25 }, { y: 0, duration: 1.7, ease: 'power3.out' }, 0)
      timeline.fromTo(
        rig.rotation,
        { y: -1.0, z: -0.32 },
        { y: -0.22, z: -0.22, duration: 2.1, ease: 'power3.out' },
        0,
      )
    } else if (id === 'product') {
      timeline
        .to(state, { spread: 0.88, duration: 1.0, ease: 'power2.inOut', onUpdate: applyProduct })
        .to(
          state,
          { spread: 0, duration: 1.0, ease: 'power2.inOut', onUpdate: applyProduct },
          '+=0.4',
        )
    } else if (id === 'formats') {
      const model = models.get(currentFormat)
      timeline.fromTo(model.position, { y: -0.45 }, { y: 0, duration: 1.2, ease: 'power3.out' }, 0)
      timeline.fromTo(
        rig.rotation,
        { y: -0.45 },
        { y: -0.08, duration: 1.5, ease: 'power3.out' },
        0,
      )
    } else {
      state.open = 0
      box.setOpen(0)
      timeline.to(
        state,
        { open: 1, duration: 2.2, ease: 'power2.inOut', onUpdate: () => box.setOpen(state.open) },
        0.2,
      )
      timeline.fromTo(rig.rotation, { y: -0.12 }, { y: 0.09, duration: 2.5, ease: 'power2.out' }, 0)
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
          spread: Math.sin(trigger.progress * Math.PI) * 0.86,
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
        x: y * 0.12,
        y: x * 0.24,
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
      settleFormat(currentFormat)
      const previous = models.get(currentFormat)
      const next = models.get(index)
      currentFormat = index
      if (!animate || paused || !visible) {
        settleFormat(index)
        render()
        return
      }
      timeline = gsap.timeline({ onUpdate: render })
      timeline
        .to(previous.scale, { x: 0.94, y: 0.94, z: 0.94, duration: 0.22, ease: 'power2.in' })
        .to(previous.position, { y: -0.3, duration: 0.22, ease: 'power2.in' }, 0)
        .call(() => {
          for (const model of models.values()) model.visible = false
          next.visible = true
          next.scale.setScalar(0.94)
          next.position.y = -0.3
        })
        .to(next.scale, { x: 1, y: 1, z: 1, duration: 0.65, ease: 'power3.out' })
        .to(next.position, { y: 0, duration: 0.65, ease: 'power3.out' }, '<')
    },
    destroy() {
      destroyed = true
      events.abort()
      timeline?.kill()
      pointerTween?.kill()
      scrollTween?.kill()
      scrollTrigger?.kill()
      stage.destroy()
    },
  }
  try {
    stage.draw()
  } catch (error) {
    instance.destroy()
    throw error
  }
  return instance
}

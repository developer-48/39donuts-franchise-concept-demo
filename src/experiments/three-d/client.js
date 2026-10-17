import { initControls } from './controls.js'
import { sceneIds } from './configuration.js'
import './scenes.css'

const targets = {
  hero: '.hero-media',
  product: '.advantages-feature',
  formats: '.format-visual',
  box: '.story-counter',
}

function initLab() {
  if (!document.querySelector('[data-motion-lab]')) return
  const entries = new Map()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let applicationOpen = false
  let modulePromise
  let controls

  const blocked = () => controls.getState().paused || applicationOpen || document.hidden

  function report(entry, status) {
    controls.setStatus(entry.id, status)
    entry.host.dataset.sceneState = status
  }

  function remove(id) {
    const entry = entries.get(id)
    if (!entry) return
    entries.delete(id)
    entry.observer.disconnect()
    entry.instance?.destroy()
    entry.host.remove()
    delete entry.target.dataset.threeReady
    delete entry.target.dataset.threeEnabled
    controls.setStatus(id, 'off')
  }

  async function load(entry) {
    if (entry.pending || entry.instance || entry.failed) return
    entry.pending = true
    report(entry, 'loading')
    try {
      modulePromise ??= import('./scenes.js')
      const { createScene } = await modulePromise
      if (entries.get(entry.id) !== entry) return
      entry.instance = createScene(entry.id, entry.host, {
        reducedMotion: reducedMotion.matches,
        paused: blocked(),
        onError: () => {
          entry.failed = true
          delete entry.target.dataset.threeReady
          entry.instance?.destroy()
          entry.instance = null
          report(entry, 'fallback')
        },
      })
      entry.instance.setVisible(entry.visible)
      entry.target.dataset.threeReady = entry.id
      report(entry, blocked() ? 'paused' : 'ready')
    } catch (error) {
      entry.failed = true
      entry.instance?.destroy()
      entry.instance = null
      delete entry.target.dataset.threeReady
      report(entry, 'fallback')
      console.warn(`3D scene ${entry.id} uses its static fallback.`, error)
    } finally {
      entry.pending = false
    }
  }

  function mount(id) {
    if (entries.has(id)) return
    const target = document.querySelector(targets[id])
    if (!target) return
    const host = document.createElement('div')
    host.className = `three-d-host three-d-${id}`
    host.dataset.scene = id
    host.setAttribute('aria-hidden', 'true')
    target.append(host)
    target.dataset.threeEnabled = id
    const entry = {
      id,
      host,
      target,
      visible: false,
      instance: null,
      pending: false,
      failed: false,
    }
    entry.observer = new IntersectionObserver(
      ([event]) => {
        entry.visible = event.isIntersecting
        if (event.isIntersecting) load(entry)
        entry.instance?.setVisible(event.isIntersecting)
      },
      { rootMargin: '120px 0px', threshold: 0 },
    )
    entries.set(id, entry)
    entry.observer.observe(host)
    report(entry, 'waiting')
  }

  function sync() {
    const { scenes } = controls.getState()
    for (const id of sceneIds) {
      if (scenes.includes(id)) mount(id)
      else remove(id)
    }
    for (const entry of entries.values()) {
      entry.instance?.setPaused(blocked())
      if (entry.instance) report(entry, blocked() ? 'paused' : 'ready')
    }
  }

  controls = initControls({
    onChange: sync,
    onReplay: () => {
      for (const entry of entries.values()) {
        if (entry.visible) entry.instance?.replay()
      }
    },
  })
  if (!controls) return
  sync()

  document.addEventListener('visibilitychange', sync)
  document.addEventListener('application:visibility', ({ detail }) => {
    applicationOpen = detail.open
    sync()
  })
  reducedMotion.addEventListener('change', () => {
    for (const id of [...entries.keys()]) remove(id)
    sync()
  })
  document.querySelector('.format-tabs')?.addEventListener('click', () => {
    const selected = document.querySelector('[data-format-index][aria-selected="true"]')
    entries.get('formats')?.instance?.setFormat(Number(selected?.dataset.formatIndex ?? 0))
  })
  document.querySelector('.format-tabs')?.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const selected = document.querySelector('[data-format-index][aria-selected="true"]')
    entries.get('formats')?.instance?.setFormat(Number(selected?.dataset.formatIndex ?? 0))
  })
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      for (const entry of entries.values()) entry.instance?.setPaused(true)
    } else {
      for (const id of [...entries.keys()]) remove(id)
      controls.destroy()
    }
  })
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) sync()
  })
}

initLab()

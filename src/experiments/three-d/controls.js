import { matchingPreset, normalizeScenes, presets, readSceneSelection } from './configuration.js'

const statusLabels = {
  waiting: 'Ожидает экрана',
  loading: 'Загружается',
  ready: 'Готово',
  fallback: 'Статичное изображение',
  paused: 'На паузе',
}

export function initControls({ onChange = () => {}, onReplay = () => {} } = {}) {
  const panel = document.querySelector('[data-motion-lab]')
  const preset =
    presets.find(({ id }) => id === panel?.dataset.preset) ??
    presets.find(({ id }) => id === 'formats')
  const state = {
    scenes: readSceneSelection(window.location.search, preset.scenes),
    paused: false,
  }
  const statuses = new Map()
  const events = new AbortController()
  const snapshot = () => ({ scenes: [...state.scenes], paused: state.paused })

  if (!panel) {
    return { getState: snapshot, setStatus: () => {}, destroy: () => {} }
  }

  const toggles = [...panel.querySelectorAll('[data-lab-toggle]')]
  const pauseButton = panel.querySelector('[data-lab-pause]')
  const pauseLabel = panel.querySelector('[data-lab-pause-label]')
  const replayButton = panel.querySelector('[data-lab-replay]')
  const count = panel.querySelector('[data-lab-count]')
  const announcement = panel.querySelector('[data-lab-announcement]')

  function renderStatus(id) {
    const target = panel.querySelector(`[data-lab-status="${id}"]`)
    if (!target) return
    const selected = state.scenes.includes(id)
    const status = !selected ? 'off' : state.paused ? 'paused' : (statuses.get(id) ?? 'waiting')
    target.textContent = status === 'off' ? 'Выключено' : statusLabels[status]
    target.dataset.state = status
    target.closest('[data-lab-scene]')?.classList.toggle('is-selected', selected)
  }

  function render() {
    const activePreset = matchingPreset(state.scenes)
    toggles.forEach((input) => {
      input.checked = state.scenes.includes(input.value)
      renderStatus(input.value)
    })
    panel.querySelectorAll('[data-lab-preset]').forEach((link) => {
      if (link.dataset.labPreset === activePreset?.id) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
    count.textContent = state.scenes.length === 0 ? 'Без 3D' : 'Форматы'
    pauseButton.setAttribute('aria-pressed', String(state.paused))
    pauseLabel.textContent = state.paused ? 'Продолжить' : 'На паузу'
    pauseButton.disabled = state.scenes.length === 0
    replayButton.disabled = state.scenes.length === 0 || state.paused
  }

  function syncUrl() {
    const url = new URL(window.location.href)
    url.searchParams.set('scenes', state.scenes.join(',') || 'none')
    window.history.replaceState(window.history.state, '', url)
  }

  toggles.forEach((input) => {
    input.addEventListener(
      'change',
      () => {
        state.scenes = normalizeScenes(
          toggles.filter((toggle) => toggle.checked).map(({ value }) => value),
        )
        render()
        syncUrl()
        announcement.textContent =
          state.scenes.length === 0 ? '3D в форматах выключено.' : '3D в форматах включено.'
        onChange(snapshot())
      },
      { signal: events.signal },
    )
  })

  pauseButton.addEventListener(
    'click',
    () => {
      state.paused = !state.paused
      render()
      announcement.textContent = state.paused ? 'Анимации на паузе.' : 'Анимации продолжаются.'
      onChange(snapshot())
    },
    { signal: events.signal },
  )

  replayButton.addEventListener(
    'click',
    () => {
      announcement.textContent = 'Повторяем анимации в видимой части страницы.'
      onReplay(snapshot())
    },
    { signal: events.signal },
  )

  document.addEventListener(
    'application:visibility',
    (event) => {
      const open = Boolean(event.detail?.open)
      panel.inert = open
      panel.hidden = open
    },
    { signal: events.signal },
  )

  render()

  return {
    getState: snapshot,
    setStatus(id, status) {
      if (!toggles.some((input) => input.value === id) || !Object.hasOwn(statusLabels, status))
        return
      statuses.set(id, status)
      renderStatus(id)
    },
    destroy() {
      events.abort()
      panel.inert = false
      panel.hidden = false
    },
  }
}

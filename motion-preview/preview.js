const formats = [
  {
    name: 'Кофейня + цех',
    note: '',
    values: ['80 м²', 'от 7 000 000 ₽', '25–30%', '≈ 2 400 000 ₽', '600 000 ₽', '12–16 месяцев'],
  },
  {
    name: 'Кофейня',
    note: 'цех отдельно',
    values: ['от 40 м² + 30 м² цех', 'от 7 000 000 ₽', '25–30%', '≈ 2 100 000 ₽', '630 000 ₽', '12–16 месяцев'],
  },
  {
    name: 'Павильон-островок',
    note: 'цех отдельно',
    values: ['от 12 м² + 30 м² цех', 'от 5 000 000 ₽', '27–33%', '≈ 2 400 000 ₽', '720 000 ₽', '6–12 месяцев'],
  },
]

const counterCard = document.getElementById('counter-card')
const counterModeButtons = [...document.querySelectorAll('[data-counter-mode]')]
const formatsDemo = document.getElementById('formats-demo')
const formatModeButtons = [...document.querySelectorAll('[data-formats-mode]')]
const tabs = [...document.querySelectorAll('[data-format]')]
const formatImages = [...document.querySelectorAll('.format-visual img')]
const formatPanel = document.getElementById('preview-format-panel')
const formatTitle = document.getElementById('format-title-row')
const formatName = document.getElementById('format-name')
const formatNote = document.getElementById('format-note')
const facts = [...document.querySelectorAll('.format-fact')]

let counterMode = 'proposal'
let formatsMode = 'proposal'
let activeFormat = 0

function syncModeButtons(buttons, mode) {
  buttons.forEach((button) => {
    const isSelected = button.dataset.counterMode === mode || button.dataset.formatsMode === mode
    button.classList.toggle('is-selected', isSelected)
    button.setAttribute('aria-pressed', String(isSelected))
  })
}

function replayCounter() {
  counterCard.classList.remove('is-playing')
  // Restart the preview after the previous animation has been applied.
  void counterCard.offsetWidth
  requestAnimationFrame(() => counterCard.classList.add('is-playing'))
}

counterModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    counterMode = button.dataset.counterMode
    counterCard.classList.toggle('mode-current', counterMode === 'current')
    counterCard.classList.toggle('mode-proposal', counterMode === 'proposal')
    syncModeButtons(counterModeButtons, counterMode)
    replayCounter()
  })
})

document.getElementById('counter-replay').addEventListener('click', replayCounter)

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      replayCounter()
      observer.disconnect()
    }
  }, { threshold: 0.25 })
  observer.observe(counterCard)
} else {
  replayCounter()
}

formatModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    formatsMode = button.dataset.formatsMode
    formatsDemo.classList.toggle('mode-current', formatsMode === 'current')
    formatsDemo.classList.toggle('mode-proposal', formatsMode === 'proposal')
    syncModeButtons(formatModeButtons, formatsMode)
  })
})

function refreshDetails() {
  ;[formatTitle, ...facts].forEach((element) => {
    element.classList.remove('is-refreshing')
    void element.offsetWidth
    element.classList.add('is-refreshing')
  })
}

function selectFormat(index) {
  if (index === activeFormat) return
  activeFormat = index
  const format = formats[index]

  formatsDemo.style.setProperty('--selected-index', String(index))
  tabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index
    tab.classList.toggle('is-active', selected)
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
  })
  formatPanel.setAttribute('aria-labelledby', tabs[index].id)
  formatImages.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index))

  formatName.textContent = format.name
  formatName.classList.toggle('is-island', index === 2)
  formatNote.textContent = format.note
  formatNote.hidden = !format.note
  facts.forEach((fact, factIndex) => {
    fact.querySelector('dd').textContent = format.values[factIndex]
  })
  refreshDetails()
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectFormat(index))
  tab.addEventListener('keydown', (event) => {
    let next
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return

    event.preventDefault()
    selectFormat(next)
    tabs[next].focus()
  })
})

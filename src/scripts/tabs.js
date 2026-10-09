function bindTabs(buttons, activate) {
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(index))
    button.addEventListener('keydown', (event) => {
      let next
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length
      else if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = buttons.length - 1
      else return
      event.preventDefault()
      activate(next)
      buttons[next].focus()
    })
  })
}

function selectTab(buttons, index) {
  buttons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-selected', String(active))
    button.tabIndex = active ? 0 : -1
  })
}

export function initFormats() {
  const section = document.querySelector('#formats')
  const tabs = [...section.querySelectorAll('[data-format-index]')]
  const copies = [...section.querySelectorAll('[data-format-copy]')]
  const images = [...section.querySelectorAll('[data-format-image]')]
  const panel = section.querySelector('#format-panel')
  const tabList = section.querySelector('.format-tabs')
  let selected = 0
  bindTabs(tabs, (index) => {
    if (index === selected) return
    selected = index
    selectTab(tabs, index)
    tabList.style.setProperty('--active-format', String(index))
    panel.setAttribute('aria-labelledby', tabs[index].id)
    copies.forEach((copy, copyIndex) => { copy.hidden = copyIndex !== index })
    images.forEach((image, imageIndex) => {
      const active = imageIndex === index
      image.classList.toggle('is-active', active)
      image.setAttribute('aria-hidden', String(!active))
      image.alt = active ? image.dataset.formatAlt : ''
    })
    section.querySelector('[data-format-asset-note]').hidden = index !== 2
  })
}

function expandItem(item, expanded) {
  item.classList.toggle('is-open', expanded)
  item.querySelector('h3 button').setAttribute('aria-expanded', String(expanded))
  item.querySelector('.faq-answer-grid').setAttribute('aria-hidden', String(!expanded))
}

export function initFaq() {
  const section = document.querySelector('#faq')
  const tabs = [...section.querySelectorAll('[data-faq-group]')]
  const panels = [...section.querySelectorAll('[data-faq-panel]')]
  let selected = 0
  bindTabs(tabs, (index) => {
    if (index === selected) return
    selected = index
    selectTab(tabs, index)
    panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index })
    panels[index].querySelectorAll('.faq-item').forEach((item, itemIndex) => expandItem(item, itemIndex === 0))
  })
  panels.forEach((panel) => {
    const items = [...panel.querySelectorAll('.faq-item')]
    items.forEach((item) => item.querySelector('h3 button').addEventListener('click', () => {
      const next = !item.classList.contains('is-open')
      items.forEach((other) => expandItem(other, other === item && next))
    }))
  })
}

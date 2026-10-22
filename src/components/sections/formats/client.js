import { bindTabs, selectTab } from '../../../lib/tabs.js'
import { FORMAT_CHANGE_EVENT } from './events.js'

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
    copies.forEach((copy, copyIndex) => {
      copy.hidden = copyIndex !== index
    })
    images.forEach((image, imageIndex) => {
      const active = imageIndex === index
      image.classList.toggle('is-active', active)
      image.setAttribute('aria-hidden', String(!active))
      image.alt = active ? image.dataset.formatAlt : ''
    })
    section.querySelector('[data-format-asset-note]').hidden = index !== 2
    section.dispatchEvent(new CustomEvent(FORMAT_CHANGE_EVENT, { detail: { index } }))
  })
}

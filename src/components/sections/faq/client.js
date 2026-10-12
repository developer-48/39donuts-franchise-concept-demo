import { bindTabs, selectTab } from '../../../lib/tabs.js'

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
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index
    })
    panels[index]
      .querySelectorAll('.faq-item')
      .forEach((item, itemIndex) => expandItem(item, itemIndex === 0))
  })
  panels.forEach((panel) => {
    const items = [...panel.querySelectorAll('.faq-item')]
    items.forEach((item) =>
      item.querySelector('h3 button').addEventListener('click', () => {
        const next = !item.classList.contains('is-open')
        items.forEach((other) => expandItem(other, other === item && next))
      }),
    )
  })
}

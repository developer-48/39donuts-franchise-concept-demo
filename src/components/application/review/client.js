// Renders only populated answer groups and connects their edit actions.
import { getReviewGroups } from '../model.js'

function element(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}

export function renderReview(container, data, goToStep) {
  const sections = getReviewGroups(data).map((group) => {
    const section = element('section', undefined, 'wizard-review-group')
    const titleId = `wizard-review-${group.step}`
    section.setAttribute('aria-labelledby', titleId)
    const header = element('header')
    const title = element('div')
    const heading = element('h4', group.title)
    heading.id = titleId
    title.append(element('span', String(group.step + 1).padStart(2, '0')), heading)
    const edit = element('button', 'Изменить')
    edit.type = 'button'
    edit.addEventListener('click', () => goToStep(group.step))
    header.append(title, edit)
    const list = element('dl')
    for (const item of group.items) {
      const field = element(
        'div',
        undefined,
        item.wide || group.items.length === 1 ? 'is-wide' : undefined,
      )
      field.append(element('dt', item.label), element('dd', item.value))
      list.append(field)
    }
    section.append(header, list)
    return section
  })
  container.replaceChildren(...sections)
}

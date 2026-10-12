export function bindTabs(buttons, activate) {
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

export function selectTab(buttons, index) {
  buttons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-selected', String(active))
    button.tabIndex = active ? 0 : -1
  })
}

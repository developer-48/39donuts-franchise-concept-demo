import { legacyAnchors } from '../data/seoContent.js'

export function initNavigation() {
  const header = document.querySelector('.site-header')
  const menu = document.querySelector('#mobile-navigation')
  const shell = menu?.closest('.mobile-menu-shell')
  const menuButton = header?.querySelector('.menu-button')
  const openIcon = menuButton?.querySelector('[data-menu-open-icon]')
  const closeIcon = menuButton?.querySelector('[data-menu-close-icon]')
  let menuOpen = false
  let unlockBackground = null

  const updateMenu = () => {
    shell?.classList.toggle('is-open', menuOpen)
    shell?.setAttribute('aria-hidden', String(!menuOpen))
    if (shell) shell.inert = !menuOpen
    menuButton?.setAttribute('aria-expanded', String(menuOpen))
    menuButton?.setAttribute('aria-label', menuOpen ? 'Закрыть меню' : 'Открыть меню')
    if (openIcon) openIcon.hidden = menuOpen
    if (closeIcon) closeIcon.hidden = !menuOpen
  }

  const closeMenu = () => {
    const wasOpen = menuOpen
    if (!wasOpen) return false
    menuOpen = false
    unlockBackground?.()
    unlockBackground = null
    updateMenu()
    requestAnimationFrame(() => menuButton?.focus({ preventScroll: true }))
    return true
  }

  const openMenu = () => {
    if (menuOpen || !menu || !shell) return
    menuOpen = true
    updateMenu()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const backgroundElements = [
      header,
      document.querySelector('#main-content'),
      document.querySelector('.site-footer'),
    ].filter(Boolean)
    const previousAriaHidden = backgroundElements.map((element) => element.getAttribute('aria-hidden'))
    const previousInert = backgroundElements.map((element) => element.inert)
    backgroundElements.forEach((element) => {
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    })
    const focusable = menu.querySelectorAll('a, button')

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
      if (event.key === 'Tab' && focusable.length) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    unlockBackground = () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      backgroundElements.forEach((element, index) => {
        element.inert = previousInert[index]
        const previousValue = previousAriaHidden[index]
        if (previousValue === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', previousValue)
      })
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (shell.classList.contains('is-open')) {
          menu.querySelector('button, a')?.focus({ preventScroll: true })
        }
      })
    })
  }

  const scrollToSection = (href, updateHistory = true) => {
    const target = document.querySelector(href)
    if (!target) return
    const headerHeight = header?.getBoundingClientRect().height ?? 0
    let targetOffset = 0
    let offsetNode = target
    while (offsetNode) {
      targetOffset += offsetNode.offsetTop
      offsetNode = offsetNode.offsetParent
    }
    if (updateHistory) window.history.pushState(null, '', href)
    window.scrollTo({
      top: Math.max(0, targetOffset - headerHeight - 12),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  menuButton?.addEventListener('click', () => {
    if (menuOpen) closeMenu()
    else openMenu()
  })
  shell?.querySelectorAll('[data-close-menu]').forEach((button) => {
    button.addEventListener('click', closeMenu)
  })
  document.querySelectorAll('[data-section-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      const href = link.getAttribute('href')
      if (!href) return
      if (menu?.contains(link)) {
        closeMenu()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => scrollToSection(href))
        })
      } else {
        scrollToSection(href)
      }
    })
  })

  updateMenu()
  const restoreLegacyAnchor = () => {
    const target = legacyAnchors[window.location.hash.slice(1)]
    if (!target) return
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${target}`)
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(`#${target}`, false)))
  }
  restoreLegacyAnchor()
  window.addEventListener('hashchange', restoreLegacyAnchor)
  return { isOpen: () => menuOpen, close: closeMenu }
}

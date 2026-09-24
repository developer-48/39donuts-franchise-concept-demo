import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { assets } from '../../data/siteContent'
import {
  Bars3SolidIcon,
  ChevronRightIcon,
  CtaArrowIcon,
  PackIcon,
  XMarkSolidIcon,
  type PackIconName,
} from '../../components/Icons'

const navItems: Array<{ href: string; label: string; description: string; icon: PackIconName }> = [
  { href: '#story', label: 'История', description: 'Как всё началось', icon: 'book' },
  { href: '#network', label: 'Сеть', description: 'Точки и география', icon: 'location' },
  { href: '#formats', label: 'Форматы', description: 'Модели кофеен', icon: 'shop' },
  { href: '#reviews', label: 'Отзывы', description: 'Голоса партнёров', icon: 'message' },
  { href: '#faq', label: 'FAQ', description: 'Условия и ответы', icon: 'document' },
]

type HeaderProps = {
  onOpenApplication: () => void
}

export function Header({ onOpenApplication }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }))
  }, [])

  const openMenu = useCallback(() => {
    setMenuOpen(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const shell = menuRef.current?.closest('.mobile-menu-shell')
        if (shell?.classList.contains('is-open')) {
          menuRef.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true })
        }
      })
    })
  }, [])

  const scrollToSection = useCallback((href: string) => {
    const target = document.querySelector<HTMLElement>(href)
    if (!target) return
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0
    let targetOffset = 0
    let offsetNode: HTMLElement | null = target
    while (offsetNode) {
      targetOffset += offsetNode.offsetTop
      offsetNode = offsetNode.offsetParent as HTMLElement | null
    }
    window.history.pushState(null, '', href)
    window.scrollTo({
      top: Math.max(0, targetOffset - headerHeight - 12),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [])

  const navigateFromMenu = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault()
      closeMenu()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToSection(href)
        })
      })
    },
    [closeMenu, scrollToSection],
  )

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const backgroundElements = [
      headerRef.current,
      document.querySelector<HTMLElement>('#main-content'),
      document.querySelector<HTMLElement>('.site-footer'),
    ].filter((element): element is HTMLElement => Boolean(element))
    const previousAriaHidden = backgroundElements.map((element) => element.getAttribute('aria-hidden'))
    backgroundElements.forEach((element) => {
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    })
    const menu = menuRef.current
    const focusable = menu?.querySelectorAll<HTMLElement>('a, button')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
      if (event.key === 'Tab' && focusable?.length) {
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
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      backgroundElements.forEach((element, index) => {
        element.inert = false
        const previousValue = previousAriaHidden[index]
        if (previousValue === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', previousValue)
      })
    }
  }, [closeMenu, menuOpen])

  return (
    <>
      <header ref={headerRef} className="site-header">
        <div className="header-inner">
          <a className="logo-link" href={import.meta.env.BASE_URL} aria-label="39 donuts — к началу страницы">
            <img src={assets.logo} alt="39 donuts" width="129" height="24" />
          </a>

          <nav className="desktop-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <a
                href={item.href}
                key={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(item.href)
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button className="button button-small header-cta" type="button" onClick={onOpenApplication}>
              <span>Стать партнёром</span>
              <CtaArrowIcon className="cta-arrow-icon" />
            </button>
            <button
              ref={menuButtonRef}
              className="menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={menuOpen ? closeMenu : openMenu}
            >
              {menuOpen ? <XMarkSolidIcon /> : <Bars3SolidIcon />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu-shell mobile-menu-shell-current ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <button className="mobile-menu-backdrop" type="button" tabIndex={-1} aria-label="Закрыть меню" onClick={() => closeMenu()} />
        <div
          ref={menuRef}
          className="mobile-menu mobile-menu-current"
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-navigation-title"
        >
          <div className="mobile-menu-topline">
            <div className="mobile-menu-brand">
              <img src={assets.logo} alt="" width="124" height="23" />
              <span id="mobile-navigation-title">Разделы сайта</span>
            </div>
            <button type="button" onClick={() => closeMenu()} aria-label="Закрыть меню">
              <XMarkSolidIcon />
            </button>
          </div>
          <nav aria-label="Мобильная навигация">
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={(event) => navigateFromMenu(event, item.href)}>
                <span className="mobile-menu-icon"><PackIcon name={item.icon} /></span>
                <span className="mobile-menu-link-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                <ChevronRightIcon />
              </a>
            ))}
          </nav>
          <button
            className="button mobile-menu-cta"
            type="button"
            onClick={() => {
              setMenuOpen(false)
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  menuButtonRef.current?.focus({ preventScroll: true })
                  onOpenApplication()
                })
              })
            }}
          >
            <span>Стать партнёром</span>
            <CtaArrowIcon className="cta-arrow-icon" />
          </button>
        </div>
      </div>
    </>
  )
}

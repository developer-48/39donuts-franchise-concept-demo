const mediaQuery = '(min-width: 901px) and (pointer: fine) and (forced-colors: none)'
const edgeInset = 0
const thumbHeight = 72

function getMaxScroll() {
  const pageHeight =
    document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight
  return Math.max(0, pageHeight - window.innerHeight)
}

export function initDonutScrollbar() {
  const rail = document.querySelector('.donut-scrollbar')
  const thumb = rail?.querySelector('.donut-scrollbar-thumb')
  const image = thumb?.querySelector('img')
  if (!rail || !thumb || !image) return

  let eligible = false
  let assetReady = image.complete && image.naturalWidth > 0
  let dialogOpen = false
  let visible = false
  let drag = null
  let frame = null
  let stopSync = null
  let metrics = { maxScroll: 0, progress: 0, thumbTop: edgeInset, thumbTravel: 0 }

  const render = () => {
    const active = eligible && assetReady && metrics.maxScroll > 0
    visible = active && !dialogOpen
    document.documentElement.classList.toggle('has-donut-scrollbar', active)
    rail.classList.toggle('is-visible', visible)
    rail.tabIndex = visible ? 0 : -1
    rail.setAttribute('aria-valuenow', String(Math.round(metrics.progress * 100)))
    thumb.style.transform = `translate3d(0, ${metrics.thumbTop}px, 0)`
  }

  const sync = () => {
    const maxScroll = getMaxScroll()
    const progress = maxScroll === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll))
    const railHeight = rail.clientHeight || window.innerHeight
    const thumbTravel = Math.max(0, railHeight - edgeInset * 2 - thumbHeight)
    const thumbTop = edgeInset + progress * thumbTravel
    metrics = { maxScroll, progress, thumbTop, thumbTravel }
    render()
  }

  const schedule = () => {
    if (frame !== null) return
    frame = window.requestAnimationFrame(() => {
      frame = null
      sync()
    })
  }

  const query = window.matchMedia(mediaQuery)
  const onEligibilityChange = () => {
    eligible = query.matches
    stopSync?.()
    stopSync = null
    if (eligible) {
      const observer = new ResizeObserver(schedule)
      observer.observe(document.body)
      observer.observe(document.documentElement)
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
      schedule()
      stopSync = () => {
        observer.disconnect()
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
        if (frame !== null) window.cancelAnimationFrame(frame)
        frame = null
      }
    }
    sync()
  }
  query.addEventListener('change', onEligibilityChange)

  image.addEventListener('load', () => {
    assetReady = true
    sync()
  })
  image.addEventListener('error', () => {
    assetReady = false
    sync()
  })
  document.addEventListener('application:visibility', (event) => {
    dialogOpen = Boolean(event.detail?.open)
    sync()
  })

  const scrollFromPointer = (clientY, grabOffset) => {
    if (metrics.maxScroll === 0 || metrics.thumbTravel === 0) return
    const position = Math.min(
      metrics.thumbTravel,
      Math.max(0, clientY - rail.getBoundingClientRect().top - grabOffset - edgeInset),
    )
    window.scrollTo({
      top: (position / metrics.thumbTravel) * metrics.maxScroll,
      behavior: 'instant',
    })
  }

  rail.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !visible) return
    const onThumb = thumb.contains(event.target)
    const grabOffset = onThumb ? event.clientY - thumb.getBoundingClientRect().top : thumbHeight / 2
    drag = { pointerId: event.pointerId, grabOffset }
    rail.setPointerCapture(event.pointerId)
    scrollFromPointer(event.clientY, grabOffset)
    event.preventDefault()
  })
  rail.addEventListener('pointermove', (event) => {
    if (drag?.pointerId !== event.pointerId) return
    scrollFromPointer(event.clientY, drag.grabOffset)
  })
  const endDrag = (event) => {
    if (drag?.pointerId !== event.pointerId) return
    drag = null
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
  }
  rail.addEventListener('pointerup', endDrag)
  rail.addEventListener('pointercancel', endDrag)
  rail.addEventListener('keydown', (event) => {
    let next
    switch (event.key) {
      case 'ArrowUp':
        next = window.scrollY - 48
        break
      case 'ArrowDown':
        next = window.scrollY + 48
        break
      case 'PageUp':
        next = window.scrollY - window.innerHeight * 0.85
        break
      case 'PageDown':
        next = window.scrollY + window.innerHeight * 0.85
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = metrics.maxScroll
        break
      default:
        return
    }
    event.preventDefault()
    window.scrollTo({ top: Math.min(metrics.maxScroll, Math.max(0, next)), behavior: 'instant' })
  })

  onEligibilityChange()
}

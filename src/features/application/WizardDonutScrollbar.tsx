import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject, type WheelEvent } from 'react'

const mediaQuery = '(min-width: 961px) and (pointer: fine) and (forced-colors: none)'
const thumbHeight = 58
const image = `${import.meta.env.BASE_URL}assets/concept/donut-scroll-thumb-variety.png`

type ScrollMetrics = {
  maxScroll: number
  progress: number
  thumbTop: number
  thumbTravel: number
}

const initialMetrics: ScrollMetrics = { maxScroll: 0, progress: 0, thumbTop: 0, thumbTravel: 0 }

export function WizardDonutScrollbar({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null> }) {
  const railRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; grabOffset: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const [eligible, setEligible] = useState(false)
  const [assetReady, setAssetReady] = useState(false)
  const [metrics, setMetrics] = useState<ScrollMetrics>(initialMetrics)

  const sync = useCallback(() => {
    const body = scrollRef.current
    const rail = railRef.current
    if (!body || !rail) return

    const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight)
    const progress = maxScroll === 0 ? 0 : Math.min(1, Math.max(0, body.scrollTop / maxScroll))
    const thumbTravel = Math.max(0, rail.clientHeight - thumbHeight)
    const thumbTop = progress * thumbTravel
    setMetrics((previous) => {
      if (previous.maxScroll === maxScroll && previous.thumbTravel === thumbTravel && previous.thumbTop === thumbTop) {
        return previous
      }
      return { maxScroll, progress, thumbTop, thumbTravel }
    })
  }, [scrollRef])

  useEffect(() => {
    const query = window.matchMedia(mediaQuery)
    const onChange = () => setEligible(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const body = scrollRef.current
    const rail = railRef.current
    if (!body || !rail) return

    const schedule = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        sync()
      })
    }
    const observer = new ResizeObserver(schedule)
    const observeContent = () => {
      Array.from(body.children).forEach((child) => observer.observe(child))
      schedule()
    }
    observer.observe(body)
    observer.observe(rail)
    observeContent()
    const mutations = new MutationObserver(observeContent)
    mutations.observe(body, { childList: true, subtree: true, characterData: true })
    body.addEventListener('scroll', schedule, { passive: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
      body.removeEventListener('scroll', schedule)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [scrollRef, sync])

  useLayoutEffect(() => {
    sync()
  }, [assetReady, eligible, sync])

  const visible = eligible && assetReady && metrics.maxScroll > 0 && metrics.thumbTravel > 0

  const scrollFromPointer = (clientY: number, grabOffset: number) => {
    const body = scrollRef.current
    const rail = railRef.current
    if (!body || !rail || !metrics.thumbTravel) return
    const position = Math.min(
      metrics.thumbTravel,
      Math.max(0, clientY - rail.getBoundingClientRect().top - grabOffset),
    )
    body.scrollTop = (position / metrics.thumbTravel) * metrics.maxScroll
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !visible) return
    const thumb = thumbRef.current
    const onThumb = thumb?.contains(event.target as Node)
    const grabOffset = onThumb && thumb
      ? event.clientY - thumb.getBoundingClientRect().top
      : thumbHeight / 2
    dragRef.current = { pointerId: event.pointerId, grabOffset }
    event.currentTarget.setPointerCapture(event.pointerId)
    scrollFromPointer(event.clientY, grabOffset)
    event.preventDefault()
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    scrollFromPointer(event.clientY, dragRef.current.grabOffset)
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const body = scrollRef.current
    if (!body) return
    let next: number
    switch (event.key) {
      case 'ArrowUp': next = body.scrollTop - 48; break
      case 'ArrowDown': next = body.scrollTop + 48; break
      case 'PageUp': next = body.scrollTop - body.clientHeight * 0.85; break
      case 'PageDown': next = body.scrollTop + body.clientHeight * 0.85; break
      case 'Home': next = 0; break
      case 'End': next = metrics.maxScroll; break
      default: return
    }
    event.preventDefault()
    body.scrollTop = Math.min(metrics.maxScroll, Math.max(0, next))
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const body = scrollRef.current
    if (!body) return
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? body.clientHeight : 1
    body.scrollTop += event.deltaY * unit
  }

  return (
    <div
      ref={railRef}
      className={`wizard-donut-scrollbar${visible ? ' is-visible' : ''}`}
      role="scrollbar"
      aria-label="Прокрутка полей анкеты"
      aria-controls="wizard-step-body"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(metrics.progress * 100)}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
    >
      <div
        ref={thumbRef}
        className="wizard-donut-scrollbar-thumb"
        style={{ transform: `translate3d(0, ${metrics.thumbTop}px, 0)` }}
      >
        <img src={image} alt="" draggable="false" onLoad={() => setAssetReady(true)} onError={() => setAssetReady(false)} />
      </div>
    </div>
  )
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'

const mediaQuery = '(min-width: 901px) and (pointer: fine) and (forced-colors: none)'
const edgeInset = 0
const thumbHeight = 72
const image = `${import.meta.env.BASE_URL}assets/concept/donut-scroll-thumb-variety.png`

type ScrollMetrics = {
  maxScroll: number
  progress: number
  thumbTop: number
  thumbTravel: number
}

const initialMetrics: ScrollMetrics = {
  maxScroll: 0,
  progress: 0,
  thumbTop: edgeInset,
  thumbTravel: 0,
}

function getMaxScroll() {
  const pageHeight = document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight
  return Math.max(0, pageHeight - window.innerHeight)
}

export function DonutScrollbar({ dialogOpen }: { dialogOpen: boolean }) {
  const railRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; grabOffset: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const [eligible, setEligible] = useState(false)
  const [assetReady, setAssetReady] = useState(false)
  const [metrics, setMetrics] = useState<ScrollMetrics>(initialMetrics)

  const sync = useCallback(() => {
    const maxScroll = getMaxScroll()
    const progress = maxScroll === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll))
    const railHeight = railRef.current?.clientHeight || window.innerHeight
    const thumbTravel = Math.max(0, railHeight - edgeInset * 2 - thumbHeight)
    const thumbTop = edgeInset + progress * thumbTravel
    setMetrics((previous) => {
      if (
        previous.maxScroll === maxScroll &&
        previous.thumbTravel === thumbTravel &&
        previous.thumbTop === thumbTop
      ) return previous
      return { maxScroll, progress, thumbTop, thumbTravel }
    })
  }, [])

  useEffect(() => {
    const query = window.matchMedia(mediaQuery)
    const onChange = () => setEligible(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!eligible) return
    const schedule = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        sync()
      })
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    observer.observe(document.documentElement)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [eligible, sync])

  useLayoutEffect(() => {
    sync()
  }, [assetReady, dialogOpen, eligible, sync])

  const active = eligible && assetReady && metrics.maxScroll > 0
  const visible = active && !dialogOpen

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('has-donut-scrollbar', active)
    return () => document.documentElement.classList.remove('has-donut-scrollbar')
  }, [active])

  const scrollFromPointer = (clientY: number, grabOffset: number) => {
    const rail = railRef.current
    if (!rail || metrics.maxScroll === 0 || metrics.thumbTravel === 0) return
    const position = Math.min(
      metrics.thumbTravel,
      Math.max(0, clientY - rail.getBoundingClientRect().top - grabOffset - edgeInset),
    )
    window.scrollTo({ top: (position / metrics.thumbTravel) * metrics.maxScroll, behavior: 'instant' })
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
    let next: number
    switch (event.key) {
      case 'ArrowUp': next = window.scrollY - 48; break
      case 'ArrowDown': next = window.scrollY + 48; break
      case 'PageUp': next = window.scrollY - window.innerHeight * 0.85; break
      case 'PageDown': next = window.scrollY + window.innerHeight * 0.85; break
      case 'Home': next = 0; break
      case 'End': next = metrics.maxScroll; break
      default: return
    }
    event.preventDefault()
    window.scrollTo({ top: Math.min(metrics.maxScroll, Math.max(0, next)), behavior: 'instant' })
  }

  return createPortal(
    <div
      ref={railRef}
      className={`donut-scrollbar${visible ? ' is-visible' : ''}`}
      role="scrollbar"
      aria-label="Прокрутка страницы"
      aria-controls="root"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(metrics.progress * 100)}
      tabIndex={visible ? 0 : -1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <div
        ref={thumbRef}
        className="donut-scrollbar-thumb"
        style={{ transform: `translate3d(0, ${metrics.thumbTop}px, 0)` }}
      >
        <img src={image} alt="" draggable="false" onLoad={() => setAssetReady(true)} onError={() => setAssetReady(false)} />
      </div>
    </div>,
    document.body,
  )
}

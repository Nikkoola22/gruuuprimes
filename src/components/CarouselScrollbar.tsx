import { useEffect, useRef, useState, RefObject } from 'react'

interface CarouselScrollbarProps {
  carouselRef: RefObject<HTMLDivElement | null>
  color?: 'blue' | 'emerald' | 'indigo'
}

export default function CarouselScrollbar({ carouselRef, color = 'blue' }: CarouselScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [thumbWidth, setThumbWidth] = useState(0)
  const [thumbLeft, setThumbLeft] = useState(0)
  const dragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  const colorMap = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
  }

  const updateThumb = () => {
    const carousel = carouselRef.current
    const track = trackRef.current
    if (!carousel || !track) return

    const { scrollWidth, clientWidth, scrollLeft } = carousel
    if (scrollWidth <= clientWidth) {
      setThumbWidth(0)
      return
    }
    const ratio = clientWidth / scrollWidth
    const tw = Math.max(40, track.clientWidth * ratio)
    const maxScroll = scrollWidth - clientWidth
    const tl = (scrollLeft / maxScroll) * (track.clientWidth - tw)
    setThumbWidth(tw)
    setThumbLeft(tl)
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.addEventListener('scroll', updateThumb, { passive: true })
    const ro = new ResizeObserver(updateThumb)
    ro.observe(carousel)
    updateThumb()

    return () => {
      carousel.removeEventListener('scroll', updateThumb)
      ro.disconnect()
    }
  }, [carouselRef])

  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    dragStartX.current = e.clientX
    dragStartScroll.current = carouselRef.current?.scrollLeft ?? 0

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !carouselRef.current || !trackRef.current) return
      const track = trackRef.current
      const carousel = carouselRef.current
      const dx = ev.clientX - dragStartX.current
      const scrollRatio = (carousel.scrollWidth - carousel.clientWidth) / (track.clientWidth - thumbWidth)
      carousel.scrollLeft = dragStartScroll.current + dx * scrollRatio
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTrackClick = (e: React.MouseEvent) => {
    if (!carouselRef.current || !trackRef.current || !thumbRef.current) return
    const track = trackRef.current
    const carousel = carouselRef.current
    const rect = track.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const center = clickX - thumbWidth / 2
    const maxLeft = track.clientWidth - thumbWidth
    const ratio = Math.max(0, Math.min(1, center / maxLeft))
    carousel.scrollLeft = ratio * (carousel.scrollWidth - carousel.clientWidth)
  }

  if (thumbWidth === 0) return null

  return (
    <div
      ref={trackRef}
      className="w-full h-2 bg-slate-100 rounded-full mt-3 cursor-pointer relative overflow-hidden"
      onClick={onTrackClick}
    >
      <div
        ref={thumbRef}
        className={`absolute top-0 h-full rounded-full cursor-grab active:cursor-grabbing ${colorMap[color]} opacity-60 hover:opacity-90 transition-opacity`}
        style={{ width: thumbWidth, left: thumbLeft }}
        onMouseDown={onThumbMouseDown}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

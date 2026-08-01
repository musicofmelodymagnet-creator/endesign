'use client'

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

type Item = {
  id: string | number
  slug?: string | null
  clientLogo?: number | MediaType | null | undefined
}

const AUTO_SCROLL_PX_PER_FRAME = 0.6
const RESUME_DELAY_MS = 1200

export const LogoMarquee: React.FC<{ items: Item[]; locale: string; hrefBase: string }> = ({
  items,
  locale,
  hrefBase,
}) => {
  const withLogo = items.filter((item) => item.clientLogo && typeof item.clientLogo === 'object')

  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const draggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollRef = useRef(0)
  const movedRef = useRef(false)

  // Doubled so the track can loop seamlessly: once scrollLeft passes the
  // width of one copy, we silently snap back by that same width.
  const doubled = [...withLogo, ...withLogo]

  useEffect(() => {
    const track = trackRef.current
    if (!track || withLogo.length === 0) return

    let frame: number
    const step = () => {
      if (!pausedRef.current && !draggingRef.current) {
        track.scrollLeft += AUTO_SCROLL_PX_PER_FRAME
        const halfWidth = track.scrollWidth / 2
        if (track.scrollLeft >= halfWidth) {
          track.scrollLeft -= halfWidth
        }
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [withLogo.length])

  if (withLogo.length === 0) return null

  const pause = () => {
    pausedRef.current = true
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
  }

  const scheduleResume = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
    }, RESUME_DELAY_MS)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current
    if (!track) return
    pause()
    movedRef.current = false
    // Touch devices already get native swipe-scrolling for free — only
    // simulate drag-to-scroll for mouse/pen, so we don't fight momentum
    // scrolling on touch.
    if (e.pointerType !== 'mouse') return
    draggingRef.current = true
    dragStartXRef.current = e.clientX
    dragStartScrollRef.current = track.scrollLeft
    track.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const track = trackRef.current
    if (!track) return
    const delta = e.clientX - dragStartXRef.current
    if (Math.abs(delta) > 3) movedRef.current = true
    track.scrollLeft = dragStartScrollRef.current - delta
  }

  const endDrag = () => {
    draggingRef.current = false
    scheduleResume()
  }

  return (
    <div
      ref={trackRef}
      className="logo-marquee-track scrollbar-hide flex cursor-grab overflow-x-auto active:cursor-grabbing"
      onPointerEnter={pause}
      onPointerLeave={() => {
        if (!draggingRef.current) scheduleResume()
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {doubled.map((item, i) => (
        <Link
          key={`${item.id}-${i}`}
          href={`/${locale}${hrefBase}/${item.slug}`}
          draggable={false}
          onClick={(e) => {
            if (movedRef.current) e.preventDefault()
          }}
          className="group border-border/60 bg-card mx-2 flex aspect-square w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-colors hover:border-primary sm:w-40"
        >
          <Media
            resource={item.clientLogo as MediaType}
            imgClassName="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      ))}
    </div>
  )
}

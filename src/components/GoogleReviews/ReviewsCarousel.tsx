'use client'

import React, { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'

import type { GoogleReview } from '@/data/googleReviews'

const AUTO_SCROLL_PX_PER_FRAME = 0.5
const RESUME_DELAY_MS = 1200

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="fill-primary text-primary h-4 w-4" strokeWidth={1.5} />
      ))}
    </div>
  )
}

export const ReviewsCarousel: React.FC<{ reviews: GoogleReview[] }> = ({ reviews }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const draggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollRef = useRef(0)
  const movedRef = useRef(false)

  // Doubled so the track can loop seamlessly, same trick as LogoMarquee.
  const doubled = [...reviews, ...reviews]

  useEffect(() => {
    const track = trackRef.current
    if (!track || reviews.length === 0) return

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
  }, [reviews.length])

  if (reviews.length === 0) return null

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
      className="logo-marquee-track scrollbar-hide flex w-full max-w-full cursor-grab items-stretch overflow-x-auto active:cursor-grabbing"
      onPointerEnter={pause}
      onPointerLeave={() => {
        if (!draggingRef.current) scheduleResume()
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {doubled.map((review, i) => (
        <div
          key={`${review.name}-${i}`}
          draggable={false}
          className="border-border/60 bg-card mx-2.5 flex w-[19rem] shrink-0 flex-col rounded-2xl border p-6 transition-colors hover:border-primary sm:w-[21rem]"
        >
          <Stars />
          <p className="text-foreground/90 mt-4 line-clamp-6 flex-1 text-sm leading-relaxed">
            {review.text}
          </p>
          <div className="border-border/60 mt-5 flex items-center gap-3 border-t pt-5">
            <img
              src={review.avatar}
              alt=""
              draggable={false}
              className="ring-border/60 h-10 w-10 shrink-0 rounded-full object-cover ring-1"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="font-display truncate text-sm">{review.name}</p>
              <p className="text-muted-foreground text-xs">{review.relativeTime}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

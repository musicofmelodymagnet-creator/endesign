'use client'

import React, { useEffect, useRef } from 'react'

// Some mobile browsers (notably Chrome on Android under battery saver) don't
// honor the plain `autoplay` attribute reliably even with muted+playsInline,
// which otherwise satisfy the autoplay policy everywhere else. This retries
// playback explicitly on mount as a defensive fallback — if that *also* gets
// rejected (a real policy block, not just a timing quirk), `poster` still
// shows a real frame instead of a blank/dark rectangle.
export function HeroVideo({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    ref.current?.play().catch(() => {
      // Autoplay genuinely blocked by the browser/OS — poster frame stands in.
    })
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  )
}

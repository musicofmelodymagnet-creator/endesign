'use client'

import { Rocket } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`stamp bg-primary text-primary-foreground fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 md:right-8 md:bottom-8 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <Rocket className="h-5 w-5 -rotate-45" />
    </button>
  )
}

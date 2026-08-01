'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import type { Locale } from '@/i18n/config'
import type { ServiceMenuCategory } from '@/utilities/getServicesMenu'

interface HeaderClientProps {
  data: Header
  locale: Locale
  servicesMenu: ServiceMenuCategory[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale, servicesMenu }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="border-border/60 sticky top-0 z-30 border-b transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? 'var(--background)' : 'transparent',
        borderBottomColor: scrolled ? undefined : 'transparent',
      }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container flex items-center justify-between py-5">
        <Link href={`/${locale}`} aria-label="EnDesign">
          <Logo />
        </Link>
        <HeaderNav data={data} locale={locale} servicesMenu={servicesMenu} />
      </div>
    </header>
  )
}

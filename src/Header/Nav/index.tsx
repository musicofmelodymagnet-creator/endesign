'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import type { ServiceMenuCategory } from '@/utilities/getServicesMenu'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

export const HeaderNav: React.FC<{
  data: HeaderType
  locale: Locale
  servicesMenu: ServiceMenuCategory[]
}> = ({ data, locale, servicesMenu }) => {
  const navItems = data?.navItems || []
  const t = getDictionary(locale)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = 'link-underline font-display pb-0.5 text-sm tracking-wide uppercase'

  return (
    <nav className="flex items-center gap-4 md:gap-6">
      <div className="hidden items-center gap-6 md:flex">
        <div
          className="relative"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false)
          }}
        >
          <Link href={`/${locale}/services`} className={`${linkClass} flex items-center gap-1.5`}>
            {t.nav.services}
            <ChevronDown
              className={`h-3.5 w-3.5 opacity-60 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`}
            />
          </Link>

          <div
            className={`fixed inset-x-0 top-[73px] transition-[opacity,visibility] duration-200 ${
              servicesOpen ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
          >
            <div className="border-border/60 bg-background max-h-[calc(100vh-73px)] overflow-y-auto border-b shadow-2xl">
              <div className="container grid grid-cols-2 gap-x-8 gap-y-10 py-10 lg:grid-cols-5">
                {servicesMenu.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/${locale}/services/${cat.slug}`}
                      className="link-underline font-display text-sm tracking-wide uppercase"
                    >
                      {cat.title}
                    </Link>
                    <ul className="mt-5 flex flex-col gap-3">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/${locale}/services/${child.slug}`}
                            className={
                              child.highlight
                                ? 'link-underline text-foreground text-sm font-semibold'
                                : 'link-underline text-muted-foreground text-sm'
                            }
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link href={`/${locale}/portfolio`} className={linkClass}>
          {t.nav.portfolio}
        </Link>
        <Link href={`/${locale}#google-reviews`} className={linkClass}>
          {t.nav.reviews}
        </Link>
        <Link href={`/${locale}/kontakty`} className={linkClass}>
          {t.nav.contacts}
        </Link>

        {navItems.map(({ link }, i) => (
          <CMSLink key={i} {...link} appearance="link" className={linkClass} />
        ))}
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <LanguageSwitcher locale={locale} />
        <ThemeSelector />
      </div>

      <Link
        href={`/${locale}/kontakty`}
        className="stamp bg-primary text-primary-foreground font-display hidden rounded-full px-5 py-2.5 text-sm tracking-wide uppercase sm:inline-flex"
      >
        {t.nav.cta}
      </Link>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="border-border/60 flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="bg-background fixed inset-x-0 top-[73px] bottom-0 z-40 overflow-y-auto md:hidden">
          <div className="container flex flex-col gap-6 py-8">
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((v) => !v)}
                aria-expanded={mobileServicesOpen}
                className="font-display flex w-full items-center justify-between text-2xl"
              >
                {t.nav.services}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="mt-6 flex flex-col gap-7">
                  {servicesMenu.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/${locale}/services/${cat.slug}`}
                        className="link-underline text-primary font-display text-sm tracking-wide uppercase"
                      >
                        {cat.title}
                      </Link>
                      <ul className="border-border/60 mt-3 flex flex-col gap-2.5 border-l pl-4">
                        {cat.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${locale}/services/${child.slug}`}
                              className={child.highlight ? 'text-foreground text-sm font-semibold' : 'text-muted-foreground text-sm'}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href={`/${locale}/portfolio`} className="font-display text-2xl">
              {t.nav.portfolio}
            </Link>
            <Link href={`/${locale}#google-reviews`} className="font-display text-2xl">
              {t.nav.reviews}
            </Link>
            <Link href={`/${locale}/kontakty`} className="font-display text-2xl">
              {t.nav.contacts}
            </Link>

            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="link" className="font-display text-2xl" />
            ))}

            <Link
              href={`/${locale}/kontakty`}
              className="stamp bg-primary text-primary-foreground font-display mt-2 inline-flex w-fit rounded-full px-6 py-3 text-sm tracking-wide uppercase"
            >
              {t.nav.cta}
            </Link>

            <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-6">
              <LanguageSwitcher locale={locale} />
              <ThemeSelector />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

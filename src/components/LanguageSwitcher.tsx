'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { locales, type Locale } from '@/i18n/config'

const LABELS: Record<Locale, string> = { uk: 'УКР', ru: 'РУС', en: 'ENG' }

function pathWithLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split('/')
  // segments[0] is '' (leading slash), segments[1] is the current locale
  segments[1] = locale
  return segments.join('/') || '/'
}

export const LanguageSwitcher: React.FC<{ locale: Locale }> = ({ locale }) => {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="opacity-30">/</span>}
          <Link
            href={pathWithLocale(pathname, l)}
            className={
              l === locale
                ? 'font-display text-primary'
                : 'font-display link-underline opacity-60 hover:opacity-100'
            }
          >
            {LABELS[l]}
          </Link>
        </React.Fragment>
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'

// `not-found.tsx` receives no props in the Next.js App Router (even nested
// under `[locale]`), so the locale has to be read from the URL client-side.
export default function NotFound() {
  const pathname = usePathname()
  const segment = pathname.split('/')[1] || ''
  const locale = isLocale(segment) ? segment : 'uk'
  const t = getDictionary(locale).notFound

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>{t.title}</h1>
        <p className="mb-4">{t.message}</p>
      </div>
      <Button asChild variant="default">
        <Link href={`/${locale}`}>{t.homeLink}</Link>
      </Button>
    </div>
  )
}

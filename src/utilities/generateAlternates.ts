import type { Metadata } from 'next'

import { locales, defaultLocale, type Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'

// Builds hreflang alternates for a route shared across all locales (same slug,
// different locale prefix — this project's `slug` fields aren't localized).
// Self-referencing `canonical` plus `x-default` pointing at the default
// locale are both standard practice for multi-locale hreflang setups.
export function generateAlternates(locale: Locale, pathWithoutLocale: string): Metadata['alternates'] {
  const serverUrl = getServerSideURL()
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${serverUrl}/${l}${pathWithoutLocale}`]),
  ) as Record<Locale, string>

  return {
    canonical: languages[locale],
    languages: { ...languages, 'x-default': languages[defaultLocale] },
  }
}

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import { isLocale } from '@/i18n/config'
import { buildOgImageElement, OG_IMAGE_SIZE } from '@/utilities/ogImageElement'

export const runtime = 'edge'

// Stable, directly-linkable fallback OG image for routes that have no
// opengraph-image.tsx of their own (everything below the locale root) and no
// real photo of their own (see mergeOpenGraph's default `images`). Lives
// outside (frontend)/[locale] on purpose — colocating it there would collide
// with the [locale]/[slug] catch-all route for the literal string "og-image".
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale')
  const locale = localeParam && isLocale(localeParam) ? localeParam : 'uk'

  return new ImageResponse(buildOgImageElement(locale), { ...OG_IMAGE_SIZE })
}

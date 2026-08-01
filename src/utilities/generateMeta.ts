import type { Metadata } from 'next'

import type { CaseStudy, Media, Page, Post, Config } from '../payload-types'
import type { Locale } from '@/i18n/config'

import { mergeOpenGraph } from './mergeOpenGraph'
import { generateAlternates } from './generateAlternates'
import { getServerSideURL } from './getURL'

// Returns null when there's no real doc image, so callers fall back to the
// branded default via mergeOpenGraph's `/og-image` route instead of a stock photo.
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (!image || typeof image !== 'object' || !('url' in image)) return null

  const serverUrl = getServerSideURL()
  const ogUrl = image.sizes?.og?.url

  return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<CaseStudy> | null
  /** Locale-less path, e.g. `/services/dyzain-lohotypu` — used to build both the
   * current locale's og:url and the hreflang alternates for every locale. */
  path: string
  locale: Locale
}): Promise<Metadata> => {
  const { doc, path, locale } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const rawTitle = doc?.meta?.title || doc?.title
  const title = rawTitle ? (rawTitle.includes('EnDesign') ? rawTitle : `${rawTitle} | EnDesign`) : 'EnDesign'

  return {
    description: doc?.meta?.description,
    alternates: generateAlternates(locale, path),
    openGraph: mergeOpenGraph(
      {
        description: doc?.meta?.description || '',
        images: ogImage
          ? [
              {
                url: ogImage,
              },
            ]
          : undefined,
        title,
        url: `${getServerSideURL()}/${locale}${path}`,
      },
      locale,
    ),
    title,
  }
}

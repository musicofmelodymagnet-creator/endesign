import type { Metadata } from 'next'

import type { Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'
import { OG_IMAGE_SIZE } from './ogImageElement'

const DEFAULT_OG_COPY: Record<Locale, { title: string; description: string }> = {
  uk: {
    title: 'EnDesign — студія графічного дизайну, сайтів та 3D у Києві',
    description:
      'Графічний дизайн, розробка сайтів та 3D-візуалізація. Студія EnDesign у Києві перетворює бізнес на впізнаваний бренд.',
  },
  ru: {
    title: 'EnDesign — студия графического дизайна, сайтов и 3D в Киеве',
    description:
      'Графический дизайн, разработка сайтов и 3D-визуализация. Студия EnDesign в Киеве превращает бизнес в узнаваемый бренд.',
  },
  en: {
    title: 'EnDesign — graphic design, web & 3D studio in Kyiv',
    description:
      'Graphic design, web development and 3D visualization. EnDesign in Kyiv turns your business into a recognisable brand.',
  },
}

// The homepage gets its OG image for free from the `[locale]/opengraph-image.tsx`
// file convention (Next auto-injects it there). It does NOT cascade to deeper
// routes (services, portfolio, detail pages), so any of those without a real
// photo of their own need an explicit fallback — this hits the same branded
// image via a stable, directly-linkable route (`/og-image`, see that route's
// comment for why it lives outside (frontend)/[locale]).
export const mergeOpenGraph = (
  og?: Metadata['openGraph'],
  locale: Locale = 'uk',
): Metadata['openGraph'] => {
  const defaultOpenGraph: Metadata['openGraph'] = {
    type: 'website',
    siteName: 'EnDesign',
    ...(DEFAULT_OG_COPY[locale] || DEFAULT_OG_COPY.uk),
  }

  const merged = {
    ...defaultOpenGraph,
    ...og,
  }

  if (!merged.images) {
    merged.images = [
      {
        url: `${getServerSideURL()}/og-image?locale=${locale}`,
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        alt: merged.title as string,
      },
    ]
  }

  return merged
}

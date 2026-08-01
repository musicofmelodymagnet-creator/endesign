import type { Metadata } from 'next'

import type { Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'
import { OG_IMAGE_SIZE } from './ogImageElement'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Графічний дизайн, розробка сайтів та 3D-візуалізація. Студія EnDesign у Києві перетворює бізнес на впізнаваний бренд.',
  siteName: 'EnDesign',
  title: 'EnDesign — студія графічного дизайну, сайтів та 3D у Києві',
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

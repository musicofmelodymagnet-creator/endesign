import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

// force-dynamic so this resolves NEXT_PUBLIC_SERVER_URL from the runtime
// container's env (.env.production) instead of getting baked in at
// `docker build` time, when that env var isn't set yet (see sitemap.ts).
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const serverUrl = getServerSideURL()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${serverUrl}/sitemap.xml`,
  }
}

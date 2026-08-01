import type { MetadataRoute } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { locales } from '@/i18n/config'
import { getServerSideURL } from '@/utilities/getURL'

// Lives at the app root (not under (frontend)/[locale]) so Next serves it at
// the bare `/sitemap.xml` — matches how `/og-image` and `/robots.txt` are set
// up to avoid the [locale]/[slug] catch-all collision.
//
// force-dynamic for two reasons: (1) this route has no dynamic segment of its
// own, so Next would otherwise eagerly prerender it at `docker build` time —
// before the Postgres container is reachable, same trap as generateStaticParams
// elsewhere in this app; (2) NEXT_PUBLIC_SERVER_URL is only present in the
// runtime container's env (.env.production), not the build stage, so a
// build-time render would permanently bake in the localhost fallback.
export const dynamic = 'force-dynamic'

type StaticEntry = { path: string; priority: number }

const STATIC_ENTRIES: StaticEntry[] = [
  { path: '', priority: 1 },
  { path: '/services', priority: 0.9 },
  { path: '/portfolio', priority: 0.9 },
]

function withLocales(serverUrl: string, path: string, priority: number, lastModified?: Date) {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${serverUrl}/${l}${path}`]),
  ) as Record<string, string>

  return locales.map((locale) => ({
    url: `${serverUrl}/${locale}${path}`,
    lastModified: lastModified || new Date(),
    priority,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serverUrl = getServerSideURL()
  const payload = await getPayload({ config: configPromise })

  const [pages, services, caseStudies] = await Promise.all([
    payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'services',
      overrideAccess: false,
      draft: false,
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'case-studies',
      overrideAccess: false,
      draft: false,
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority } of STATIC_ENTRIES) {
    entries.push(...withLocales(serverUrl, path, priority))
  }

  for (const page of pages.docs) {
    entries.push(...withLocales(serverUrl, `/${page.slug}`, 0.6, new Date(page.updatedAt)))
  }

  for (const service of services.docs) {
    entries.push(
      ...withLocales(serverUrl, `/services/${service.slug}`, 0.8, new Date(service.updatedAt)),
    )
  }

  for (const caseStudy of caseStudies.docs) {
    entries.push(
      ...withLocales(serverUrl, `/portfolio/${caseStudy.slug}`, 0.7, new Date(caseStudy.updatedAt)),
    )
  }

  return entries
}

import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(
  slug: T,
  depth = 0,
  locale?: string,
): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locale: locale as any,
  })

  return global
}

// Was previously wrapped in unstable_cache, keyed by [slug, locale]. In
// production that produced a real bug: this data cache and the page-level
// `revalidate` ISR cache (set on every page that calls this) are two
// independent caching layers that can fall out of sync, and once one
// locale's entry got a bad read (observed after an out-of-process DB write —
// a migration script run with `disableRevalidate: true`, which by design
// skips the revalidateTag() calls this cache depends on to self-heal), it
// kept serving that same wrong value indefinitely — a full container restart
// was the only way to clear it. Globals change rarely and this call is cheap
// enough to just run directly; the page-level `revalidate` already provides
// the caching benefit that mattered.
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale?: string) => {
  return () => getGlobal<T>(slug, depth, locale)
}

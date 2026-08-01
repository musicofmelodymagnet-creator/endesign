import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating site settings`)

    try {
      revalidateTag('global_site-settings', 'max')
    } catch {
      // no-op outside of a Next.js request context (e.g. standalone scripts)
    }
  }

  return doc
}

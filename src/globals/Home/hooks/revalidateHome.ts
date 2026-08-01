import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHome: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating home page`)

    try {
      revalidateTag('global_home', 'max')
    } catch {
      // no-op outside of a Next.js request context (e.g. standalone scripts)
    }
  }

  return doc
}

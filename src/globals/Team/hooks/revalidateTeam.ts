import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateTeam: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating team`)

    try {
      revalidateTag('global_team', 'max')
    } catch {
      // no-op outside of a Next.js request context (e.g. standalone scripts)
    }
  }

  return doc
}

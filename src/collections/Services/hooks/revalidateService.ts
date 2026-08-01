import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Service } from '../../../payload-types'

export const revalidateService: CollectionAfterChangeHook<Service> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/${doc.slug}`

      payload.logger.info(`Revalidating service at path: ${path}`)

      revalidatePath(path)
      revalidateTag('services-sitemap', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old service at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('services-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateServiceDelete: CollectionAfterDeleteHook<Service> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/${doc?.slug}`
    revalidatePath(path)
    revalidateTag('services-sitemap', 'max')
  }

  return doc
}

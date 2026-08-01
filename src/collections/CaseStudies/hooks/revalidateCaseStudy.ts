import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { CaseStudy } from '../../../payload-types'

export const revalidateCaseStudy: CollectionAfterChangeHook<CaseStudy> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/nashi-kliienty/${doc.slug}`

      payload.logger.info(`Revalidating case study at path: ${path}`)

      revalidatePath(path)
      revalidateTag('case-studies-sitemap', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      revalidatePath(`/nashi-kliienty/${previousDoc.slug}`)
      revalidateTag('case-studies-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateCaseStudyDelete: CollectionAfterDeleteHook<CaseStudy> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/nashi-kliienty/${doc?.slug}`)
    revalidateTag('case-studies-sitemap', 'max')
  }

  return doc
}

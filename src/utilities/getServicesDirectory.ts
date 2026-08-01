import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/config'
import type { Service } from '@/payload-types'

export type DirectoryLeaf = {
  id: number
  title: string
  slug: string
  highlight: boolean
  imageUrl: string | null
}

export type DirectorySubgroup = {
  id: number
  title: string
  slug: string
  items: DirectoryLeaf[]
}

export type DirectoryGroup = {
  id: number
  title: string
  slug: string
  items: DirectoryLeaf[]
  subgroups: DirectorySubgroup[]
}

function toLeaf(doc: Service): DirectoryLeaf {
  const media = doc.hero?.media
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug || '',
    highlight: Boolean(doc.menuHighlight),
    imageUrl: media && typeof media === 'object' ? media.url || null : null,
  }
}

export async function getServicesDirectory(locale: Locale): Promise<DirectoryGroup[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
    limit: 300,
    depth: 1,
    locale,
    sort: 'menuOrder',
    overrideAccess: false,
  })

  const docs = result.docs as Service[]
  const parentId = (doc: Service) => (typeof doc.parent === 'object' ? doc.parent?.id : doc.parent)
  const childrenOf = (id: number) => docs.filter((d) => parentId(d) === id)

  const topCategories = docs.filter((d) => d.serviceType === 'category' && !d.parent)

  return topCategories.map((cat) => {
    const children = childrenOf(cat.id)

    return {
      id: cat.id,
      title: cat.title,
      slug: cat.slug || '',
      items: children.filter((c) => c.serviceType === 'service').map(toLeaf),
      subgroups: children
        .filter((c) => c.serviceType === 'category')
        .map((sub) => ({
          id: sub.id,
          title: sub.title,
          slug: sub.slug || '',
          items: childrenOf(sub.id).map(toLeaf),
        })),
    }
  })
}

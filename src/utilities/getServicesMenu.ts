import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/config'
import type { Service } from '@/payload-types'

export type ServiceMenuChild = {
  id: number
  title: string
  slug: string
  highlight: boolean
}

export type ServiceMenuCategory = {
  id: number
  title: string
  slug: string
  children: ServiceMenuChild[]
}

export async function getServicesMenu(locale: Locale): Promise<ServiceMenuCategory[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
    limit: 300,
    depth: 0,
    locale,
    sort: 'menuOrder',
    overrideAccess: false,
  })

  const docs = result.docs as Service[]
  const topCategories = docs.filter((d) => d.serviceType === 'category' && !d.parent)

  return topCategories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug || '',
    children: docs
      .filter((d) => (typeof d.parent === 'object' ? d.parent?.id : d.parent) === cat.id)
      .map((child) => ({
        id: child.id,
        title: child.title,
        slug: child.slug || '',
        highlight: Boolean(child.menuHighlight),
      })),
  }))
}

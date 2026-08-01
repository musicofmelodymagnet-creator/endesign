import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { GalleryBlock } from '../../blocks/Gallery/config'
import { IconListBlock } from '../../blocks/IconList/config'
import { TextImageBlock } from '../../blocks/TextImage/config'
import { PriceListBlock } from '../../blocks/PriceList/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateService, revalidateServiceDelete } from './hooks/revalidateService'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Services: CollectionConfig<'services'> = {
  slug: 'services',
  labels: {
    singular: 'Service / Category',
    plural: 'Services / Categories',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'serviceType', 'parent', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'services',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'services',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      defaultValue: 'service',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Category (top-level)', value: 'category' },
        { label: 'Service (nested)', value: 'service' },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'services',
      hasMany: false,
      admin: {
        position: 'sidebar',
        condition: (_data, siblingData) => siblingData?.serviceType === 'service',
      },
    },
    {
      name: 'price',
      type: 'text',
      localized: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'menuOrder',
      type: 'number',
      defaultValue: 999,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers show first in listings (matches the priority order from the legacy site menu).',
      },
    },
    {
      name: 'menuHighlight',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show this item as a bold, prioritized entry in the header "Послуги" dropdown menu.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                Content,
                MediaBlock,
                GalleryBlock,
                IconListBlock,
                TextImageBlock,
                PriceListBlock,
                CallToAction,
              ],
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateService],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateServiceDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

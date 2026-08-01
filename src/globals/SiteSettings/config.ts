import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'contactPhones',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'carrier',
          type: 'select',
          admin: {
            description: 'Shows the carrier logo next to this number (Ukrainian mobile operators).',
          },
          options: [
            { label: 'Lifecell', value: 'lifecell' },
            { label: 'Kyivstar', value: 'kyivstar' },
            { label: 'Vodafone', value: 'vodafone' },
            { label: 'None', value: 'none' },
          ],
        },
      ],
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
      admin: {
        description: 'Physical office address shown in the footer and contact page.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'telegram',
          type: 'text',
        },
        {
          name: 'viber',
          type: 'text',
        },
        {
          name: 'whatsapp',
          type: 'text',
        },
      ],
    },
    {
      name: 'homeHeroVideo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'homeSvgIcon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'defaultSeo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}

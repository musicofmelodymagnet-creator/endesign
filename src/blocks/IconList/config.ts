import type { Block } from 'payload'

export const IconListBlock: Block = {
  slug: 'iconList',
  interfaceName: 'IconListBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}

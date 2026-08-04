import type { Block } from 'payload'

export const IconListBlock: Block = {
  slug: 'iconList',
  interfaceName: 'IconListBlock',
  fields: [
    {
      name: 'kicker',
      type: 'text',
      localized: true,
      admin: {
        description: 'Small stamp-style label shown above the title (optional).',
      },
    },
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

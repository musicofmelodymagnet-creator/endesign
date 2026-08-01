import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateTeam } from './hooks/revalidateTeam'

export const Team: GlobalConfig = {
  slug: 'team',
  label: 'Team',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'members',
      type: 'array',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateTeam],
  },
}

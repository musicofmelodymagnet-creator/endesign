import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Контакти, відео на головній та SEO за замовчуванням — використовується по всьому сайту.',
  },
  fields: [
    {
      name: 'contactPhones',
      type: 'array',
      label: 'Телефони',
      maxRows: 3,
      admin: {
        description: 'Показуються в шапці, футері та на сторінці контактів.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Підпис (напр. "Відділ продажів")',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Номер телефону',
          required: true,
        },
        {
          name: 'carrier',
          type: 'select',
          label: 'Оператор',
          admin: {
            description: 'Показує логотип оператора біля цього номера.',
          },
          options: [
            { label: 'Lifecell', value: 'lifecell' },
            { label: 'Kyivstar', value: 'kyivstar' },
            { label: 'Vodafone', value: 'vodafone' },
            { label: 'Не показувати', value: 'none' },
          ],
        },
      ],
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
      label: 'Адреса офісу',
      admin: {
        description: 'Показується у футері та на сторінці контактів.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'telegram',
          type: 'text',
          label: 'Telegram',
        },
        {
          name: 'viber',
          type: 'text',
          label: 'Viber',
        },
        {
          name: 'whatsapp',
          type: 'text',
          label: 'WhatsApp',
        },
      ],
    },
    {
      name: 'homeHeroVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Відео на головній (хіро)',
      admin: {
        description:
          'Фонове відео у верхньому блоці головної сторінки. Якщо не завантажено — показується звичайний фон без відео.',
      },
    },
    {
      name: 'homeSvgIcon',
      type: 'upload',
      relationTo: 'media',
      label: 'SVG-іконка на головній',
    },
    {
      name: 'defaultSeo',
      type: 'group',
      label: 'SEO за замовчуванням',
      admin: {
        description:
          'Використовується, якщо на конкретній сторінці не задано власний SEO-заголовок/опис/картинку.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: 'Заголовок (title)',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Опис (description)',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Картинка для соцмереж (OG-зображення)',
        },
      ],
    },
    {
      name: 'pageSeo',
      type: 'group',
      label: 'SEO окремих сторінок',
      admin: {
        description:
          'SEO-заголовок і опис для сторінок, що не є окремими документами колекцій (головна, перелік послуг, портфоліо).',
      },
      fields: [
        {
          name: 'home',
          type: 'group',
          label: 'Головна сторінка',
          fields: [
            { name: 'title', type: 'text', localized: true, label: 'Заголовок (title)' },
            { name: 'description', type: 'textarea', localized: true, label: 'Опис (description)' },
          ],
        },
        {
          name: 'servicesList',
          type: 'group',
          label: 'Перелік послуг',
          fields: [
            { name: 'title', type: 'text', localized: true, label: 'Заголовок (title)' },
            { name: 'description', type: 'textarea', localized: true, label: 'Опис (description)' },
          ],
        },
        {
          name: 'portfolioList',
          type: 'group',
          label: 'Портфоліо',
          fields: [
            { name: 'title', type: 'text', localized: true, label: 'Заголовок (title)' },
            { name: 'description', type: 'textarea', localized: true, label: 'Опис (description)' },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}

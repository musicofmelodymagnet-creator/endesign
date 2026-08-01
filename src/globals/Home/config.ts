import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateHome } from './hooks/revalidateHome'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Головна сторінка',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Всі тексти головної сторінки сайту (endesign.com.ua).',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Хіро',
          fields: [
            {
              name: 'badge',
              type: 'text',
              localized: true,
              label: 'Бейдж над заголовком',
            },
            {
              name: 'headline',
              type: 'text',
              localized: true,
              label: 'Заголовок',
              admin: {
                description:
                  'Виділіть слово подвійними зірочками, щоб воно було жовтим — наприклад: Дизайн, що продає **гучніше** за слова.',
              },
            },
            {
              name: 'subhead',
              type: 'textarea',
              localized: true,
              label: 'Підзаголовок',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ctaDiscussLabel',
                  type: 'text',
                  localized: true,
                  label: 'Текст кнопки "Обговорити проєкт"',
                  admin: { width: '50%' },
                },
                {
                  name: 'ctaViewWorkLabel',
                  type: 'text',
                  localized: true,
                  label: 'Текст посилання "Дивитись роботи"',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'marquee',
              type: 'array',
              localized: true,
              label: 'Бігучий рядок (слова, що рухаються під хіро)',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Напрямки',
          fields: [
            {
              name: 'pillarsTitle',
              type: 'text',
              localized: true,
              label: 'Заголовок блоку "Три напрямки"',
            },
            {
              name: 'pillarsSubtitle',
              type: 'text',
              localized: true,
              label: 'Підзаголовок блоку',
            },
            {
              name: 'detailsLinkLabel',
              type: 'text',
              localized: true,
              label: 'Текст посилання на картках ("Детальніше →")',
            },
            {
              name: 'pillars',
              type: 'array',
              localized: true,
              label: 'Картки напрямків',
              maxRows: 3,
              admin: {
                description: 'Зазвичай тут 3 картки: Графічний дизайн, Розробка сайтів, 3D-візуалізація.',
              },
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  label: 'Номер (01, 02, 03)',
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Назва',
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Опис',
                },
                {
                  name: 'linkedService',
                  type: 'relationship',
                  relationTo: 'services',
                  label: 'Куди веде картка (послуга)',
                },
              ],
            },
          ],
        },
        {
          label: 'Послуги',
          fields: [
            {
              name: 'servicesSectionTitle',
              type: 'text',
              localized: true,
              label: 'Заголовок блоку "Усі послуги"',
            },
            {
              name: 'viewAllServicesLabel',
              type: 'text',
              localized: true,
              label: 'Текст посилання "Повний перелік →"',
            },
          ],
        },
        {
          label: 'Портфоліо',
          fields: [
            {
              name: 'portfolioSectionTitle',
              type: 'text',
              localized: true,
              label: 'Заголовок блоку "Нам довіряють"',
            },
            {
              name: 'viewAllProjectsLabel',
              type: 'text',
              localized: true,
              label: 'Текст посилання "Усі проєкти →"',
            },
          ],
        },
        {
          label: 'CTA-банер',
          fields: [
            {
              name: 'ctaBannerTitle',
              type: 'textarea',
              localized: true,
              label: 'Заголовок нижнього банера',
            },
            {
              name: 'ctaBannerButtonLabel',
              type: 'text',
              localized: true,
              label: 'Текст кнопки банера',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHome],
  },
}

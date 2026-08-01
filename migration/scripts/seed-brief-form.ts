import { getPayload } from 'payload'
import config from '../../src/payload.config'

type Copy = {
  title: string
  name: string
  phone: string
  email: string
  messengerLabel: string
  messengerOptions: string[]
  websiteLabel: string
  purposeLabel: string
  purposeOptions: string[]
  wishesLabel: string
  examplesLabel: string
  submitLabel: string
  confirmation: string
}

const COPY: Record<'uk' | 'ru' | 'en', Copy> = {
  uk: {
    title: 'brief-uk',
    name: "Ім'я",
    phone: 'Телефон',
    email: 'Email',
    messengerLabel: 'Яким месенджером вам зручніше користуватися?',
    messengerOptions: ['Viber', 'Telegram', 'WhatsApp', 'Інший'],
    websiteLabel: 'Посилання на ваш сайт (якщо є)',
    purposeLabel: 'Де використовуватиметься макет?',
    purposeOptions: ['Друкована продукція', 'Соціальні мережі', 'На сайті', 'Інше'],
    wishesLabel: "Опишіть побажання до макету та кілька слів про вашу сферу діяльності",
    examplesLabel: 'Посилання на приклади робіт, які вам подобаються',
    submitLabel: 'Надіслати',
    confirmation: 'Дякуємо! Ми зв’яжемося з вами найближчим часом.',
  },
  ru: {
    title: 'brief-ru',
    name: 'Имя',
    phone: 'Телефон',
    email: 'Email',
    messengerLabel: 'Каким мессенджером вам удобнее пользоваться?',
    messengerOptions: ['Viber', 'Telegram', 'WhatsApp', 'Другой'],
    websiteLabel: 'Ссылка на ваш сайт (если есть)',
    purposeLabel: 'Где будет использоваться макет?',
    purposeOptions: ['Печатная продукция', 'Социальные сети', 'На сайте', 'Другое'],
    wishesLabel: 'Опишите пожелания к макету и пару слов о вашей сфере деятельности',
    examplesLabel: 'Ссылки на примеры работ, которые вам нравятся',
    submitLabel: 'Отправить',
    confirmation: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
  },
  en: {
    title: 'brief-en',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    messengerLabel: 'Which messenger is easiest for you?',
    messengerOptions: ['Viber', 'Telegram', 'WhatsApp', 'Other'],
    websiteLabel: 'Link to your website (if any)',
    purposeLabel: 'Where will the design be used?',
    purposeOptions: ['Print materials', 'Social media', 'On a website', 'Other'],
    wishesLabel: 'Describe what you need and a few words about your business',
    examplesLabel: 'Links to examples you like',
    submitLabel: 'Send',
    confirmation: "Thank you! We'll get back to you shortly.",
  },
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            { type: 'text', format: 0, detail: 0, mode: 'normal', style: '', text, version: 1 },
          ],
        },
      ],
    },
  }
}

async function run() {
  const payload = await getPayload({ config })

  for (const locale of ['uk', 'ru', 'en'] as const) {
    const c = COPY[locale]

    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: c.title } },
      limit: 1,
    })
    if (existing.docs[0]) {
      console.log(`already exists: ${c.title} (#${existing.docs[0].id}) — skipping`)
      continue
    }

    const doc = await payload.create({
      collection: 'forms',
      data: {
        title: c.title,
        submitButtonLabel: c.submitLabel,
        confirmationType: 'message',
        confirmationMessage: richText(c.confirmation),
        fields: [
          { blockType: 'text', name: 'name', label: c.name, required: true, width: 100 },
          { blockType: 'text', name: 'phone', label: c.phone, required: true, width: 100 },
          { blockType: 'email', name: 'email', label: c.email, required: true, width: 100 },
          {
            blockType: 'select',
            name: 'messenger',
            label: c.messengerLabel,
            required: false,
            width: 100,
            options: c.messengerOptions.map((o) => ({ label: o, value: o })),
          },
          { blockType: 'text', name: 'website', label: c.websiteLabel, required: false, width: 100 },
          {
            blockType: 'select',
            name: 'purpose',
            label: c.purposeLabel,
            required: false,
            width: 100,
            options: c.purposeOptions.map((o) => ({ label: o, value: o })),
          },
          {
            blockType: 'textarea',
            name: 'wishes',
            label: c.wishesLabel,
            required: false,
            width: 100,
          },
          {
            blockType: 'text',
            name: 'examples',
            label: c.examplesLabel,
            required: false,
            width: 100,
          },
        ],
      } as never,
    })
    console.log(`created: ${c.title} -> #${doc.id}`)
  }

  console.log('Done.')
  process.exit(0)
}
try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

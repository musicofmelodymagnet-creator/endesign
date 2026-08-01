import { getPayload } from 'payload'
import config from '../../src/payload.config'

// Priority order taken directly from the legacy site's navigation menu
// (top = highest priority). Matched by exact `title` within each parent category.
const CATEGORY_ORDER: { category: string; children: string[] }[] = [
  {
    category: 'uslugi-graficheskogo-dizajnera',
    children: [
      'Професійний дизайн логотипу',
      'Розробка фірмового стилю',
      'Професійний веб дизайн',
      'Професійне оформлення соціальних мереж',
      'Професійний дизайн зовнішньої реклами',
      'Дизайн поліграфії',
      'Дизайн презентацій',
      'Макети каталогів',
      'Меню для кафе та ресторанів',
      'Дизайн упаковки',
      'Дизайн наліпок на авто',
      'Художні ілюстрації',
      'Графічні зображення штучного інтелекту',
      'Розробка векторних макетів',
      'Фото ретуш та монтаж',
    ],
  },
  {
    category: 'rozrobka-saitiv',
    children: [
      'Сайт візитка',
      'Корпоративний сайт',
      'Сайт каталог',
      'Лендінг пейдж',
      'Інтернет магазин',
      'Обслуговування сайту',
    ],
  },
  {
    category: '3d-vyzualyzatsyia-y-modelyrovanye',
    children: [
      "3D візуалізація МАФів",
      '3D проектування торгових площ',
      "3D моделювання об'єктів",
      '3D візуалізація архітектури',
      "3D дизайн інтер'єру",
      'Проектування меблів',
    ],
  },
]

const TOP_LEVEL_ORDER = [
  'uslugi-graficheskogo-dizajnera',
  'rozrobka-saitiv',
  '3d-vyzualyzatsyia-y-modelyrovanye',
]

async function run() {
  const payload = await getPayload({ config })

  const all = await payload.find({ collection: 'services', limit: 1000, depth: 0, locale: 'uk' })
  const bySlug = new Map(all.docs.map((d) => [d.slug, d]))

  for (const [i, slug] of TOP_LEVEL_ORDER.entries()) {
    const doc = bySlug.get(slug)
    if (!doc) {
      console.warn(`! top-level category not found: ${slug}`)
      continue
    }
    await payload.update({
      collection: 'services',
      id: doc.id,
      context: { disableRevalidate: true },
      data: { menuOrder: i + 1 } as never,
    })
    console.log(`✓ top-level [${i + 1}] ${slug}`)
  }

  for (const group of CATEGORY_ORDER) {
    const parentDoc = bySlug.get(group.category)
    if (!parentDoc) {
      console.warn(`! category not found: ${group.category}`)
      continue
    }
    const children = all.docs.filter((d) => {
      const parent = (d as any).parent
      const parentId = typeof parent === 'object' ? parent?.id : parent
      return parentId === parentDoc.id
    })

    for (const [i, title] of group.children.entries()) {
      const match = children.find((c) => c.title === title)
      if (!match) {
        console.warn(`! child not found under ${group.category}: "${title}"`)
        continue
      }
      await payload.update({
        collection: 'services',
        id: match.id,
        context: { disableRevalidate: true },
        data: { menuOrder: i + 1 } as never,
      })
      console.log(`  ✓ [${i + 1}] ${title}`)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { lexicalToHtml } from '../lib/lexicalToHtml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function extractBlock(block: any) {
  const base = { blockType: block.blockType }
  if (block.blockType === 'textImage') {
    return {
      ...base,
      title: block.title || '',
      richText: block.richText ? lexicalToHtml(block.richText) : '',
    }
  }
  if (block.blockType === 'iconList') {
    return {
      ...base,
      title: block.title || '',
      subtitle: block.subtitle || '',
      items: (block.items || []).map((i: any) => ({ title: i.title || '', text: i.text || '' })),
    }
  }
  if (block.blockType === 'gallery') {
    return {
      ...base,
      title: block.title || '',
      images: (block.images || []).map((i: any) => ({ caption: i.caption || '' })),
    }
  }
  if (block.blockType === 'priceList') {
    return {
      ...base,
      title: block.title || '',
      items: (block.items || []).map((i: any) => ({ name: i.name || '', description: i.description || '' })),
    }
  }
  if (block.blockType === 'content') {
    return {
      ...base,
      columns: (block.columns || []).map((c: any) => ({
        richText: c.richText ? lexicalToHtml(c.richText) : '',
      })),
    }
  }
  return { ...base, skipped: true }
}

async function run() {
  const payload = await getPayload({ config })

  const [pages, services, caseStudies] = await Promise.all([
    payload.find({ collection: 'pages', limit: 1000, depth: 0, locale: 'uk' }),
    payload.find({ collection: 'services', limit: 1000, depth: 0, locale: 'uk' }),
    payload.find({ collection: 'case-studies', limit: 1000, depth: 0, locale: 'uk' }),
  ])

  const extract = (collection: string) => (doc: any) => ({
    collection,
    id: doc.id,
    title: doc.title || '',
    hero: doc.hero
      ? {
          type: doc.hero.type,
          richText: doc.hero.richText ? lexicalToHtml(doc.hero.richText) : '',
        }
      : undefined,
    layout: (doc.layout || []).map(extractBlock),
    meta: {
      title: doc.meta?.title || '',
      description: doc.meta?.description || '',
    },
  })

  const all = [
    ...pages.docs.map(extract('pages')),
    ...services.docs.map(extract('services')),
    ...caseStudies.docs.map(extract('case-studies')),
  ]

  const outDir = path.resolve(__dirname, '../translations')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'uk-source.json'), JSON.stringify(all, null, 2))

  console.log(`Extracted ${all.length} documents to migration/translations/uk-source.json`)

  // Split into batches for parallel translation (roughly by size)
  const BATCH_SIZE = 8
  const batches: any[][] = []
  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    batches.push(all.slice(i, i + BATCH_SIZE))
  }
  batches.forEach((batch, i) => {
    fs.writeFileSync(path.join(outDir, `batch-${i}.json`), JSON.stringify(batch, null, 2))
  })
  console.log(`Wrote ${batches.length} batches of up to ${BATCH_SIZE} docs each.`)

  process.exit(0)
}

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

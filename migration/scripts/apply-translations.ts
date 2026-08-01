import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { htmlToLexical } from '../lib/htmlToLexical'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TRANSLATIONS_DIR = path.resolve(__dirname, '../translations')

type TranslatedBlock = Record<string, any>

function rebuildBlock(original: any, translated: TranslatedBlock) {
  if (translated.blockType === 'textImage') {
    return {
      ...original,
      title: translated.title || undefined,
      richText: translated.richText ? htmlToLexical(translated.richText) : original.richText,
    }
  }
  if (translated.blockType === 'iconList') {
    return {
      ...original,
      title: translated.title || undefined,
      subtitle: translated.subtitle || undefined,
      items: (original.items || []).map((item: any, i: number) => ({
        ...item,
        title: translated.items?.[i]?.title || item.title,
        text: translated.items?.[i]?.text || item.text,
      })),
    }
  }
  if (translated.blockType === 'gallery') {
    return {
      ...original,
      title: translated.title || undefined,
      images: (original.images || []).map((img: any, i: number) => ({
        ...img,
        caption: translated.images?.[i]?.caption || img.caption,
      })),
    }
  }
  if (translated.blockType === 'priceList') {
    return {
      ...original,
      title: translated.title || undefined,
      items: (original.items || []).map((item: any, i: number) => ({
        ...item,
        name: translated.items?.[i]?.name || item.name,
        description: translated.items?.[i]?.description || item.description,
      })),
    }
  }
  if (translated.blockType === 'content') {
    return {
      ...original,
      columns: (original.columns || []).map((col: any, i: number) => ({
        ...col,
        richText: translated.columns?.[i]?.richText
          ? htmlToLexical(translated.columns[i].richText)
          : col.richText,
      })),
    }
  }
  return original
}

async function run() {
  const payload = await getPayload({ config })

  const batchFiles = fs
    .readdirSync(TRANSLATIONS_DIR)
    .filter((f) => /^batch-\d+-en\.json$/.test(f))
    .sort()

  console.log(`Found ${batchFiles.length} translated batch files`)

  let updated = 0
  let failed = 0

  for (const file of batchFiles) {
    const translatedDocs = JSON.parse(fs.readFileSync(path.join(TRANSLATIONS_DIR, file), 'utf8'))

    for (const tDoc of translatedDocs) {
      const { collection, id } = tDoc
      try {
        const original = await payload.findByID({
          collection,
          id,
          locale: 'uk',
          depth: 0,
          overrideAccess: true,
        })

        const data: Record<string, unknown> = {
          title: tDoc.title || original.title,
        }

        if (tDoc.hero && (original as any).hero) {
          data.hero = {
            ...(original as any).hero,
            richText: tDoc.hero.richText
              ? htmlToLexical(tDoc.hero.richText)
              : (original as any).hero.richText,
          }
        }

        if (Array.isArray(tDoc.layout)) {
          data.layout = ((original as any).layout || []).map((block: any, i: number) =>
            rebuildBlock(block, tDoc.layout[i] || {}),
          )
        }

        data.meta = {
          ...(original as any).meta,
          title: tDoc.meta?.title || (original as any).meta?.title,
          description: tDoc.meta?.description || (original as any).meta?.description,
        }

        await payload.update({
          collection,
          id,
          locale: 'en',
          context: { disableRevalidate: true },
          data: data as never,
        })

        updated++
      } catch (err) {
        failed++
        console.error(`! failed ${collection}#${id}:`, (err as Error).message)
      }
    }
    console.log(`Applied ${file} (${translatedDocs.length} docs)`)
  }

  console.log(`\nDone. Updated ${updated} documents, ${failed} failed.`)
  process.exit(0)
}

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

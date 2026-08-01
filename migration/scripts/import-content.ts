import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { parseTable, parseColumns } from '../lib/parseDump'
import { htmlToLexical } from '../lib/htmlToLexical'
import { slugifyFilename } from '../lib/slugify'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DUMP_PATH = path.resolve(__dirname, '../db/endesign_firstweb.sql')
const OLD_SITE_ROOT = 'C:\\xampp\\htdocs\\endesign'

// ---------------------------------------------------------------------------
// Load & index the mysqldump tables we need
// ---------------------------------------------------------------------------

function rowsAsObjects(table: string) {
  const columns = parseColumns(DUMP_PATH, table)
  const rows = parseTable(DUMP_PATH, table)
  return rows.map((row) => {
    const obj: Record<string, string | null> = {}
    columns.forEach((col, i) => (obj[col] = row[i]))
    return obj
  })
}

const siteContent = rowsAsObjects('ends_site_content')
const tmplvars = rowsAsObjects('ends_site_tmplvars')
const tvValues = rowsAsObjects('ends_site_tmplvar_contentvalues')
const polylangContent = rowsAsObjects('ends_polylang_content')
const systemSettings = rowsAsObjects('ends_system_settings')

const tvNameById = new Map<string, { name: string; type: string }>()
for (const tv of tmplvars) tvNameById.set(tv.id as string, { name: tv.name as string, type: tv.type as string })

const tvValuesByResource = new Map<string, Map<string, { value: string; type: string }>>()
for (const row of tvValues) {
  const tv = tvNameById.get(row.tmplvarid as string)
  if (!tv) continue
  const resourceId = row.contentid as string
  if (!tvValuesByResource.has(resourceId)) tvValuesByResource.set(resourceId, new Map())
  tvValuesByResource.get(resourceId)!.set(tv.name, { value: row.value as string, type: tv.type })
}

const ruOverrideByResource = new Map<string, Record<string, string | null>>()
for (const row of polylangContent) {
  if (row.culture_key !== 'ru') continue
  ruOverrideByResource.set(row.content_id as string, row)
}

const settingByKey = new Map<string, string>()
for (const row of systemSettings) settingByKey.set(row.key as string, row.value as string)

function tv(resourceId: string, name: string): string | undefined {
  return tvValuesByResource.get(resourceId)?.get(name)?.value
}

function tvJson<T>(resourceId: string, name: string): T | undefined {
  const raw = tv(resourceId, name)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`  ! failed to parse JSON TV "${name}" on resource ${resourceId}:`, (err as Error).message)
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Media upload (with in-memory dedupe + filename transliteration)
// ---------------------------------------------------------------------------

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const mediaCache = new Map<string, number>()
const missingAssets = new Set<string>()

function resolveAssetPath(relPath: string): string | null {
  const clean = relPath.replace(/^\/+/, '')
  const candidates = [
    path.join(OLD_SITE_ROOT, clean),
    path.join(OLD_SITE_ROOT, path.basename(clean)),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function uploadMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  relPath: string | undefined,
  alt = '',
): Promise<number | undefined> {
  if (!relPath) return undefined
  if (mediaCache.has(relPath)) return mediaCache.get(relPath)

  const absPath = resolveAssetPath(relPath)
  if (!absPath) {
    if (!missingAssets.has(relPath)) {
      missingAssets.add(relPath)
      console.warn(`  ! missing asset: ${relPath}`)
    }
    return undefined
  }

  const ext = path.extname(absPath).toLowerCase()
  const mimetype = MIME_BY_EXT[ext]
  if (!mimetype) {
    console.warn(`  ! unsupported asset type: ${relPath}`)
    return undefined
  }

  const data = fs.readFileSync(absPath)
  const name = slugifyFilename(path.basename(absPath))

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name, size: data.length },
  })

  mediaCache.set(relPath, doc.id as number)
  return doc.id as number
}

// ---------------------------------------------------------------------------
// Rich-text / block helpers
// ---------------------------------------------------------------------------

function paragraphsLexical(texts: (string | undefined)[]) {
  const html = texts.filter(Boolean).map((t) => `<p>${t}</p>`).join('')
  return htmlToLexical(html)
}

function contentBlockFromHtml(html: string) {
  return {
    blockType: 'content',
    columns: [{ size: 'full', richText: htmlToLexical(html), enableLink: false }],
  }
}

type BlockGroup = Record<string, string>

function collectBlockGroups(resourceId: string): Map<string, BlockGroup> {
  const groups = new Map<string, BlockGroup>()
  const values = tvValuesByResource.get(resourceId)
  if (!values) return groups

  const re = /^(topcat|childcat|prod|for_prod)_block_(\d+)_(.+)$/
  for (const [name] of values) {
    const match = re.exec(name)
    if (!match) continue
    const [, , num, suffix] = match
    if (!groups.has(num)) groups.set(num, {})
    groups.get(num)![suffix] = name
  }
  return groups
}

async function buildLayoutFromBlocks(
  payload: Awaited<ReturnType<typeof getPayload>>,
  resourceId: string,
): Promise<Record<string, unknown>[]> {
  const groups = collectBlockGroups(resourceId)
  const layout: Record<string, unknown>[] = []

  const sortedKeys = [...groups.keys()].sort((a, b) => Number(a) - Number(b))

  for (const num of sortedKeys) {
    const fields = groups.get(num)!
    const title = fields.title ? tv(resourceId, fields.title) : undefined
    const subtitle = fields.subtitle ? tv(resourceId, fields.subtitle) : undefined

    if (fields.gallery) {
      const items = tvJson<{ image: string; text?: string }[]>(resourceId, fields.gallery) || []
      const images = []
      for (const item of items) {
        const media = await uploadMedia(payload, item.image, item.text)
        if (media) images.push({ image: media, caption: item.text || '' })
      }
      if (images.length) layout.push({ blockType: 'gallery', title, images })
      continue
    }

    if (fields.icons) {
      const items = tvJson<{ icon: string; text?: string }[]>(resourceId, fields.icons) || []
      const listItems = []
      for (const item of items) {
        const icon = await uploadMedia(payload, item.icon)
        listItems.push({ icon, title: item.text || '', text: '' })
      }
      if (listItems.length) layout.push({ blockType: 'iconList', title, subtitle, items: listItems })
      continue
    }

    if (fields.list) {
      const items = tvJson<{ title?: string; text?: string }[]>(resourceId, fields.list) || []
      const listItems = items
        .filter((i) => i.title || i.text)
        .map((i) => ({ title: i.title || i.text || '', text: i.title ? i.text || '' : '' }))
      if (listItems.length) layout.push({ blockType: 'iconList', title, subtitle, items: listItems })
      continue
    }

    if (fields.img || fields.wtext) {
      const image = fields.img ? await uploadMedia(payload, tv(resourceId, fields.img)) : undefined
      const text = fields.wtext ? tv(resourceId, fields.wtext) : fields.text ? tv(resourceId, fields.text) : undefined
      layout.push({
        blockType: 'textImage',
        title,
        richText: htmlToLexical(text || ''),
        image,
      })
      continue
    }

    // Plain title/text pair(s) — text, text1/text2, or subtitle-only
    const textKeys = ['text', 'text1', 'text2', 'text_1', 'text_2', 'text_3'].filter((k) => fields[k])
    const combinedText = textKeys
      .map((k) => tv(resourceId, fields[k]))
      .filter(Boolean)
      .join('')

    if (title || combinedText) {
      layout.push({
        blockType: 'textImage',
        title,
        richText: htmlToLexical(combinedText || (subtitle ? `<p>${subtitle}</p>` : '')),
      })
    }
  }

  return layout
}

// ---------------------------------------------------------------------------
// Resource classification
// ---------------------------------------------------------------------------

const SKIP_IDS = new Set(['66', '80', '81'])
const FORCE_PUBLISHED_IDS = new Set(['11', '14', '38', '41'])
const HOME_ID = '1'
const CONTACT_ID = '65'

function byId(id: string) {
  return siteContent.find((r) => r.id === id)
}

const idMap = new Map<string, { collection: 'pages' | 'services' | 'case-studies'; docId: number }>()

function isLive(row: Record<string, string | null>) {
  return row.deleted === '0'
}

function targetCollection(row: Record<string, string | null>): 'pages' | 'services' | 'case-studies' | null {
  const id = row.id as string
  if (SKIP_IDS.has(id)) return null
  if (id === HOME_ID || id === CONTACT_ID) return 'pages'
  if (id === '41') return 'services'
  const tpl = row.template
  // template 1 ("Home") is reused for the 9 video sub-services under id 14 —
  // every other tpl=1 resource is either Home itself (handled above) or
  // already excluded via SKIP_IDS/deleted, so this is safe to fold into services.
  if (tpl === '1' || tpl === '2' || tpl === '3') return 'services'
  if (tpl === '5' || tpl === '7') return 'case-studies'
  return null
}

function statusFor(row: Record<string, string | null>): 'published' | 'draft' {
  if (FORCE_PUBLISHED_IDS.has(row.id as string)) return 'published'
  return row.published === '1' ? 'published' : 'draft'
}

const usedSlugs = new Map<string, Set<string>>()
function uniqueSlug(collection: string, base: string, id: string): string {
  if (!usedSlugs.has(collection)) usedSlugs.set(collection, new Set())
  const set = usedSlugs.get(collection)!
  let slug = base
  if (set.has(slug)) slug = `${base}-${id}`
  set.add(slug)
  return slug
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  const payload = await getPayload({ config })

  console.log('== Site settings ==')
  await payload.updateGlobal({
    slug: 'site-settings',
    context: { disableRevalidate: true },
    data: {
      contactPhones: [
        { label: 'Основний', phone: settingByKey.get('cont_phone_1') || '' },
        { label: '', phone: settingByKey.get('cont_phone_2') || '' },
        { label: '', phone: settingByKey.get('cont_phone_3') || '' },
      ].filter((p) => p.phone),
      email: settingByKey.get('cont_mail') || '',
      telegram: settingByKey.get('cont_telega') || '',
      viber: settingByKey.get('cont_viber') || '',
      whatsapp: settingByKey.get('cont_whats') || '',
      defaultSeo: {
        title: { uk: settingByKey.get('site_name') || '' },
      },
    },
  })

  const live = siteContent.filter(isLive)
  console.log(`\n== Migrating ${live.length - SKIP_IDS.size} resources (of ${live.length} non-deleted) ==\n`)

  // Pass 1: create every document without cross-resource relationships
  for (const row of live) {
    const collection = targetCollection(row)
    if (!collection) continue

    const id = row.id as string
    const title = row.pagetitle as string
    const alias = (row.alias as string) || `page-${id}`
    const status = statusFor(row)

    console.log(`[${collection}] #${id} "${title}" (${status})`)

    try {
      if (collection === 'pages') {
        const isHome = id === HOME_ID
        const slug = isHome ? 'home' : uniqueSlug('pages', alias, id)

        // Note: the original ModX `content` field for Home/Contact only ever held
        // stale MODX-installer boilerplate — the real markup lived in the template
        // itself (chunks/snippets), which this migration does not attempt to
        // reverse-engineer. These pages get an honest placeholder instead and are
        // meant to be authored fresh as part of the new design.
        const placeholderHtml = `<p>Розділ «${title}» буде наповнено контентом під час розробки нового дизайну.</p>`

        let hero: Record<string, unknown> = { type: 'none' }
        if (isHome) {
          const media = await uploadMedia(payload, tv(id, 'header_img'), title)
          const heroText = paragraphsLexical([tv(id, 'title_2'), tv(id, 'subtitle_2'), tv(id, 'header_text')])
          hero = {
            type: media ? 'highImpact' : 'lowImpact',
            media,
            richText: tv(id, 'title_2') || tv(id, 'subtitle_2') || tv(id, 'header_text') ? heroText : htmlToLexical(placeholderHtml),
          }
        }

        const layout = await buildLayoutFromBlocks(payload, id)
        if (layout.length === 0) {
          layout.push(contentBlockFromHtml(placeholderHtml))
        }

        const doc = await payload.create({
          collection: 'pages',
          locale: 'uk',
          context: { disableRevalidate: true },
          data: {
            title,
            slug,
            _status: status,
            hero,
            layout,
            meta: {
              title: (tv(id, 'seo_title') as string) || title,
              description: (tv(id, 'seo_description') as string) || '',
            },
          } as never,
        })
        idMap.set(id, { collection: 'pages', docId: doc.id as number })

        const ru = ruOverrideByResource.get(id)
        if (ru?.pagetitle || ru?.content) {
          await payload.update({
            collection: 'pages',
            id: doc.id,
            locale: 'ru',
            context: { disableRevalidate: true },
            data: {
              title: ru.pagetitle || title,
              hero: ru.content ? { ...hero, richText: htmlToLexical(ru.content) } : hero,
            } as never,
          })
        }
      }

      if (collection === 'services') {
        const serviceType = row.template === '2' || id === '41' ? 'category' : 'service'
        const slug = uniqueSlug('services', alias, id)

        const headerImg = tv(id, 'header_img') || tv(id, 'cat_img')
        const headerText = tv(id, 'header_text') || tv(id, 'cat_text')
        const media = await uploadMedia(payload, headerImg, title)
        const hero = media
          ? { type: 'mediumImpact', media, richText: paragraphsLexical([headerText]) }
          : headerText
            ? { type: 'lowImpact', richText: paragraphsLexical([headerText]) }
            : { type: 'none' }

        const layout = await buildLayoutFromBlocks(payload, id)
        const price = tv(id, 'cat_price')

        const doc = await payload.create({
          collection: 'services',
          locale: 'uk',
          context: { disableRevalidate: true },
          data: {
            title,
            slug,
            serviceType,
            price,
            _status: status,
            hero,
            layout,
            meta: {
              title: (tv(id, 'seo_title') as string) || title,
              description: (tv(id, 'seo_description') as string) || '',
            },
          } as never,
        })
        idMap.set(id, { collection: 'services', docId: doc.id as number })

        const ru = ruOverrideByResource.get(id)
        if (ru?.pagetitle) {
          await payload.update({
            collection: 'services',
            id: doc.id,
            locale: 'ru',
            context: { disableRevalidate: true },
            data: { title: ru.pagetitle } as never,
          })
        }
      }

      if (collection === 'case-studies') {
        const slug = uniqueSlug('case-studies', alias, id)
        const clientImg = tv(id, 'client_img') || tv(id, 'client_img_cat')
        const clientLogo = await uploadMedia(payload, clientImg, title)
        const layout = await buildLayoutFromBlocks(payload, id)

        const doc = await payload.create({
          collection: 'case-studies',
          locale: 'uk',
          context: { disableRevalidate: true },
          data: {
            title,
            slug,
            clientLogo,
            _status: status,
            layout,
            meta: {
              title: (tv(id, 'seo_title') as string) || title,
              description: (tv(id, 'seo_description') as string) || '',
            },
          } as never,
        })
        idMap.set(id, { collection: 'case-studies', docId: doc.id as number })

        const ru = ruOverrideByResource.get(id)
        if (ru?.pagetitle) {
          await payload.update({
            collection: 'case-studies',
            id: doc.id,
            locale: 'ru',
            context: { disableRevalidate: true },
            data: { title: ru.pagetitle } as never,
          })
        }
      }
    } catch (err) {
      console.error(`  ! failed to migrate #${id}:`, err)
    }
  }

  // Pass 2: wire up parent / relatedService relationships now that every doc exists
  console.log('\n== Linking relationships ==\n')
  for (const row of live) {
    const id = row.id as string
    const parentId = row.parent as string
    const mapped = idMap.get(id)
    const parentMapped = idMap.get(parentId)
    if (!mapped || !parentMapped) continue

    try {
      if (mapped.collection === 'services' && parentMapped.collection === 'services') {
        await payload.update({
          collection: 'services',
          id: mapped.docId,
          context: { disableRevalidate: true },
          data: { parent: parentMapped.docId } as never,
        })
      }
      if (mapped.collection === 'case-studies' && parentMapped.collection === 'services') {
        await payload.update({
          collection: 'case-studies',
          id: mapped.docId,
          context: { disableRevalidate: true },
          data: { relatedService: parentMapped.docId } as never,
        })
      }
    } catch (err) {
      console.error(`  ! failed to link #${id} -> #${parentId}:`, err)
    }
  }

  console.log(`\nDone. Migrated ${idMap.size} documents. Missing assets: ${missingAssets.size}`)
  if (missingAssets.size) {
    console.log([...missingAssets].join('\n'))
  }

  process.exit(0)
}

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

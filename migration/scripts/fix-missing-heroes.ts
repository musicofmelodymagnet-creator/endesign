import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { slugifyFilename } from '../lib/slugify'

const OLD_SITE_ROOT = 'C:\\xampp\\htdocs\\endesign'

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
}

const FIXES: { slug: string; relPath: string; alt: string }[] = [
  {
    slug: 'video-ta-animatsyia',
    relPath: 'assets/template/img/Video i animaciya.jpg',
    alt: 'Відео та анімація',
  },
  {
    slug: 'zovnishnia-reklama',
    relPath: 'assets/images/Reklama Outdoor.png',
    alt: 'Виготовлення зовнішньої реклами',
  },
  {
    slug: 'nashi-kliienty',
    relPath: 'assets/images/Nashi raboty2.fw.png',
    alt: 'Наші клієнти',
  },
  {
    slug: 'reklama-ta-prosuvannia',
    relPath: 'assets/template/img/Фото Услуг_Graphichny dyzain Soc seti.jpg',
    alt: 'Реклама та просування',
  },
]

async function run() {
  const payload = await getPayload({ config })

  for (const fix of FIXES) {
    const absPath = path.join(OLD_SITE_ROOT, fix.relPath)
    if (!fs.existsSync(absPath)) {
      console.warn(`! missing source file: ${absPath}`)
      continue
    }

    const ext = path.extname(absPath).toLowerCase()
    const mimetype = MIME_BY_EXT[ext]
    const data = fs.readFileSync(absPath)
    const name = slugifyFilename(path.basename(absPath))

    const media = await payload.create({
      collection: 'media',
      data: { alt: fix.alt },
      file: { data, mimetype, name, size: data.length },
    })

    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: fix.slug } },
      limit: 1,
    })

    const doc = existing.docs[0]
    if (!doc) {
      console.warn(`! no service found with slug ${fix.slug}`)
      continue
    }

    await payload.update({
      collection: 'services',
      id: doc.id,
      context: { disableRevalidate: true },
      data: {
        hero: {
          type: 'mediumImpact',
          media: media.id,
        },
      } as never,
    })

    console.log(`✓ ${fix.slug} -> media #${media.id} (${name})`)
  }

  process.exit(0)
}

try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}

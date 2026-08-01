import { getPayload } from 'payload'
import config from '../../src/payload.config'

async function run() {
  const payload = await getPayload({ config })

  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'ren1-7.jpg' } },
    limit: 1,
  })
  const mediaDoc = media.docs[0]
  if (!mediaDoc) {
    console.error('Media not found: ren1-7.jpg')
    process.exit(1)
  }
  console.log('Found media:', mediaDoc.id, mediaDoc.filename)

  const category = await payload.find({
    collection: 'services',
    where: { slug: { equals: '3d-vyzualyzatsyia-y-modelyrovanye' } },
    locale: 'uk',
  })
  const doc = category.docs[0]
  if (!doc) {
    console.error('Category not found')
    process.exit(1)
  }

  for (const locale of ['uk', 'ru', 'en']) {
    await payload.update({
      collection: 'services',
      id: doc.id,
      locale,
      context: { disableRevalidate: true },
      data: {
        hero: {
          ...(doc.hero as object),
          media: mediaDoc.id,
        },
      } as never,
    })
    console.log(`Updated hero.media for locale ${locale}`)
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

import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'
import { getServicesDirectory, type DirectoryLeaf } from '@/utilities/getServicesDirectory'

function DirectoryTile({ locale, item }: { locale: Locale; item: DirectoryLeaf }) {
  return (
    <Link
      href={`/${locale}/services/${item.slug}`}
      className="group border-border/60 bg-card hover:border-primary flex items-center gap-3 rounded-xl border p-2 transition-colors"
    >
      <div className="bg-secondary h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
      </div>
      <span
        className={
          item.highlight ? 'text-foreground text-sm font-semibold' : 'text-muted-foreground text-sm'
        }
      >
        {item.title}
      </span>
    </Link>
  )
}

// No generateStaticParams here on purpose: pre-rendering this at build time
// would require a live Postgres connection during `docker build`, before the
// database service is even up. The page renders on first request instead and
// is cached per `revalidate` below (same ISR behavior, just resolved lazily).
export const revalidate = 60

type Args = { params: Promise<{ locale: string }> }

export default async function ServicesIndex({ params }: Args) {
  const { locale } = (await params) as { locale: Locale }
  const t = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const [categories, directory] = await Promise.all([
    payload.find({
      collection: 'services',
      where: {
        serviceType: { equals: 'category' },
        or: [{ parent: { exists: false } }, { menuHighlight: { equals: true } }],
      },
      limit: 100,
      depth: 1,
      locale,
      sort: 'menuOrder',
    }),
    getServicesDirectory(locale),
  ])

  // Top-level categories always lead; highlighted subcategories (e.g. Дизайн
  // поліграфії) follow, each group keeping its own menuOrder sequence.
  categories.docs.sort((a, b) => {
    const aTop = a.parent ? 1 : 0
    const bTop = b.parent ? 1 : 0
    return aTop - bTop
  })

  return (
    <article className="pb-24">
      <div className="container pt-16 pb-10 md:pt-24">
        <StampBadge>{t.services.badge}</StampBadge>
        <h1 className="font-display mt-6 max-w-3xl text-4xl md:text-6xl">{t.services.title}</h1>
        <p className="text-muted-foreground mt-5 max-w-xl">{t.services.subtitle}</p>
      </div>

      <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.docs.map((cat, i) => {
          const image = cat.hero?.media
          return (
            <Reveal key={cat.id} delay={(i % 6) * 0.06}>
              <Link
                href={`/${locale}/services/${cat.slug}`}
                className="group border-border/60 bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border transition-colors hover:border-primary"
              >
                <div className="bg-secondary aspect-4/3 overflow-hidden">
                  {image && typeof image === 'object' && (
                    <Media
                      resource={image}
                      imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl">{cat.title}</h2>
                  <span className="text-primary link-underline mt-auto pt-4 text-sm">
                    {t.services.viewServices}
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      {/* --------------------------------------------------------- Full directory */}
      <div className="container mt-24 md:mt-32">
        <Reveal className="max-w-xl">
          <h2 className="font-display text-3xl md:text-4xl">{t.services.fullListTitle}</h2>
          <p className="text-muted-foreground mt-4">{t.services.fullListSubtitle}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-5">
          {directory.map((group, i) => (
            <Reveal key={group.id} delay={(i % 5) * 0.06}>
              <Link
                href={`/${locale}/services/${group.slug}`}
                className="link-underline font-display text-sm tracking-wide uppercase"
              >
                {group.title}
              </Link>

              <ul className="mt-5 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <DirectoryTile locale={locale} item={item} />
                  </li>
                ))}
              </ul>

              {group.subgroups.map((sub) => (
                <div key={sub.id} className="mt-5">
                  <Link
                    href={`/${locale}/services/${sub.slug}`}
                    className="link-underline text-foreground text-sm font-semibold"
                  >
                    {sub.title}
                  </Link>
                  <ul className="border-border/60 mt-3 flex flex-col gap-2 border-l pl-4">
                    {sub.items.map((item) => (
                      <li key={item.id}>
                        <DirectoryTile locale={locale} item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  )
}

const META: Record<Locale, { title: string; description: string }> = {
  uk: {
    title: 'Послуги | EnDesign',
    description: 'Графічний дизайн, розробка сайтів та 3D-візуалізація — послуги студії EnDesign.',
  },
  ru: {
    title: 'Услуги | EnDesign',
    description: 'Графический дизайн, разработка сайтов и 3D-визуализация — услуги студии EnDesign.',
  },
  en: {
    title: 'Services | EnDesign',
    description: 'Graphic design, web development and 3D visualization — services by EnDesign studio.',
  },
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  return META[locale] || META.uk
}

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
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { generateAlternates } from '@/utilities/generateAlternates'
import { getServerSideURL } from '@/utilities/getURL'

// No generateStaticParams here on purpose: pre-rendering this at build time
// would require a live Postgres connection during `docker build`, before the
// database service is even up. The page renders on first request instead and
// is cached per `revalidate` below (same ISR behavior, just resolved lazily).
export const revalidate = 60

type Args = { params: Promise<{ locale: string }> }

export default async function PortfolioIndex({ params }: Args) {
  const { locale } = (await params) as { locale: Locale }
  const t = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const cases = await payload.find({
    collection: 'case-studies',
    limit: 100,
    depth: 1,
    locale,
  })

  return (
    <article className="pb-24">
      <div className="container pt-16 pb-10 md:pt-24">
        <StampBadge tone="crimson">{t.portfolio.badge}</StampBadge>
        <h1 className="font-display mt-6 max-w-3xl text-4xl md:text-6xl">{t.portfolio.title}</h1>
      </div>

      <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cases.docs.map((item, i) => (
          <Reveal key={item.id} delay={(i % 6) * 0.06}>
            <Link
              href={`/${locale}/portfolio/${item.slug}`}
              className="group border-border/60 bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border transition-colors hover:border-primary"
            >
              <div className="bg-secondary flex aspect-4/3 items-center justify-center overflow-hidden p-4">
                {item.clientLogo && typeof item.clientLogo === 'object' && (
                  <Media
                    resource={item.clientLogo}
                    imgClassName="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="flex flex-1 items-center justify-between p-6">
                <div>
                  <h2 className="font-display text-lg">{item.title}</h2>
                  {item.tagline && <p className="text-muted-foreground mt-1 text-sm">{item.tagline}</p>}
                </div>
                <span className="text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </article>
  )
}

const DEFAULT_META: Record<Locale, { title: string; description: string }> = {
  uk: {
    title: 'Портфоліо | EnDesign',
    description: 'Проєкти студії EnDesign: графічний дизайн, сайти та 3D-візуалізація для наших клієнтів.',
  },
  ru: {
    title: 'Портфолио | EnDesign',
    description: 'Проекты студии EnDesign: графический дизайн, сайты и 3D-визуализация для наших клиентов.',
  },
  en: {
    title: 'Portfolio | EnDesign',
    description: 'EnDesign studio projects: graphic design, websites and 3D visualization for our clients.',
  },
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const site = await getCachedGlobal('site-settings', 0, locale)()
  const fallback = DEFAULT_META[locale] || DEFAULT_META.uk
  const meta = {
    title: site?.pageSeo?.portfolioList?.title || fallback.title,
    description: site?.pageSeo?.portfolioList?.description || fallback.description,
  }
  return {
    ...meta,
    alternates: generateAlternates(locale, '/portfolio'),
    openGraph: mergeOpenGraph(
      {
        title: meta.title,
        description: meta.description,
        url: `${getServerSideURL()}/${locale}/portfolio`,
      },
      locale,
    ),
  }
}

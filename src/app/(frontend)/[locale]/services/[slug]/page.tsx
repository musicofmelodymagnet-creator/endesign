import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { Reveal } from '@/components/Reveal'
import { Media } from '@/components/Media'
import { QuickContactBar } from '@/components/QuickContactBar'
import { StampBadge } from '@/components/StampBadge'
import { getDictionary } from '@/i18n/dictionary'
import { locales, type Locale } from '@/i18n/config'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const services = await payload.find({
    collection: 'services',
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return locales.flatMap((locale) => services.docs.map(({ slug }) => ({ locale, slug })))
}

type Args = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ServicePage({ params: paramsPromise }: Args) {
  const { slug, locale } = (await paramsPromise) as { slug: string; locale: Locale }
  const t = getDictionary(locale)
  const service = await queryServiceBySlug({ slug, locale })

  if (!service) notFound()

  const { hero, layout, serviceType, price, parent, title } = service
  const parentDoc = parent && typeof parent === 'object' ? parent : null

  const payload = await getPayload({ config: configPromise })
  const children =
    serviceType === 'category'
      ? await payload.find({
          collection: 'services',
          where: { parent: { equals: service.id } },
          limit: 50,
          locale,
          sort: 'menuOrder',
        })
      : null

  return (
    <article className="pb-24">
      <div className="container flex items-center gap-2 pt-8 text-sm">
        <Link href={`/${locale}/services`} className="link-underline text-muted-foreground">
          {t.serviceDetail.breadcrumbServices}
        </Link>
        {parentDoc && (
          <>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/${locale}/services/${parentDoc.slug}`}
              className="link-underline text-muted-foreground"
            >
              {parentDoc.title}
            </Link>
          </>
        )}
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{title}</span>
      </div>

      <RenderHero {...hero} />

      <div className="mt-8">
        <QuickContactBar locale={locale} />
      </div>

      {price && (
        <div className="container mt-6">
          <StampBadge tone="crimson">
            {t.serviceDetail.priceFrom} {price}
          </StampBadge>
        </div>
      )}

      <RenderBlocks blocks={layout as unknown as Record<string, unknown>[]} />

      {children && children.docs.length > 0 && (
        <div className="container mt-16">
          <Reveal>
            <h2 className="font-display mb-8 text-2xl md:text-3xl">{t.serviceDetail.directionServices}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.docs.map((child, i) => (
              <Reveal key={child.id} delay={(i % 6) * 0.05}>
                <Link
                  href={`/${locale}/services/${child.slug}`}
                  className="group border-border/60 bg-card flex h-full flex-col overflow-hidden rounded-2xl border transition-colors hover:border-primary"
                >
                  {child.hero?.media && typeof child.hero.media === 'object' && (
                    <div className="aspect-4/3 overflow-hidden">
                      <Media
                        resource={child.hero.media}
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-base">{child.title}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="container mt-20">
        <div className="bg-foreground text-background flex flex-col items-start gap-6 rounded-3xl p-10 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-2xl md:text-3xl">{t.serviceDetail.ctaTitle}</h2>
          <Link
            href={`/${locale}/kontakty`}
            className="stamp bg-primary text-primary-foreground font-display inline-flex rounded-full px-6 py-3 text-sm tracking-wide whitespace-nowrap uppercase"
          >
            {t.serviceDetail.ctaButton}
          </Link>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, locale } = (await paramsPromise) as { slug: string; locale: Locale }
  const service = await queryServiceBySlug({ slug, locale })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generateMeta({ doc: service as any })
}

const queryServiceBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    depth: 2,
    locale,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

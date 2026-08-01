import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { getDictionary } from '@/i18n/dictionary'
import { locales, type Locale } from '@/i18n/config'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const cases = await payload.find({
    collection: 'case-studies',
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return locales.flatMap((locale) => cases.docs.map(({ slug }) => ({ locale, slug })))
}

type Args = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function CaseStudyPage({ params: paramsPromise }: Args) {
  const { slug, locale } = (await paramsPromise) as { slug: string; locale: Locale }
  const t = getDictionary(locale)
  const caseStudy = await queryCaseStudyBySlug({ slug, locale })

  if (!caseStudy) notFound()

  const { title, tagline, clientLogo, layout, relatedService } = caseStudy
  const service = relatedService && typeof relatedService === 'object' ? relatedService : null
  const hasLayout = Array.isArray(layout) && layout.length > 0

  return (
    <article className="pb-24">
      <div className="container flex items-center gap-2 pt-8 text-sm">
        <Link href={`/${locale}/portfolio`} className="link-underline text-muted-foreground">
          {t.portfolio.breadcrumb}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{title}</span>
      </div>

      <div className="container flex flex-col items-start gap-8 pt-8 pb-4 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <h1 className="font-display text-4xl md:text-6xl">{title}</h1>
          {tagline && <p className="text-muted-foreground mt-3 text-lg">{tagline}</p>}
          {service && (
            <Link
              href={`/${locale}/services/${service.slug}`}
              className="link-underline text-primary mt-4 inline-block"
            >
              {service.title}
            </Link>
          )}
        </Reveal>
        {clientLogo && typeof clientLogo === 'object' && (
          <Reveal delay={0.1} className="border-border/60 bg-card shrink-0 rounded-2xl border p-8">
            <Media resource={clientLogo} imgClassName="h-16 w-auto object-contain" />
          </Reveal>
        )}
      </div>

      {hasLayout ? (
        <RenderBlocks blocks={layout as unknown as Record<string, unknown>[]} />
      ) : (
        <div className="container mt-4 mb-16">
          <p className="text-muted-foreground border-border/60 bg-card max-w-xl rounded-2xl border p-6 text-sm">
            {t.portfolio.emptyNote}
          </p>
        </div>
      )}

      <div className="container mt-16">
        <Link href={`/${locale}/portfolio`} className="link-underline font-display text-sm uppercase">
          {t.portfolio.allProjects}
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, locale } = (await paramsPromise) as { slug: string; locale: Locale }
  const caseStudy = await queryCaseStudyBySlug({ slug, locale })
  return {
    title: caseStudy?.title ? `${caseStudy.title} | EnDesign` : 'EnDesign',
    description: caseStudy?.meta?.description || undefined,
  }
}

const queryCaseStudyBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'case-studies',
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

import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import { HeroVideo } from '@/components/HeroVideo'
import { LogoMarquee } from '@/components/LogoMarquee'
import { Marquee } from '@/components/Marquee'
import { TeamSection } from '@/components/TeamSection'
import { GoogleReviewsSection } from '@/components/GoogleReviews/GoogleReviewsSection'
import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { generateAlternates } from '@/utilities/generateAlternates'
import { getServerSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'
import { getDictionary } from '@/i18n/dictionary'
import { highlightAccent } from '@/i18n/highlight'
import type { Locale } from '@/i18n/config'

// No generateStaticParams here on purpose: pre-rendering this at build time
// would require a live Postgres connection during `docker build`, before the
// database service is even up. The page renders on first request instead and
// is cached per `revalidate` below (same ISR behavior, just resolved lazily).
export const revalidate = 60

type Args = { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Args) {
  const { locale } = (await params) as { locale: Locale }
  const t = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const [categories, cases, site, home] = await Promise.all([
    payload.find({
      collection: 'services',
      where: {
        serviceType: { equals: 'category' },
        or: [{ parent: { exists: false } }, { menuHighlight: { equals: true } }],
      },
      limit: 12,
      depth: 1,
      locale,
      sort: 'menuOrder',
    }),
    payload.find({
      collection: 'case-studies',
      limit: 24,
      depth: 1,
      locale,
    }),
    getCachedGlobal('site-settings', 1, locale)(),
    getCachedGlobal('home', 1, locale)(),
  ])

  // Top-level categories always lead; highlighted subcategories (e.g. Дизайн
  // поліграфії) follow, each group keeping its own menuOrder sequence.
  categories.docs.sort((a, b) => {
    const aTop = a.parent ? 1 : 0
    const bTop = b.parent ? 1 : 0
    return aTop - bTop
  })

  const heroVideo = site?.homeHeroVideo
  const hasVideo = Boolean(heroVideo && typeof heroVideo === 'object' && heroVideo.url)
  const marqueeItems = (home?.marquee || []).map((m) => m.text)

  return (
    <article>
      {/* ------------------------------------------------------------------ Hero */}
      <section
        className={cn(
          'relative overflow-hidden pt-16 pb-20 md:pt-24',
          hasVideo &&
            'flex min-h-[560px] items-center pt-16 pb-16 md:min-h-[calc(100vh-73px)] md:pt-16',
        )}
      >
        {hasVideo ? (
          <>
            <HeroVideo
              className="absolute inset-0 h-full w-full object-cover"
              poster="/hero-poster.jpg"
              src={typeof heroVideo === 'object' ? (heroVideo?.url ?? undefined) : undefined}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(100deg, rgba(18,15,11,0.92) 0%, rgba(18,15,11,0.72) 45%, rgba(18,15,11,0.38) 100%)',
              }}
            />
          </>
        ) : (
          <div
            aria-hidden
            className="bg-primary/25 absolute top-0 right-0 h-[36rem] w-[36rem] -translate-y-1/3 translate-x-1/3 rounded-full blur-3xl"
          />
        )}
        <div className="container relative z-10">
          <Reveal>
            <StampBadge tone={hasVideo ? 'crimson' : undefined}>{home?.badge}</StampBadge>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              className={cn(
                'font-display mt-8 max-w-4xl text-5xl leading-[1.02] md:text-7xl lg:text-8xl',
                hasVideo && 'text-[#F8F3E7]',
              )}
            >
              {highlightAccent(home?.headline || '')}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p
              className={cn(
                'mt-8 max-w-lg text-lg',
                hasVideo ? 'text-[#F8F3E7]/75' : 'text-muted-foreground',
              )}
            >
              {home?.subhead}
            </p>
          </Reveal>

          <Reveal delay={0.24} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/kontakty`}
              className="stamp bg-primary text-primary-foreground font-display inline-flex rounded-full px-7 py-3.5 text-sm tracking-wide uppercase"
            >
              {home?.ctaDiscussLabel}
            </Link>
            <Link
              href={`/${locale}/portfolio`}
              className={cn(
                'link-underline font-display text-sm tracking-wide uppercase',
                hasVideo && 'text-[#F8F3E7]',
              )}
            >
              {home?.ctaViewWorkLabel}
            </Link>
          </Reveal>
        </div>

        {!hasVideo && marqueeItems.length > 0 && (
          <div className="border-border/60 mt-20 border-y py-6">
            <Marquee items={marqueeItems} />
          </div>
        )}
      </section>

      {hasVideo && marqueeItems.length > 0 && (
        <div className="border-border/60 border-y py-6">
          <Marquee items={marqueeItems} />
        </div>
      )}

      {/* -------------------------------------------------------- Service pillars */}
      <section className="container py-20 md:py-28">
        <Reveal className="max-w-xl">
          <h2 className="font-display text-3xl md:text-4xl">{home?.pillarsTitle}</h2>
          <p className="text-muted-foreground mt-4">{home?.pillarsSubtitle}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {(home?.pillars || []).map((p, i) => {
            const service = typeof p.linkedService === 'object' ? p.linkedService : null
            const href = service?.slug
              ? `/${locale}/services/${service.slug}`
              : `/${locale}/services`
            return (
              <Reveal key={p.id || i} delay={i * 0.08}>
                <Link
                  href={href}
                  className="group border-border/60 bg-card relative flex h-full flex-col rounded-3xl border p-8 transition-colors hover:border-primary"
                >
                  <span className="font-display text-primary text-4xl">{p.tag}</span>
                  <h3 className="font-display mt-6 text-2xl">{p.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{p.text}</p>
                  <span className="link-underline font-display mt-8 w-fit text-sm tracking-wide uppercase">
                    {home?.detailsLinkLabel}
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- Category grid */}
      {categories.docs.length > 0 && (
        <section className="cut-t bg-foreground text-background py-20 md:py-28">
          <div className="container">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl md:text-4xl">{home?.servicesSectionTitle}</h2>
              <Link
                href={`/${locale}/services`}
                className="link-underline font-display text-sm tracking-wide uppercase"
              >
                {home?.viewAllServicesLabel}
              </Link>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.docs.map((cat, i) => {
                const image = cat.hero?.media
                return (
                  <Reveal key={cat.id} delay={(i % 6) * 0.05}>
                    <Link
                      href={`/${locale}/services/${cat.slug}`}
                      className="group border-background/15 bg-background/5 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors hover:border-primary"
                    >
                      {image && typeof image === 'object' && (
                        <div className="aspect-4/3 overflow-hidden">
                          <Media
                            resource={image}
                            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-base">{cat.title}</h3>
                        <span className="text-primary link-underline mt-auto pt-4 text-sm">
                          {t.services.viewServices}
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- Portfolio */}
      {cases.docs.length > 0 && (
        <section className="container py-20 md:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl">{home?.portfolioSectionTitle}</h2>
            <Link
              href={`/${locale}/portfolio`}
              className="link-underline font-display text-sm tracking-wide uppercase"
            >
              {home?.viewAllProjectsLabel}
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <LogoMarquee items={cases.docs} locale={locale} hrefBase="/portfolio" />
          </Reveal>
        </section>
      )}

      <GoogleReviewsSection widgetId={site?.googleReviewsWidgetId} locale={locale} />

      {/* ------------------------------------------------------------------ Team */}
      <TeamSection locale={locale} />

      {/* -------------------------------------------------------------------- CTA */}
      <section className="container pb-24">
        <Reveal>
          <div className="border-border/60 bg-secondary relative overflow-hidden rounded-3xl border p-10 md:p-16">
            <div
              aria-hidden
              className="bg-primary/30 absolute -right-10 -bottom-10 h-64 w-64 rounded-full blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display max-w-xl text-3xl md:text-5xl">{home?.ctaBannerTitle}</h2>
              <Link
                href={`/${locale}/kontakty`}
                className="stamp bg-primary text-primary-foreground font-display inline-flex shrink-0 rounded-full px-8 py-4 text-sm tracking-wide whitespace-nowrap uppercase"
              >
                {home?.ctaBannerButtonLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </article>
  )
}

// Fallback used only if the CMS field is empty (e.g. right after a fresh
// install, before an editor has filled in site-settings.pageSeo.home).
const DEFAULT_META: Record<Locale, { title: string; description: string }> = {
  uk: {
    title: 'EnDesign — студія графічного дизайну, сайтів та 3D у Києві',
    description:
      'Графічний дизайн, розробка сайтів та 3D-візуалізація. Студія EnDesign у Києві перетворює бізнес на впізнаваний бренд.',
  },
  ru: {
    title: 'EnDesign — студия графического дизайна, сайтов и 3D в Киеве',
    description:
      'Графический дизайн, разработка сайтов и 3D-визуализация. Студия EnDesign в Киеве превращает бизнес в узнаваемый бренд.',
  },
  en: {
    title: 'EnDesign — graphic design, web & 3D studio in Kyiv',
    description:
      'Graphic design, web development and 3D visualization. EnDesign in Kyiv turns your business into a recognisable brand.',
  },
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const site = await getCachedGlobal('site-settings', 0, locale)()
  const fallback = DEFAULT_META[locale] || DEFAULT_META.uk
  const meta = {
    title: site?.pageSeo?.home?.title || fallback.title,
    description: site?.pageSeo?.home?.description || fallback.description,
  }
  return {
    ...meta,
    alternates: generateAlternates(locale, ''),
    openGraph: mergeOpenGraph(
      {
        title: meta.title,
        description: meta.description,
        url: `${getServerSideURL()}/${locale}`,
      },
      locale,
    ),
  }
}

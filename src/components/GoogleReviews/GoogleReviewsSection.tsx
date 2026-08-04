import React from 'react'
import { Star } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import { GoogleIcon } from '@/components/GoogleReviews/GoogleIcon'
import { ReviewsCarousel } from '@/components/GoogleReviews/ReviewsCarousel'
import { GOOGLE_RATING, GOOGLE_REVIEWS, GOOGLE_REVIEWS_URL, GOOGLE_REVIEW_COUNT } from '@/data/googleReviews'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

export function GoogleReviewsSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  if (GOOGLE_REVIEWS.length === 0) return null

  return (
    <section id="google-reviews" className="container py-20 md:py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <StampBadge tone="amber">{t.reviews.badge}</StampBadge>
          <h2 className="font-display mt-6 text-3xl md:text-4xl">{t.reviews.title}</h2>
          <p className="text-muted-foreground mt-4 max-w-lg">{t.reviews.subtitle}</p>
        </div>

        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="border-border/60 bg-card group flex shrink-0 items-center gap-4 rounded-2xl border px-6 py-4 transition-colors hover:border-primary"
        >
          <GoogleIcon className="h-8 w-8 shrink-0" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl leading-none">{GOOGLE_RATING.toFixed(1)}</span>
              <div className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-primary text-primary h-4 w-4" strokeWidth={1.5} />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {t.reviews.ratingCaption} · {GOOGLE_REVIEW_COUNT} {t.reviews.reviewsCountLabel}
            </p>
          </div>
          <span className="link-underline font-display ml-2 hidden shrink-0 text-sm tracking-wide uppercase group-hover:inline sm:inline">
            {t.reviews.ctaLabel}
          </span>
        </a>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <ReviewsCarousel reviews={GOOGLE_REVIEWS} />
      </Reveal>
    </section>
  )
}

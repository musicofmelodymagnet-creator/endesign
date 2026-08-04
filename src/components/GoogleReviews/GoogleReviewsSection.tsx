'use client'

import React from 'react'
import { ReactGoogleReviews } from 'react-google-reviews'
import 'react-google-reviews/dist/index.css'

import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

export function GoogleReviewsSection({
  widgetId,
  locale,
}: {
  widgetId?: string | null
  locale: Locale
}) {
  if (!widgetId) return null

  const t = getDictionary(locale).googleReviews

  return (
    <section id="google-reviews" className="container py-20 md:py-28">
      <Reveal className="max-w-xl">
        <StampBadge tone="amber">{t.badge}</StampBadge>
        <h2 className="font-display mt-6 text-3xl md:text-4xl">{t.title}</h2>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <ReactGoogleReviews
          layout="carousel"
          featurableId={widgetId}
          reviewVariant="card"
          nameDisplay="fullNames"
          logoVariant="icon"
          dateDisplay="relative"
          theme="light"
        />
      </Reveal>
    </section>
  )
}

import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Play, Roboto } from 'next/font/google'
import React from 'react'
import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { ScrollToTop } from '@/components/ScrollToTop'
import { BriefModal } from '@/components/BriefModal'
import { OrganizationJsonLd } from '@/components/OrganizationJsonLd'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { isLocale, type Locale } from '@/i18n/config'

import '../globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// EnDesign brand typefaces (from the legacy site: --svc-font-display / --svc-font-text)
const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const play = Play({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})

// No generateStaticParams here on purpose: this layout fetches from Payload
// (the brief form, plus Header/Footer inside), which would require a live
// Postgres connection during `docker build`, before the database service is
// even up. Rendering happens dynamically per request instead.
type Args = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Args) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const { isEnabled } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  const briefForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: `brief-${locale}` } },
    limit: 1,
    depth: 0,
  })

  return (
    <html
      className={cn(roboto.variable, play.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
        <link href="/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <OrganizationJsonLd locale={locale as Locale} />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header locale={locale as Locale} />
          {children}
          <Footer locale={locale as Locale} />
          <ScrollToTop />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <BriefModal form={(briefForm.docs[0] as any) || null} locale={locale as Locale} />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}

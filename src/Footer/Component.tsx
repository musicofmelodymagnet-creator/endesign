import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { BriefTrigger } from '@/components/BriefTrigger'
import {
  KyivstarIcon,
  LifecellIcon,
  TelegramIcon,
  ViberIcon,
  VodafoneIcon,
  WhatsAppIcon,
} from '@/components/icons/ContactIcons'
import { Logo } from '@/components/Logo/Logo'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

const CARRIER_ICONS = {
  lifecell: LifecellIcon,
  kyivstar: KyivstarIcon,
  vodafone: VodafoneIcon,
}

const MESSENGERS = [
  { key: 'telegram' as const, href: (v: string) => `https://t.me/${v}`, Icon: TelegramIcon },
  { key: 'viber' as const, href: (v: string) => `viber://chat?number=${v}`, Icon: ViberIcon },
  { key: 'whatsapp' as const, href: (v: string) => `https://wa.me/${v}`, Icon: WhatsAppIcon },
]

export async function Footer({ locale }: { locale: Locale }) {
  const footerData = await getCachedGlobal('footer', 1, locale)()
  const siteSettings = await getCachedGlobal('site-settings', 1, locale)()
  const t = getDictionary(locale)

  const columns = [
    {
      heading: t.footer.servicesHeading,
      links: [
        { href: `/${locale}/services`, label: t.footer.allServices },
        { href: `/${locale}/portfolio`, label: t.footer.portfolio },
      ],
    },
    {
      heading: t.footer.studioHeading,
      links: [{ href: `/${locale}/kontakty`, label: t.footer.contacts }],
    },
  ]

  const navItems = footerData?.navItems || []
  const year = new Date().getFullYear()
  const phones = (siteSettings?.contactPhones || []).filter((p) => p.phone)

  return (
    <footer className="border-border/60 bg-foreground text-background mt-auto border-t">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <Logo className="[&_span:last-child]:text-background" />
          <p className="max-w-xs text-sm opacity-70">{t.footer.tagline}</p>
          {siteSettings?.address && <p className="text-sm opacity-70">{siteSettings.address}</p>}
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <span className="font-display text-sm tracking-wide uppercase opacity-60">
              {col.heading}
            </span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="link-underline w-fit text-sm opacity-90">
                {l.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <span className="font-display text-sm tracking-wide uppercase opacity-60">
            {t.footer.connectionHeading}
          </span>
          {siteSettings?.email && (
            <a href={`mailto:${siteSettings.email}`} className="link-underline w-fit text-sm opacity-90">
              {siteSettings.email}
            </a>
          )}
          {phones.map((p, i) => {
            const CarrierIcon = p.carrier && p.carrier !== 'none' ? CARRIER_ICONS[p.carrier] : null
            return (
              <a
                key={i}
                href={`tel:${p.phone?.replace(/[^+\d]/g, '')}`}
                className="link-underline flex w-fit items-center gap-2 text-sm opacity-90"
              >
                {CarrierIcon && <CarrierIcon className="h-4 w-4 shrink-0" />}
                {p.phone}
              </a>
            )
          })}
          <div className="flex items-center gap-2 pt-1">
            {MESSENGERS.map((m) => {
              const value = siteSettings?.[m.key]
              if (!value) return null
              return (
                <a
                  key={m.key}
                  href={m.href(value)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={m.key}
                  className="h-6 w-6 shrink-0 transition-transform hover:scale-110"
                >
                  <m.Icon className="h-full w-full" />
                </a>
              )
            })}
          </div>
          {navItems.map(({ link }, i) => (
            <CMSLink className="link-underline w-fit text-sm opacity-90" key={i} {...link} />
          ))}
          <BriefTrigger className="stamp bg-destructive text-primary-foreground font-display mt-2 inline-flex w-fit rounded-full px-5 py-2.5 text-sm tracking-wide uppercase">
            {t.contact.briefButton}
          </BriefTrigger>
        </div>
      </div>

      <div className="border-background/10 container flex flex-col items-center justify-between gap-3 border-t py-6 text-xs opacity-60 md:flex-row">
        <span>
          © {year} EnDesign. {t.footer.rights}
        </span>
        <span>{t.footer.madeIn}</span>
      </div>
    </footer>
  )
}

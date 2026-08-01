import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { BriefTrigger } from '@/components/BriefTrigger'
import { Reveal } from '@/components/Reveal'
import { StampBadge } from '@/components/StampBadge'
import {
  KyivstarIcon,
  LifecellIcon,
  TelegramIcon,
  ViberIcon,
  VodafoneIcon,
  WhatsAppIcon,
} from '@/components/icons/ContactIcons'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

const MESSENGERS = [
  { key: 'telegram' as const, label: 'Telegram', href: (v: string) => `https://t.me/${v}`, Icon: TelegramIcon },
  { key: 'viber' as const, label: 'Viber', href: (v: string) => `viber://chat?number=${v}`, Icon: ViberIcon },
  { key: 'whatsapp' as const, label: 'WhatsApp', href: (v: string) => `https://wa.me/${v}`, Icon: WhatsAppIcon },
]

const CARRIER_ICONS = {
  lifecell: LifecellIcon,
  kyivstar: KyivstarIcon,
  vodafone: VodafoneIcon,
}

export async function ContactSection({ locale }: { locale: Locale }) {
  const site = await getCachedGlobal('site-settings', 1, locale)()
  const t = getDictionary(locale)

  const phones = (site?.contactPhones || []).filter((p) => p.phone)

  return (
    <section className="container py-16 md:py-24">
      <Reveal>
        <StampBadge tone="crimson">{t.contact.badge}</StampBadge>
        <h1 className="font-display mt-6 max-w-2xl text-4xl md:text-6xl">{t.contact.title}</h1>
        <p className="text-muted-foreground mt-5 max-w-lg">{t.contact.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reveal delay={0.05} className="border-border/60 bg-card rounded-3xl border p-8">
          <span className="font-display text-sm tracking-wide uppercase opacity-60">
            {t.contact.phonesHeading}
          </span>
          <div className="mt-4 flex flex-col gap-3">
            {phones.length > 0 ? (
              phones.map((p, i) => {
                const CarrierIcon = p.carrier && p.carrier !== 'none' ? CARRIER_ICONS[p.carrier] : null
                return (
                  <a
                    key={i}
                    href={`tel:${p.phone?.replace(/[^+\d]/g, '')}`}
                    className="link-underline font-display flex w-fit items-center gap-3 text-2xl md:text-3xl"
                  >
                    {CarrierIcon && <CarrierIcon className="h-6 w-6 shrink-0" />}
                    {p.phone}
                  </a>
                )
              })
            ) : (
              <span className="text-muted-foreground">{t.contact.noPhone}</span>
            )}
          </div>

          {site?.email && (
            <div className="mt-8">
              <span className="font-display text-sm tracking-wide uppercase opacity-60">
                {t.contact.mailHeading}
              </span>
              <div className="mt-2">
                <a href={`mailto:${site.email}`} className="link-underline font-display w-fit text-xl">
                  {site.email}
                </a>
              </div>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="border-border/60 bg-foreground text-background rounded-3xl border p-8">
          <span className="font-display text-sm tracking-wide uppercase opacity-60">
            {t.contact.messengersHeading}
          </span>
          <div className="mt-5 flex flex-wrap gap-3">
            {MESSENGERS.map((m) => {
              const value = site?.[m.key]
              if (!value) return null
              return (
                <a
                  key={m.key}
                  href={m.href(value)}
                  target="_blank"
                  rel="noreferrer"
                  className="stamp bg-primary text-primary-foreground font-display inline-flex items-center gap-2 rounded-full py-2.5 pr-5 pl-2.5 text-sm tracking-wide uppercase"
                >
                  <m.Icon className="h-5 w-5 shrink-0" />
                  {m.label}
                </a>
              )
            })}
          </div>
          <p className="mt-8 text-sm opacity-70">{t.contact.tagline}</p>
          <BriefTrigger className="stamp bg-destructive text-primary-foreground font-display mt-6 inline-flex rounded-full px-6 py-3 text-sm tracking-wide uppercase">
            {t.contact.briefButton}
          </BriefTrigger>
        </Reveal>
      </div>
    </section>
  )
}

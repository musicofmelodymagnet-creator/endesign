import React from 'react'

import { BriefTrigger } from '@/components/BriefTrigger'
import {
  KyivstarIcon,
  LifecellIcon,
  TelegramIcon,
  ViberIcon,
  VodafoneIcon,
  WhatsAppIcon,
} from '@/components/icons/ContactIcons'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getDictionary } from '@/i18n/dictionary'
import type { Locale } from '@/i18n/config'

const MESSENGERS = [
  { key: 'telegram' as const, href: (v: string) => `https://t.me/${v}`, Icon: TelegramIcon },
  { key: 'viber' as const, href: (v: string) => `viber://chat?number=${v}`, Icon: ViberIcon },
  { key: 'whatsapp' as const, href: (v: string) => `https://wa.me/${v}`, Icon: WhatsAppIcon },
]

const CARRIER_ICONS = {
  lifecell: LifecellIcon,
  kyivstar: KyivstarIcon,
  vodafone: VodafoneIcon,
}

export async function QuickContactBar({ locale }: { locale: Locale }) {
  const site = await getCachedGlobal('site-settings', 0, locale)()
  const t = getDictionary(locale)
  const phones = (site?.contactPhones || []).filter((p) => p.phone)

  if (phones.length === 0) return null

  return (
    <div className="container">
      <div className="border-border/60 bg-card flex flex-col gap-6 rounded-3xl border p-6 md:flex-row md:flex-wrap md:items-center md:gap-8">
        <div className="flex flex-col gap-1.5">
          {phones.map((p, i) => {
            const CarrierIcon = p.carrier && p.carrier !== 'none' ? CARRIER_ICONS[p.carrier] : null
            return (
              <a
                key={i}
                href={`tel:${p.phone?.replace(/[^+\d]/g, '')}`}
                className="link-underline font-display flex w-fit items-center gap-2 text-lg"
              >
                {CarrierIcon && <CarrierIcon className="h-5 w-5 shrink-0" />}
                {p.phone}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {MESSENGERS.map((m) => {
            const value = site?.[m.key]
            if (!value) return null
            return (
              <a
                key={m.key}
                href={m.href(value)}
                target="_blank"
                rel="noreferrer"
                aria-label={m.key}
                className="flex h-9 w-9 shrink-0 items-center justify-center transition-transform hover:scale-110"
              >
                <m.Icon className="h-full w-full" />
              </a>
            )
          })}
        </div>

        <BriefTrigger className="stamp bg-destructive text-primary-foreground font-display inline-flex shrink-0 rounded-full px-6 py-3 text-sm tracking-wide uppercase md:ml-auto">
          {t.contact.briefButton}
        </BriefTrigger>
      </div>
    </div>
  )
}

import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getServicesMenu } from '@/utilities/getServicesMenu'
import React from 'react'
import type { Locale } from '@/i18n/config'

export async function Header({ locale }: { locale: Locale }) {
  const [headerData, servicesMenu] = await Promise.all([
    getCachedGlobal('header', 1, locale)(),
    getServicesMenu(locale),
  ])

  return <HeaderClient data={headerData} locale={locale} servicesMenu={servicesMenu} />
}

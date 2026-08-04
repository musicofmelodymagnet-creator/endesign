import type { Locale } from '@/i18n/config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getServerSideURL } from '@/utilities/getURL'

const COPY: Record<Locale, { description: string; addressLocality: string }> = {
  uk: {
    description:
      'Студія графічного дизайну, розробки сайтів та 3D-візуалізації в Києві.',
    addressLocality: 'Київ',
  },
  ru: {
    description:
      'Студия графического дизайна, разработки сайтов и 3D-визуализации в Киеве.',
    addressLocality: 'Киев',
  },
  en: {
    description: 'Graphic design, web development and 3D visualization studio in Kyiv.',
    addressLocality: 'Kyiv',
  },
}

function isUrl(value?: string | null): value is string {
  return Boolean(value && /^https?:\/\//i.test(value))
}

export async function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const site = await getCachedGlobal('site-settings', 0, locale)()
  const serverUrl = getServerSideURL()
  const copy = COPY[locale] || COPY.uk

  const sameAs = [site?.telegram, site?.viber, site?.whatsapp].filter(isUrl)

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'EnDesign',
    description: copy.description,
    url: `${serverUrl}/${locale}`,
    logo: `${serverUrl}/apple-touch-icon.png`,
    image: `${serverUrl}/apple-touch-icon.png`,
    address: site?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: site.address,
          addressLocality: copy.addressLocality,
          addressCountry: 'UA',
        }
      : undefined,
    email: site?.email || undefined,
    telephone: site?.contactPhones?.[0]?.phone || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }

  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

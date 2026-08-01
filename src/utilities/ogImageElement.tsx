import type { Locale } from '@/i18n/config'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

const COPY: Record<Locale, { headline: string; tagline: string }> = {
  uk: {
    headline: 'Дизайн, що продає гучніше за слова',
    tagline: 'Графічний дизайн, розробка сайтів та 3D-візуалізація · Київ',
  },
  ru: {
    headline: 'Дизайн, который продаёт громче слов',
    tagline: 'Графический дизайн, разработка сайтов и 3D-визуализация · Киев',
  },
  en: {
    headline: 'Design that speaks louder than words',
    tagline: 'Graphic design, web development & 3D visualization · Kyiv',
  },
}

export function buildOgImageElement(locale: Locale) {
  const copy = COPY[locale] || COPY.uk

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '90px',
        background: '#FBF8F2',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -140,
          right: -140,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'rgba(255,193,7,0.28)',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 56,
        }}
      >
        <svg width="96" height="96" viewBox="0 0 37 37" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.84912 18.4998C1.84912 9.30493 9.30491 1.84914 18.4998 1.84914C27.6946 1.84914 35.1504 9.30493 35.1504 18.4998C35.1504 27.6946 27.6946 35.1504 18.4998 35.1504C9.30491 35.1504 1.84912 27.6946 1.84912 18.4998Z"
            fill="#FFC107"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.65622 23.3659C3.34345 33.2221 13.5142 39.0313 23.3658 36.3441C33.2175 33.6569 39.0313 23.4861 36.3441 13.6345C33.6569 3.77822 23.4907 -2.03101 13.6345 0.65622C3.77821 3.34345 -2.03101 13.5142 0.65622 23.3659ZM2.8578 22.7646C0.503589 14.1247 5.59591 5.21202 14.2357 2.85781C22.8756 0.503589 31.7883 5.59591 34.1471 14.2358C35.6919 19.9062 34.0315 25.697 30.2666 29.67L14.0461 34.0917C8.77341 32.5792 4.40261 28.4351 2.8578 22.7646Z"
            fill="black"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.5416 4.98057L19.7256 8.07944L16.7192 8.90272L18.5092 15.4612L22.51 14.2911L23.9762 17.8478L20.239 19.684L22.4822 24.9937L26.6726 24.2306L28.3793 28.2684L15.0542 31.9037L11.7009 6.84452L18.5416 4.98057Z"
            fill="black"
          />
        </svg>
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#211D17' }}>
          En<span style={{ color: '#FFC107' }}>Design</span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          fontWeight: 700,
          color: '#211D17',
          lineHeight: 1.15,
          maxWidth: 920,
        }}
      >
        {copy.headline}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 28,
          fontSize: 30,
          color: '#5b5347',
          maxWidth: 820,
        }}
      >
        {copy.tagline}
      </div>
    </div>
  )
}

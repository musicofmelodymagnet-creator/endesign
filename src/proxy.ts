import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n/config'

function hasLocalePrefix(pathname: string): boolean {
  return locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
}

// In-memory, per-process rate limiting on the two POST endpoints most exposed
// to abuse (login brute-force, contact-form spam). This app runs as a single
// long-lived Docker container rather than a distributed serverless/edge
// fleet, so a module-level Map persists correctly across requests — it just
// resets on redeploy/restart, which is fine here (this slows down scripted
// abuse, it isn't meant to be a perfect/distributed enforcement layer).
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  '/api/users/login': { windowMs: 60_000, max: 8 },
  '/api/form-submissions': { windowMs: 60_000, max: 5 },
}

const hits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, retryAfter: 0 }
  }

  entry.count += 1
  if (entry.count > max) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  return { limited: false, retryAfter: 0 }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (request.method === 'POST' && RATE_LIMITS[pathname]) {
    const { windowMs, max } = RATE_LIMITS[pathname]
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const { limited, retryAfter } = checkRateLimit(`${pathname}:${ip}`, windowMs, max)

    if (limited) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      })
    }
  }

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/twitter-image') ||
    pathname.startsWith('/og-image') ||
    pathname.includes('.') || // static files, favicon, sitemap.xml, etc.
    hasLocalePrefix(pathname)
  ) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}

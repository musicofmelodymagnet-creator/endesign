import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
  experimental: {
    // Next 16's proxy.ts (middleware) caps request bodies at 10mb by default
    // for any request it sees — including Payload's own /api/media uploads,
    // since proxy.ts runs globally. Without this, uploading anything past
    // 10mb (e.g. the hero video) truncates the multipart body mid-upload
    // ("Unexpected end of form"). Raised to comfortably cover large source
    // video files; nginx's own client_max_body_size on the production server
    // must be >= this value too, or it'll reject the request before Next
    // ever sees it.
    proxyClientMaxBodySize: '500mb',
  },
  async headers() {
    // Safe everywhere, including /admin and /api — none of these interfere
    // with Payload's admin bundle or REST/GraphQL responses.
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ]

    // CSP is scoped to the public frontend only: Payload's admin bundle isn't
    // ours to tune (inline scripts/styles it needs aren't fully known), so a
    // site-wide policy risks breaking the CMS editors use daily. `unsafe-inline`
    // on script/style is a deliberate trade-off here rather than a nonce-based
    // policy, since Next's App Router hydration relies on inline scripts that
    // a strict script-src would need per-request nonces (a bigger, separately
    // testable change) to allow.
    const frontendCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "media-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/((?!admin|api).*)',
        headers: [...baseHeaders, { key: 'Content-Security-Policy', value: frontendCsp }],
      },
      {
        source: '/admin/:path*',
        headers: baseHeaders,
      },
      {
        source: '/api/:path*',
        headers: baseHeaders,
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

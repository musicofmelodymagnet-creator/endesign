import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Explicit aliases instead of vite-tsconfig-paths: that plugin resolves `@/*`
// by reading tsconfig.json's own `include`/`exclude`, and tsconfig.json
// excludes `tests` (on purpose, so `next build`'s type-check doesn't choke on
// test-only code) — which silently broke alias resolution for every spec
// under tests/int. Declaring the aliases directly here has no such coupling.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
  },
})

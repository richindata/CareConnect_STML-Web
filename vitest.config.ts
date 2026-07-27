import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The PWA plugin is deliberately absent here: tests stub its virtual module
// rather than registering a real service worker.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwa-register-stub.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    fileParallelism: false,
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: [
        'text',
        'text-summary',
        ['html', { subdir: 'lcov-report' }],
        'lcov',
      ],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/router.tsx',
        'src/components/PwaStatus.tsx',
        'src/test/**',
        'src/**/*.{test,spec}.{ts,tsx}',
      ],
      thresholds: {
        // Line coverage is the assignment gate (≥97%). Statement/function
        // thresholds stay tight; branch coverage is lower because of
        // defensive optional-chaining and UI ternary branches.
        lines: 97,
        functions: 96,
        branches: 80,
        statements: 96,
      },
    },
  },
})

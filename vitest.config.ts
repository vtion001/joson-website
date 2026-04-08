import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'lib/**/*.js'],
      exclude: ['node_modules', 'dist'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/e2e/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})

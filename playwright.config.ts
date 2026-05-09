import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testName}-{arg}{ext}',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
  // Dev server runs on :3000 with SKIP_AUTH=1 already set
  // No need for separate webserver process
  webServer: undefined,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})

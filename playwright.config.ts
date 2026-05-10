import { defineConfig, devices } from '@playwright/test'

const ADMIN_SESSION = "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMzODY3MTk1Nn0.bjLEZ6tjE93FboS_SO4oJCOZwT5vuzS2rV_AS-0uanI"

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testName}-{arg}{ext}',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:3001',
    // Inject admin session cookie into ALL requests (including page.request API calls)
    extraHTTPHeaders: {
      Cookie: `admin_session=${ADMIN_SESSION}`,
    },
  },
  // Dev server runs on :3000 with SKIP_AUTH=1 already set
  // No need for separate webserver process
  webServer: undefined,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})

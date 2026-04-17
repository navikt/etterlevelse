import { defineConfig, devices } from '@playwright/test'

const e2eBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100'

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: e2eBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'ENABLE_E2E_PAGES=true NEXT_PUBLIC_ENABLE_E2E_PAGES=true yarn dev --port 3100',
    env: {
      ...process.env,
      ENABLE_E2E_PAGES: 'true',
      NEXT_PUBLIC_ENABLE_E2E_PAGES: 'true',
    },
    url: e2eBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})

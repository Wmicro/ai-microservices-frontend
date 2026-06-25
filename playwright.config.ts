import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.3,
    },
  },
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000,
  },
  snapshotDir: './e2e/screenshots',
})
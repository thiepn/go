import {
  defineConfig,
} from '@playwright/test';

const externalBaseURL =
  process.env.PLAYWRIGHT_BASE_URL;
const localBaseURL =
  'http://127.0.0.1:4176/go/';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch:
    '**/accessibility-certification.e2e.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder:
          'playwright-report-c5',
        open: 'never',
      },
    ],
  ],
  use: {
    baseURL:
      externalBaseURL ??
      localBaseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-320',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 320,
          height: 800,
        },
      },
    },
    {
      name: 'firefox-320',
      use: {
        browserName: 'firefox',
        viewport: {
          width: 320,
          height: 800,
        },
      },
    },
    {
      name: 'webkit-320',
      use: {
        browserName: 'webkit',
        viewport: {
          width: 320,
          height: 800,
        },
      },
    },
    {
      name: 'chromium-forced-colors',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 1280,
          height: 800,
        },
        forcedColors: 'active',
      },
    },
    {
      name: 'chromium-reduced-motion',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 1280,
          height: 800,
        },
        reducedMotion: 'reduce',
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command:
          'npm run build && npm run preview -- --host 127.0.0.1 --port 4176',
        url: localBaseURL,
        reuseExistingServer:
          !process.env.CI,
        timeout: 120_000,
      },
});

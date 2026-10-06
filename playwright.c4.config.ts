import {
  defineConfig,
} from '@playwright/test';

const externalBaseURL =
  process.env.PLAYWRIGHT_BASE_URL;
const localBaseURL =
  'http://127.0.0.1:4174/go/';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/mobile-pwa.e2e.ts',
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
          'playwright-report-c4',
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
      name: 'android-phone',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 412,
          height: 915,
        },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'iphone-webkit',
      use: {
        browserName: 'webkit',
        viewport: {
          width: 390,
          height: 844,
        },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'ipad-webkit',
      use: {
        browserName: 'webkit',
        viewport: {
          width: 834,
          height: 1194,
        },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command:
          'npm run build && npm run preview -- --host 127.0.0.1 --port 4174',
        url: localBaseURL,
        reuseExistingServer:
          !process.env.CI,
        timeout: 120_000,
      },
});

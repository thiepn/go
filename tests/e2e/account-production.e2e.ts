import {
  expect,
  test,
} from '@playwright/test';

const live =
  process.env.C3_LIVE_BASE_URL;

test.skip(
  !live,
  'C3 public account smoke runs only against production.',
);

async function openAccount(
  page: import('@playwright/test').Page,
) {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await page.getByRole('button', {
    name: 'Account & sync',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Account & sync',
    }),
  ).toBeVisible();
}

test('signed-out production boot does not depend on an account', async ({
  page,
}) => {
  await openAccount(page);

  await expect(
    page.getByRole('button', {
      name: 'Sign in',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Export backup',
    }),
  ).toBeVisible();
});

test('Google OAuth initiation preserves the canonical return URL', async ({
  page,
}) => {
  await openAccount(page);

  let authorizeUrl: URL | null = null;

  await page.route(
    'https://hycegznamzjhwinegaai.supabase.co/auth/v1/authorize**',
    async (route) => {
      authorizeUrl = new URL(
        route.request().url(),
      );
      await route.abort();
    },
  );

  await page.getByRole('button', {
    name: 'Continue with Google',
  }).click();

  await expect
    .poll(() => authorizeUrl?.href ?? null)
    .not.toBeNull();

  expect(
    authorizeUrl?.searchParams.get(
      'provider',
    ),
  ).toBe('google');

  expect(
    authorizeUrl?.searchParams.get(
      'redirect_to',
    ),
  ).toBe('https://thiepn.dev/go/');
});

test('password reset initiation uses the canonical recovery return', async ({
  page,
}) => {
  await openAccount(page);

  let recoveryUrl: URL | null = null;

  await page.route(
    'https://hycegznamzjhwinegaai.supabase.co/auth/v1/recover**',
    async (route) => {
      recoveryUrl = new URL(
        route.request().url(),
      );

      await route.fulfill({
        status: 200,
        contentType:
          'application/json',
        body: '{}',
      });
    },
  );

  await page
    .getByLabel('Email')
    .fill(
      'c3-routing-only@example.invalid',
    );

  await page.getByRole('button', {
    name: 'Send password reset',
  }).click();

  await expect
    .poll(() => recoveryUrl?.href ?? null)
    .not.toBeNull();

  expect(
    recoveryUrl?.searchParams.get(
      'redirect_to',
    ),
  ).toBe('https://thiepn.dev/go/');

  await expect(
    page.getByRole('status'),
  ).toContainText(
    'Password-reset email sent.',
  );
});

test('portable backup survives export, local clearing, and import', async ({
  page,
}) => {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await page.evaluate(() => {
    localStorage.setItem(
      'thiepn-go:guided:first-9x9:complete',
      'true',
    );
    localStorage.setItem(
      'thiepn-go:course:go-foundations:v1',
      JSON.stringify({
        nextLessonIndex: 7,
      }),
    );
  });

  await page.getByRole('button', {
    name: 'Account & sync',
  }).click();

  const downloadPromise =
    page.waitForEvent('download');

  await page.getByRole('button', {
    name: 'Export backup',
  }).click();

  const download =
    await downloadPromise;
  const path = await download.path();

  if (!path) {
    throw new Error(
      'Backup download did not produce a local file.',
    );
  }

  const backup = JSON.parse(
    await (
      await import('node:fs/promises')
    ).readFile(path, 'utf8'),
  );

  expect(backup.format).toBe(
    'thiepn-go-backup',
  );
  expect(
    backup.state.firstGameComplete,
  ).toBe(true);
  expect(
    backup.state.courses[
      'go-foundations'
    ].nextLessonIndex,
  ).toBe(7);

  await page.evaluate(() => {
    localStorage.removeItem(
      'thiepn-go:guided:first-9x9:complete',
    );
    localStorage.removeItem(
      'thiepn-go:course:go-foundations:v1',
    );
  });

  await page
    .locator('input[type="file"]')
    .setInputFiles(path);

  await expect(
    page.getByRole('status'),
  ).toContainText(
    'Backup merged into this device.',
  );

  const restored =
    await page.evaluate(() => ({
      first:
        localStorage.getItem(
          'thiepn-go:guided:first-9x9:complete',
        ),
      course:
        localStorage.getItem(
          'thiepn-go:course:go-foundations:v1',
        ),
    }));

  expect(restored.first).toBe(
    'true',
  );
  expect(
    JSON.parse(restored.course ?? '{}')
      .nextLessonIndex,
  ).toBe(7);
});

import {
  expect,
  test,
} from '@playwright/test';
import {
  readFileSync,
} from 'node:fs';

test.skip(
  !process.env.EXPECTED_RELEASE_SHA,
  'Canonical deployment QA only runs after a production deploy.',
);

const candidate = JSON.parse(
  readFileSync(
    'certification/release-candidate.json',
    'utf8',
  ),
) as {
  candidate: string;
  canonicalPath: string;
};

test('canonical deployment serves the exact release candidate from /go/', async ({
  page,
  request,
}) => {
  const expectedSha =
    process.env.EXPECTED_RELEASE_SHA;

  if (!expectedSha) {
    throw new Error(
      'EXPECTED_RELEASE_SHA is required for canonical deployment QA.',
    );
  }

  const releaseResponse =
    await request.get('release.json');
  expect(releaseResponse.ok()).toBe(true);

  const release =
    await releaseResponse.json();

  expect(release.candidate).toBe(
    candidate.candidate,
  );
  expect(release.version).toBe(
    candidate.candidate,
  );
  expect(release.canonicalPath).toBe(
    '/go/',
  );
  expect(release.sourceCommit).toBe(
    expectedSha,
  );

  const manifestResponse =
    await request.get(
      'manifest.webmanifest',
    );
  expect(manifestResponse.ok()).toBe(
    true,
  );

  const manifest =
    await manifestResponse.json();

  expect(manifest.start_url).toBe(
    '/go/',
  );
  expect(manifest.scope).toBe('/go/');
  expect(
    manifest.icons.every(
      (icon: { src?: string }) =>
        icon.src?.startsWith('/go/'),
    ),
  ).toBe(true);

  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  expect(
    new URL(page.url()).pathname,
  ).toBe('/go/');

  await expect(
    page.getByRole('heading', {
      name: 'One stone at a time.',
    }),
  ).toBeVisible();

  const manifestHref =
    await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');
  expect(manifestHref).toBe(
    '/go/manifest.webmanifest',
  );

  const badRootAssets =
    await page.evaluate(() =>
      [...document.querySelectorAll(
        'script[src],link[href]',
      )]
        .map((element) =>
          element.getAttribute(
            element.hasAttribute('src')
              ? 'src'
              : 'href',
          ),
        )
        .filter(
          (value): value is string =>
            Boolean(value),
        )
        .filter((value) =>
          /^\/(?:assets\/|manifest\.webmanifest|icon-)/.test(
            value,
          ),
        ),
    );

  expect(badRootAssets).toEqual([]);

  await page.waitForFunction(
    async () => {
      const registrations =
        await navigator.serviceWorker
          .getRegistrations();

      return registrations.some(
        (registration) =>
          new URL(
            registration.scope,
          ).pathname === '/go/' &&
          registration.active &&
          new URL(
            registration.active.scriptURL,
          ).pathname === '/go/sw.js',
      );
    },
    undefined,
    { timeout: 20_000 },
  );

  const goRegistrations =
    await page.evaluate(async () =>
      (
        await navigator.serviceWorker
          .getRegistrations()
      )
        .map((registration) => ({
          scope: new URL(
            registration.scope,
          ).pathname,
          script: registration.active
            ? new URL(
                registration.active.scriptURL,
              ).pathname
            : null,
        }))
        .filter(
          (registration) =>
            registration.scope === '/go/',
        ),
    );

  expect(goRegistrations).toEqual([
    {
      scope: '/go/',
      script: '/go/sw.js',
    },
  ]);
});

test('canonical app refreshes and opens a lazy lesson offline', async ({
  page,
  context,
}) => {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await page.waitForFunction(
    async () => {
      const registration =
        await navigator.serviceWorker
          .getRegistration('/go/');

      return Boolean(
        registration?.active,
      );
    },
    undefined,
    { timeout: 20_000 },
  );

  if (
    !(await page.evaluate(
      () =>
        Boolean(
          navigator.serviceWorker
            .controller,
        ),
    ))
  ) {
    await page.reload({
      waitUntil: 'networkidle',
    });
  }

  await page.waitForFunction(
    () =>
      Boolean(
        navigator.serviceWorker
          .controller,
      ),
    undefined,
    { timeout: 20_000 },
  );

  await context.setOffline(true);

  await page.reload({
    waitUntil: 'domcontentloaded',
  });

  await expect(
    page.getByRole('heading', {
      name: 'One stone at a time.',
    }),
  ).toBeVisible();

  await page.getByRole('button', {
    name: 'Start learning',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Lines cross here.',
    }),
  ).toBeVisible();

  expect(
    new URL(page.url()).pathname,
  ).toBe('/go/');
});

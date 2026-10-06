import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';

const email =
  process.env.C3_TEST_EMAIL;
const password =
  process.env.C3_TEST_PASSWORD;

test.skip(
  !email || !password,
  'Dedicated C3 test credentials are required.',
);

const FIRST_GAME =
  'thiepn-go:guided:first-9x9:complete';
const COURSE =
  'thiepn-go:course:go-foundations:v1';

async function newDevice(
  browser: Browser,
  lessonIndex = 0,
): Promise<{
  context: BrowserContext;
  page: Page;
}> {
  const context =
    await browser.newContext();

  if (lessonIndex > 0) {
    await context.addInitScript(
      ({ firstGame, course, index }) => {
        localStorage.setItem(
          firstGame,
          'true',
        );
        localStorage.setItem(
          course,
          JSON.stringify({
            nextLessonIndex: index,
          }),
        );
      },
      {
        firstGame: FIRST_GAME,
        course: COURSE,
        index: lessonIndex,
      },
    );
  }

  const page = await context.newPage();

  return { context, page };
}

async function signIn(
  page: Page,
) {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await page.getByRole('button', {
    name: 'Account & sync',
  }).click();

  await page
    .getByLabel('Email')
    .fill(email!);
  await page
    .getByLabel('Password')
    .fill(password!);

  await page.getByRole('button', {
    name: 'Sign in',
  }).click();

  await expect(
    page.getByText('Signed in'),
  ).toBeVisible({
    timeout: 20_000,
  });

  await expect(
    page.getByRole('button', {
      name: 'Sync now',
    }),
  ).toBeEnabled({
    timeout: 20_000,
  });
}

async function syncNow(
  page: Page,
) {
  const button =
    page.getByRole('button', {
      name: 'Sync now',
    });

  await button.click();

  await expect(button).toBeEnabled({
    timeout: 20_000,
  });

  await expect(
    page.getByText('Needs retry'),
  ).toHaveCount(0);
}

async function courseIndex(
  page: Page,
): Promise<number> {
  return page.evaluate((key) => {
    const raw =
      localStorage.getItem(key);
    return raw
      ? Number(
          JSON.parse(raw)
            .nextLessonIndex,
        )
      : 0;
  }, COURSE);
}

async function setCourseIndex(
  page: Page,
  index: number,
) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          nextLessonIndex: value,
        }),
      );
      window.dispatchEvent(
        new CustomEvent(
          'thiepn-go:storage-write',
          { detail: { key } },
        ),
      );
    },
    { key: COURSE, value: index },
  );
}

test('dedicated account merges two devices, resyncs after offline work, signs out locally, and deletes only cloud Go data', async ({
  browser,
}) => {
  // Dedicated destructive test account: start with no Go cloud row.
  const cleanup =
    await newDevice(browser);
  await signIn(cleanup.page);

  await cleanup.page.getByRole(
    'button',
    {
      name: 'Delete cloud Go data',
    },
  ).click();
  await cleanup.page.getByRole(
    'button',
    {
      name:
        'Confirm delete cloud Go data',
    },
  ).click();

  await expect(
    cleanup.page.getByRole('status'),
  ).toContainText(
    'Cloud Go data deleted.',
  );

  await cleanup.page.getByRole(
    'button',
    {
      name: 'Sign out on this device',
    },
  ).click();
  await cleanup.context.close();

  // Device A starts with local progress and publishes it on first sign-in.
  const deviceA =
    await newDevice(browser, 6);
  await signIn(deviceA.page);
  await syncNow(deviceA.page);

  expect(
    await courseIndex(deviceA.page),
  ).toBeGreaterThanOrEqual(6);

  // Device B has newer local progress. First sign-in must merge upward.
  const deviceB =
    await newDevice(browser, 9);
  await signIn(deviceB.page);
  await syncNow(deviceB.page);

  expect(
    await courseIndex(deviceB.page),
  ).toBeGreaterThanOrEqual(9);

  await syncNow(deviceA.page);

  expect(
    await courseIndex(deviceA.page),
  ).toBeGreaterThanOrEqual(9);

  // Concurrent edits must converge monotonically rather than overwrite backward.
  await Promise.all([
    setCourseIndex(
      deviceA.page,
      10,
    ),
    setCourseIndex(
      deviceB.page,
      12,
    ),
  ]);

  await Promise.all([
    syncNow(deviceA.page),
    syncNow(deviceB.page),
  ]);

  await syncNow(deviceA.page);
  await syncNow(deviceB.page);

  expect(
    await courseIndex(deviceA.page),
  ).toBe(12);
  expect(
    await courseIndex(deviceB.page),
  ).toBe(12);

  // A prior session continues local learning while offline and resyncs later.
  await deviceA.context.setOffline(
    true,
  );
  await setCourseIndex(
    deviceA.page,
    13,
  );

  await deviceA.page.waitForTimeout(
    1_800,
  );

  await expect(
    deviceA.page.getByText(
      'Account temporarily unavailable. Local learning still works.',
    ),
  ).toBeVisible({
    timeout: 10_000,
  });

  expect(
    await courseIndex(deviceA.page),
  ).toBe(13);

  await deviceA.context.setOffline(
    false,
  );
  await deviceA.page.evaluate(() =>
    window.dispatchEvent(
      new Event('online'),
    ),
  );

  await expect(
    deviceA.page.getByText(
      'Needs retry',
    ),
  ).toHaveCount(0, {
    timeout: 20_000,
  });

  await syncNow(deviceB.page);

  expect(
    await courseIndex(deviceB.page),
  ).toBe(13);

  // Local sign-out must not sign out the other device.
  await deviceA.page.getByRole(
    'button',
    {
      name: 'Sign out on this device',
    },
  ).click();

  await expect(
    deviceA.page.getByRole(
      'button',
      { name: 'Sign in' },
    ),
  ).toBeVisible();

  await expect(
    deviceB.page.getByText(
      'Signed in',
    ),
  ).toBeVisible();

  // Go-only deletion leaves the local state and account identity intact.
  await deviceB.page.getByRole(
    'button',
    {
      name: 'Delete cloud Go data',
    },
  ).click();
  await deviceB.page.getByRole(
    'button',
    {
      name:
        'Confirm delete cloud Go data',
    },
  ).click();

  await expect(
    deviceB.page.getByRole('status'),
  ).toContainText(
    'Cloud Go data deleted.',
  );

  expect(
    await courseIndex(deviceB.page),
  ).toBe(13);

  await expect(
    deviceB.page.getByText(
      'Signed in',
    ),
  ).toBeVisible();

  await deviceA.context.close();
  await deviceB.context.close();
});

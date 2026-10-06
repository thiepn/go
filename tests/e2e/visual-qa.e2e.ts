import {
  expect,
  test,
  type Page,
} from '@playwright/test';

const preferenceKey =
  'thiepn-go:preferences:v1';
const firstGameKey =
  'thiepn-go:guided:first-9x9:complete';

async function isolateAccountNetwork(
  page: Page,
): Promise<void> {
  await page.route(
    /https:\/\/(?:thiepn\.dev|cdn\.jsdelivr\.net)\//,
    (route) => route.abort(),
  );
}

async function expectNoPageOverflow(
  page: Page,
): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth:
      document.documentElement.scrollWidth,
    clientWidth:
      document.documentElement.clientWidth,
  }));

  expect(
    metrics.scrollWidth,
    JSON.stringify(metrics),
  ).toBeLessThanOrEqual(
    metrics.clientWidth + 1,
  );
}

test.beforeEach(async ({ page }) => {
  await isolateAccountNetwork(page);
});

test('home remains readable without horizontal overflow', async ({
  page,
}) => {
  await page.goto('./');

  await expect(
    page.getByRole('heading', {
      name: 'One stone at a time.',
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Start learning',
    }),
  ).toBeVisible();

  await expectNoPageOverflow(page);
});

test('large-text high-contrast lesson remains keyboard-operable', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          sound: false,
          haptics: false,
          reduceMotion: true,
          highContrast: true,
          largeText: true,
          showCoordinates: true,
        }),
      );
    },
    { key: preferenceKey },
  );

  await page.goto('./');
  await page.getByRole('button', {
    name: 'Start learning',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Lines cross here.',
    }),
  ).toBeVisible();

  await expectNoPageOverflow(page);

  await page.getByRole('button', {
    name: 'Continue',
  }).click();

  const board = page.getByRole('group', {
    name: /Your first stone: Place your first stone/,
  });

  await expect(board).toBeVisible();
  await expect(board).toHaveAttribute(
    'aria-keyshortcuts',
    /ArrowLeft.*Enter.*Space/,
  );

  await board.focus();
  await page.keyboard.press('Home');
  await expect(
    page.getByText('A5, empty.', {
      exact: true,
    }),
  ).toBeAttached();

  await page.keyboard.press('End');
  await expect(
    page.getByText('E1, empty.', {
      exact: true,
    }),
  ).toBeAttached();

  await expectNoPageOverflow(page);
});

test('19x19 play uses one hit surface and contained precision zoom', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify(true),
      );
    },
    { key: firstGameKey },
  );

  await page.goto('./');
  await page.getByRole('button', {
    name: 'Play',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Play a real game.',
    }),
  ).toBeVisible();

  await page.getByRole('button', {
    name: '19×19',
  }).click();
  await page.getByRole('button', {
    name: 'Start 19×19 game',
  }).click();

  await expect(
    page.getByRole('group', {
      name: 'Independent Go game',
    }),
  ).toBeVisible();

  await expect(
    page.locator('.go-board__target-surface'),
  ).toHaveCount(1);
  await expect(
    page.locator('.go-board__target'),
  ).toHaveCount(0);

  await expectNoPageOverflow(page);

  await page.getByRole('button', {
    name: 'Precision zoom',
  }).click();

  const viewport = page.locator(
    '.go-board-viewport',
  );
  const dimensions = await viewport.evaluate(
    (element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }),
  );

  expect(
    dimensions.scrollWidth,
  ).toBeGreaterThan(
    dimensions.clientWidth,
  );

  await expectNoPageOverflow(page);
});

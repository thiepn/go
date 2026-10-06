import {
  expect,
  test,
  type Page,
} from '@playwright/test';

const firstGameKey =
  'thiepn-go:guided:first-9x9:complete';
const courseKey =
  'thiepn-go:course:go-foundations:v1';

async function expectNoHorizontalOverflow(
  page: Page,
) {
  const metrics =
    await page.evaluate(() => ({
      scrollWidth:
        document.documentElement
          .scrollWidth,
      clientWidth:
        document.documentElement
          .clientWidth,
    }));

  expect(
    metrics.scrollWidth,
    JSON.stringify(metrics),
  ).toBeLessThanOrEqual(
    metrics.clientWidth + 1,
  );
}

async function ensureOfflineControl(
  page: Page,
) {
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
    { timeout: 25_000 },
  );

  const controlled =
    await page.evaluate(() =>
      Boolean(
        navigator.serviceWorker
          .controller,
      ),
    );

  if (!controlled) {
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
    { timeout: 25_000 },
  );
}

test('mobile shell respects safe areas and rotation without overflow', async ({
  page,
}, testInfo) => {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await page.evaluate(() => {
    const root =
      document.documentElement;

    root.style.setProperty(
      '--safe-area-top',
      '31px',
    );
    root.style.setProperty(
      '--safe-area-right',
      '13px',
    );
    root.style.setProperty(
      '--safe-area-bottom',
      '27px',
    );
    root.style.setProperty(
      '--safe-area-left',
      '11px',
    );
  });

  const safeArea =
    await page.evaluate(() => {
      const body =
        getComputedStyle(
          document.body,
        );
      const main =
        document.querySelector(
          '#root > main',
        );

      if (!main) {
        throw new Error(
          'Top-level app main missing.',
        );
      }

      const rect =
        main.getBoundingClientRect();

      return {
        paddingTop:
          body.paddingTop,
        paddingRight:
          body.paddingRight,
        paddingBottom:
          body.paddingBottom,
        paddingLeft:
          body.paddingLeft,
        mainTop: rect.top,
        mainLeft: rect.left,
        mainRight: rect.right,
        viewportWidth:
          window.innerWidth,
      };
    });

  expect(safeArea.paddingTop)
    .toBe('31px');
  expect(safeArea.paddingRight)
    .toBe('13px');
  expect(safeArea.paddingBottom)
    .toBe('27px');
  expect(safeArea.paddingLeft)
    .toBe('11px');
  expect(safeArea.mainTop)
    .toBeGreaterThanOrEqual(31);
  expect(safeArea.mainLeft)
    .toBeGreaterThanOrEqual(11);
  expect(safeArea.mainRight)
    .toBeLessThanOrEqual(
      safeArea.viewportWidth - 13,
    );

  await expectNoHorizontalOverflow(
    page,
  );

  const tablet =
    testInfo.project.name
      .includes('ipad');

  await page.setViewportSize(
    tablet
      ? {
          width: 1194,
          height: 834,
        }
      : {
          width: 844,
          height: 390,
        },
  );

  await expect(
    page.getByRole('heading', {
      name: 'One stone at a time.',
    }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );
});

test('production service worker survives an offline cold app launch with local progress', async ({
  page,
  context,
}) => {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await ensureOfflineControl(page);

  await page.evaluate(
    ({ firstGame, course }) => {
      localStorage.setItem(
        firstGame,
        'true',
      );
      localStorage.setItem(
        course,
        JSON.stringify({
          nextLessonIndex: 6,
        }),
      );
    },
    {
      firstGame: firstGameKey,
      course: courseKey,
    },
  );

  const url = page.url();
  await page.close();
  await context.setOffline(true);

  const offlinePage =
    await context.newPage();

  await offlinePage.goto(url, {
    waitUntil:
      'domcontentloaded',
  });

  await expect(
    offlinePage.getByRole(
      'heading',
      {
        name:
          'One stone at a time.',
      },
    ),
  ).toBeVisible();

  await expect(
    offlinePage.getByRole(
      'button',
      {
        name:
          'Continue developing',
      },
    ),
  ).toBeVisible();

  const durable =
    await offlinePage.evaluate(
      ({ firstGame, course }) => ({
        first:
          localStorage.getItem(
            firstGame,
          ),
        course:
          localStorage.getItem(
            course,
          ),
      }),
      {
        firstGame: firstGameKey,
        course: courseKey,
      },
    );

  expect(durable.first).toBe(
    'true',
  );
  expect(
    JSON.parse(
      durable.course ?? '{}',
    ).nextLessonIndex,
  ).toBe(6);

  await offlinePage
    .getByRole('button', {
      name:
        'Continue developing',
    })
    .click();

  await expect(
    offlinePage.locator(
      '.lesson-shell',
    ),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    offlinePage,
  );
});

test('device settings expose PWA launch and offline status', async ({
  page,
}) => {
  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await ensureOfflineControl(page);

  await page.getByRole('button', {
    name:
      'Device & accessibility settings',
  }).click();

  await expect(
    page.getByRole('heading', {
      name:
        'Device & accessibility',
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      'Launch mode',
      { exact: true },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      'Browser tab',
      { exact: true },
    ),
  ).toBeVisible();

  await expect(
    page.getByText(
      /Offline cache is active|Offline cache is installed/,
    ),
  ).toBeVisible();

  await expectNoHorizontalOverflow(
    page,
  );
});

for (const size of [
  9,
  13,
  19,
] as const) {
  test(`${size}×${size} board accepts touch without page overflow`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key }) => {
        localStorage.setItem(
          key,
          'true',
        );
      },
      {
        key: firstGameKey,
      },
    );

    await page.goto('./');

    await page.getByRole(
      'button',
      { name: 'Play' },
    ).click();

    await page.getByRole(
      'button',
      {
        name:
          `${size}×${size}`,
      },
    ).click();

    await page.getByRole(
      'button',
      {
        name:
          `Start ${size}×${size} game`,
      },
    ).click();

    const board =
      page.getByRole('group', {
        name:
          'Independent Go game',
      });

    await expect(board)
      .toBeVisible();

    const box =
      await board.boundingBox();

    if (!box) {
      throw new Error(
        'Board has no touchable box.',
      );
    }

    await page.touchscreen.tap(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );

    await expect
      .poll(() =>
        page.locator(
          '.go-stone',
        ).count(),
      )
      .toBeGreaterThan(0);

    await expectNoHorizontalOverflow(
      page,
    );

    if (size >= 13) {
      await page.getByRole(
        'button',
        {
          name: 'Precision zoom',
        },
      ).click();

      const viewport =
        page.locator(
          '.go-board-viewport',
        );
      const dimensions =
        await viewport.evaluate(
          (element) => ({
            scrollWidth:
              element.scrollWidth,
            clientWidth:
              element.clientWidth,
          }),
        );

      expect(
        dimensions.scrollWidth,
      ).toBeGreaterThan(
        dimensions.clientWidth,
      );

      await expectNoHorizontalOverflow(
        page,
      );
    }
  });
}

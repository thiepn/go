import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test';

const preferenceKey =
  'thiepn-go:preferences:v1';
const firstGameKey =
  'thiepn-go:guided:first-9x9:complete';

async function expectNoPageOverflow(
  page: Page,
) {
  const dimensions =
    await page.evaluate(() => ({
      width:
        document.documentElement
          .clientWidth,
      scroll:
        document.documentElement
          .scrollWidth,
    }));

  expect(
    dimensions.scroll,
    JSON.stringify(dimensions),
  ).toBeLessThanOrEqual(
    dimensions.width + 1,
  );
}

async function tabUntil(
  page: Page,
  target: Locator,
  maxTabs = 40,
) {
  for (
    let index = 0;
    index < maxTabs;
    index += 1
  ) {
    await page.keyboard.press('Tab');

    const focused =
      await target
        .evaluate(
          (element) =>
            element ===
            document.activeElement,
        )
        .catch(() => false);

    if (focused) {
      return;
    }
  }

  throw new Error(
    'Keyboard focus did not reach the requested control.',
  );
}

function durationsAreNearZero(
  value: string,
): boolean {
  return value
    .split(',')
    .map((part) =>
      Number.parseFloat(
        part.trim(),
      ),
    )
    .every(
      (seconds) =>
        Number.isFinite(seconds) &&
        seconds <= 0.001,
    );
}

test('320 CSS px reflow preserves the fresh-learning interface with larger text and higher contrast', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.endsWith(
      '-320',
    ),
    'Reflow runs only in 320 CSS px projects.',
  );

  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          sound: false,
          haptics: false,
          reduceMotion: false,
          highContrast: true,
          largeText: true,
          showCoordinates: true,
        }),
      );
    },
    { key: preferenceKey },
  );

  await page.goto('./', {
    waitUntil: 'networkidle',
  });

  await expect(
    page.getByRole('heading', {
      name:
        'One stone at a time.',
    }),
  ).toBeVisible();
  await expectNoPageOverflow(page);

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

  await expect(
    page.getByRole('group', {
      name:
        /Your first stone/,
    }),
  ).toBeVisible();
  await expectNoPageOverflow(page);

  const rootFontSize =
    await page.evaluate(() =>
      Number.parseFloat(
        getComputedStyle(
          document.documentElement,
        ).fontSize,
      ),
    );

  expect(rootFontSize)
    .toBeGreaterThanOrEqual(18);
});

test('320 CSS px reflow preserves post-beginner play and precision-board containment', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.endsWith(
      '-320',
    ),
    'Reflow runs only in 320 CSS px projects.',
  );

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
  await expectNoPageOverflow(page);

  await page.getByRole('button', {
    name: '19×19',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name:
      'Start 19×19 game',
  }).click();

  await expect(
    page.getByRole('group', {
      name:
        'Independent Go game',
    }),
  ).toBeVisible();

  await expectNoPageOverflow(page);

  const zoom =
    page.getByRole('button', {
      name: 'Precision zoom',
    });

  if (
    (await zoom.count()) > 0
  ) {
    await zoom.click();

    const viewport =
      page.locator(
        '.go-board-viewport',
      );
    const dimensions =
      await viewport.evaluate(
        (element) => ({
          width:
            element.clientWidth,
          scroll:
            element.scrollWidth,
        }),
      );

    expect(
      dimensions.scroll,
    ).toBeGreaterThan(
      dimensions.width,
    );

    await expectNoPageOverflow(
      page,
    );
  }
});

test('keyboard-only learner can enter a lesson, operate the board, and receive board status', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !==
      'chromium-320',
    'Keyboard core journey is certified once in the Chromium 320px profile.',
  );

  await page.goto('./');

  const start =
    page.getByRole('button', {
      name: 'Start learning',
    });
  await tabUntil(page, start);
  await page.keyboard.press(
    'Enter',
  );

  await expect(
    page.getByRole('heading', {
      name: 'Lines cross here.',
    }),
  ).toBeVisible();

  const continueButton =
    page.getByRole('button', {
      name: 'Continue',
    });

  await tabUntil(
    page,
    continueButton,
  );
  await page.keyboard.press(
    'Enter',
  );

  const board =
    page.getByRole('group', {
      name:
        /Your first stone/,
    });

  await tabUntil(page, board);

  await expect(board)
    .toHaveAttribute(
      'aria-roledescription',
      'interactive Go board',
    );
  await expect(board)
    .toHaveAttribute(
      'aria-keyshortcuts',
      /ArrowLeft.*Enter.*Space/,
    );

  const describedBy =
    await board.getAttribute(
      'aria-describedby',
    );
  expect(describedBy)
    .toBeTruthy();

  const instructions =
    page.locator(
      `#${describedBy}`,
    );

  await expect(instructions)
    .toContainText(
      'Arrow keys move the board cursor.',
    );

  await page.keyboard.press(
    'ArrowLeft',
  );

  await expect(
    board.locator(
      '[aria-hidden="true"]',
    ).first(),
  ).toBeAttached();

  const live =
    board.locator(
      '[aria-live="polite"]',
    );

  await expect(live)
    .toContainText(
      'B3, empty.',
    );

  await page.keyboard.press(
    'ArrowRight',
  );
  await page.keyboard.press(
    'Enter',
  );

  await expect
    .poll(() =>
      page.locator(
        '.go-stone',
      ).count(),
    )
    .toBeGreaterThan(0);

  await expectNoPageOverflow(
    page,
  );
});

test('keyboard-only learner can start independent play and place a move', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !==
      'chromium-320',
    'Keyboard independent-play journey is certified once in the Chromium profile.',
  );

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

  const play =
    page.getByRole('button', {
      name: 'Play',
    });
  await tabUntil(page, play);
  await page.keyboard.press(
    'Enter',
  );

  const size =
    page.getByRole('button', {
      name: '9×9',
      exact: true,
    });
  await tabUntil(page, size);
  await page.keyboard.press(
    'Enter',
  );

  const start =
    page.getByRole('button', {
      name: 'Start 9×9 game',
    });
  await tabUntil(page, start);
  await page.keyboard.press(
    'Enter',
  );

  const board =
    page.getByRole('group', {
      name:
        'Independent Go game',
    });
  await tabUntil(page, board);
  await page.keyboard.press(
    'Enter',
  );

  await expect
    .poll(() =>
      page.locator(
        '.go-stone',
      ).count(),
    )
    .toBeGreaterThan(0);
});

test('forced-colors mode keeps board structure and focus explicit', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !==
      'chromium-forced-colors',
    'Forced-colors runs in its dedicated Chromium project.',
  );

  await page.goto('./');
  await page.getByRole('button', {
    name: 'Start learning',
  }).click();
  await page.getByRole('button', {
    name: 'Continue',
  }).click();

  expect(
    await page.evaluate(() =>
      matchMedia(
        '(forced-colors: active)',
      ).matches,
    ),
  ).toBe(true);

  const board =
    page.getByRole('group', {
      name:
        /Your first stone/,
    });

  await board.focus();

  const styles =
    await page.evaluate(() => {
      const shell =
        document.querySelector(
          '.go-board-shell',
        );
      const surface =
        document.querySelector(
          '.go-board__surface',
        );
      const grid =
        document.querySelector(
          '.go-board__grid',
        );

      if (
        !shell ||
        !surface ||
        !grid
      ) {
        throw new Error(
          'Forced-colors board fixture missing.',
        );
      }

      const shellStyle =
        getComputedStyle(shell);
      const surfaceStyle =
        getComputedStyle(surface);
      const gridStyle =
        getComputedStyle(grid);

      return {
        forcedColorAdjust:
          shellStyle
            .getPropertyValue(
              'forced-color-adjust',
            ),
        outlineWidth:
          Number.parseFloat(
            shellStyle
              .outlineWidth,
          ),
        surfaceFilter:
          surfaceStyle.filter,
        surfaceStrokeWidth:
          Number.parseFloat(
            surfaceStyle
              .getPropertyValue(
                'stroke-width',
              ),
          ),
        gridStroke:
          gridStyle
            .getPropertyValue(
              'stroke',
            ),
      };
    });

  expect(
    styles.forcedColorAdjust,
  ).toBe('none');
  expect(
    styles.outlineWidth,
  ).toBeGreaterThanOrEqual(3);
  expect(
    styles.surfaceFilter,
  ).toBe('none');
  expect(
    styles.surfaceStrokeWidth,
  ).toBeGreaterThanOrEqual(4);
  expect(
    styles.gridStroke,
  ).not.toBe('none');
});

test('reduced-motion preference collapses UI and stone motion', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !==
      'chromium-reduced-motion',
    'Reduced-motion runs in its dedicated Chromium project.',
  );

  await page.goto('./');

  expect(
    await page.evaluate(() =>
      matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches,
    ),
  ).toBe(true);

  const transition =
    await page
      .getByRole('button', {
        name: 'Start learning',
      })
      .evaluate(
        (element) =>
          getComputedStyle(
            element,
          ).transitionDuration,
      );

  expect(
    durationsAreNearZero(
      transition,
    ),
  ).toBe(true);

  await page.getByRole('button', {
    name: 'Start learning',
  }).click();
  await page.getByRole('button', {
    name: 'Continue',
  }).click();

  const board =
    page.getByRole('group', {
      name:
        /Your first stone/,
    });

  await board.focus();
  await page.keyboard.press(
    'Enter',
  );

  const stone =
    page.locator(
      '.go-stone',
    ).first();

  await expect(stone)
    .toBeAttached();

  const animation =
    await stone.evaluate(
      (element) => ({
        name:
          getComputedStyle(
            element,
          ).animationName,
        duration:
          getComputedStyle(
            element,
          ).animationDuration,
      }),
    );

  expect(
    animation.name === 'none' ||
      durationsAreNearZero(
        animation.duration,
      ),
  ).toBe(true);
});

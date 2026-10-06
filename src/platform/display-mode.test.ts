import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  displayModeLabel,
  resolveDisplayMode,
} from './display-mode';

describe('PWA display mode', () => {
  it('recognizes iOS standalone launch without a display-mode media match', () => {
    expect(
      resolveDisplayMode({
        standalone: false,
        minimalUi: false,
        fullscreen: false,
        iosStandalone: true,
      }),
    ).toBe('standalone');
  });

  it('prefers the strongest active installed display mode', () => {
    expect(
      resolveDisplayMode({
        standalone: true,
        minimalUi: true,
        fullscreen: true,
        iosStandalone: false,
      }),
    ).toBe('fullscreen');
  });

  it('falls back to a normal browser tab', () => {
    expect(
      displayModeLabel(
        resolveDisplayMode({
          standalone: false,
          minimalUi: false,
          fullscreen: false,
          iosStandalone: false,
        }),
      ),
    ).toBe('Browser tab');
  });
});

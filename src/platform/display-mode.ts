export type AppDisplayMode =
  | 'browser'
  | 'standalone'
  | 'minimal-ui'
  | 'fullscreen';

export interface DisplayModeSignals {
  readonly standalone: boolean;
  readonly minimalUi: boolean;
  readonly fullscreen: boolean;
  readonly iosStandalone: boolean;
}

export function resolveDisplayMode(
  signals: DisplayModeSignals,
): AppDisplayMode {
  if (signals.fullscreen) {
    return 'fullscreen';
  }

  if (
    signals.standalone ||
    signals.iosStandalone
  ) {
    return 'standalone';
  }

  if (signals.minimalUi) {
    return 'minimal-ui';
  }

  return 'browser';
}

export function detectDisplayMode(): AppDisplayMode {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined'
  ) {
    return 'browser';
  }

  const iosNavigator =
    navigator as Navigator & {
      readonly standalone?: boolean;
    };

  return resolveDisplayMode({
    standalone: window.matchMedia(
      '(display-mode: standalone)',
    ).matches,
    minimalUi: window.matchMedia(
      '(display-mode: minimal-ui)',
    ).matches,
    fullscreen: window.matchMedia(
      '(display-mode: fullscreen)',
    ).matches,
    iosStandalone:
      iosNavigator.standalone === true,
  });
}

export function displayModeLabel(
  mode: AppDisplayMode,
): string {
  switch (mode) {
    case 'standalone':
      return 'Installed app';
    case 'minimal-ui':
      return 'Minimal browser UI';
    case 'fullscreen':
      return 'Fullscreen app';
    default:
      return 'Browser tab';
  }
}

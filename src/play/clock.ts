import type {
  ClockPreset,
} from './types';

export interface ClockState {
  readonly black: number | null;
  readonly white: number | null;
}

export function clockSeconds(
  preset: ClockPreset,
): number | null {
  switch (preset) {
    case 'untimed':
      return null;
    case '10m':
      return 10 * 60;
    case '20m':
      return 20 * 60;
  }
}

export function createClockState(
  preset: ClockPreset,
): ClockState {
  const seconds = clockSeconds(preset);
  return {
    black: seconds,
    white: seconds,
  };
}

export function formatClock(
  seconds: number | null,
): string {
  if (seconds === null) return 'Untimed';

  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;

  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

import { describe, expect, it } from 'vitest';

import {
  clockSeconds,
  createClockState,
  formatClock,
} from './clock';

describe('play clocks', () => {
  it('defaults to no running time for untimed games', () => {
    expect(createClockState('untimed')).toEqual({
      black: null,
      white: null,
    });
  });

  it('supports simple absolute beginner clocks', () => {
    expect(clockSeconds('10m')).toBe(600);
    expect(clockSeconds('20m')).toBe(1200);
    expect(formatClock(600)).toBe('10:00');
    expect(formatClock(9)).toBe('0:09');
  });
});

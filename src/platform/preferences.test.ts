import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
} from './preferences';

describe('platform preferences', () => {
  it('uses conservative defaults for unknown data', () => {
    expect(normalizePreferences(null)).toEqual(
      DEFAULT_PREFERENCES,
    );
  });

  it('preserves known booleans and repairs missing fields', () => {
    expect(
      normalizePreferences({
        sound: true,
        haptics: false,
      }),
    ).toEqual({
      sound: true,
      haptics: false,
      reduceMotion: false,
    });
  });
});

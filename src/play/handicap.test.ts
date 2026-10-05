import { describe, expect, it } from 'vitest';

import {
  effectiveKomi,
  handicapPoints,
} from './handicap';

describe('handicap setup', () => {
  it('places standard four-corner handicap stones on 19x19', () => {
    expect(handicapPoints(19, 4)).toEqual([
      { x: 3, y: 3 },
      { x: 15, y: 3 },
      { x: 3, y: 15 },
      { x: 15, y: 15 },
    ]);
  });

  it('uses the 3-3 star distance on 9x9', () => {
    expect(handicapPoints(9, 2)).toEqual([
      { x: 6, y: 2 },
      { x: 2, y: 6 },
    ]);
  });

  it('reduces komi when fixed handicap stones are used', () => {
    expect(effectiveKomi(0, 6.5)).toBe(6.5);
    expect(effectiveKomi(2, 6.5)).toBe(0.5);
  });
});

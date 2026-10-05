import { describe, expect, it } from 'vitest';

import {
  kataGoToPoint,
  pointToKataGo,
} from './coordinates';

describe('KataGo coordinates', () => {
  it('uses Go columns that skip I and board-relative rows', () => {
    expect(
      pointToKataGo(
        { x: 0, y: 0 },
        9,
      ),
    ).toBe('A9');

    expect(
      pointToKataGo(
        { x: 8, y: 8 },
        9,
      ),
    ).toBe('J1');
  });

  it('round-trips points and pass', () => {
    expect(
      kataGoToPoint('D4', 9),
    ).toEqual({ x: 3, y: 5 });

    expect(
      kataGoToPoint('pass', 19),
    ).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import {
  pointToSgf,
  sgfToPoint,
} from './coordinates';

describe('SGF coordinates', () => {
  it('round-trips board points', () => {
    expect(
      sgfToPoint(
        pointToSgf({ x: 15, y: 3 }),
        19,
      ),
    ).toEqual({ x: 15, y: 3 });
  });

  it('uses an empty value for pass', () => {
    expect(sgfToPoint('', 19)).toBeNull();
  });

  it('rejects points outside the board', () => {
    expect(() =>
      sgfToPoint('jj', 9),
    ).toThrow(/outside/);
  });
});

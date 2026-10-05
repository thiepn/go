import { describe, expect, it } from 'vitest';

import { createGame, scoreArea } from '.';

describe('area scoring', () => {
  it('counts stones plus exclusively surrounded empty intersections', () => {
    const game = createGame({
      size: 3,
      rules: { komi: 0 },
      setup: {
        black: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
        ],
      },
    });

    const score = scoreArea(game.board, 0);

    expect(score.stones.black).toBe(8);
    expect(score.territory.black).toBe(1);
    expect(score.total.black).toBe(9);
    expect(score.winner).toBe('black');
  });

  it('leaves an empty region neutral when it borders both colors', () => {
    const game = createGame({
      size: 3,
      rules: { komi: 0 },
      setup: {
        black: [{ x: 0, y: 0 }],
        white: [{ x: 2, y: 2 }],
      },
    });

    const score = scoreArea(game.board, 0);

    expect(score.neutral).toBe(7);
    expect(score.total.black).toBe(1);
    expect(score.total.white).toBe(1);
    expect(score.winner).toBe('draw');
  });
});

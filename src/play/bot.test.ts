import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
} from '../go/engine';
import {
  chooseBotMove,
} from './bot';

describe('beginner bot', () => {
  it('returns a legal deterministic move from an empty board', () => {
    const game = createGame({ size: 9 });
    const first = chooseBotMove(game, '20k');
    const second = chooseBotMove(game, '20k');

    expect(second).toEqual(first);
    expect(first.type).toBe('play');

    if (first.type === 'play') {
      expect(playMove(game, first.point).ok).toBe(true);
    }
  });

  it('takes an immediate capture at 15k', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
        white: [{ x: 2, y: 2 }],
      },
    });

    expect(chooseBotMove(game, '15k')).toEqual({
      type: 'play',
      point: { x: 2, y: 3 },
    });
  });

  it('values escaping a one-liberty group', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [{ x: 2, y: 2 }],
        white: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
      },
    });

    expect(chooseBotMove(game, '15k')).toEqual({
      type: 'play',
      point: { x: 2, y: 3 },
    });
  });
});

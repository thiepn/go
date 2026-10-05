import { describe, expect, it } from 'vitest';

import { createGame } from '../go/engine';
import { inspectPosition } from './analysis';

describe('guided position signals', () => {
  it('finds learner groups in atari and available captures', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [{ x: 1, y: 1 }],
        white: [
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 2, y: 1 },
          { x: 3, y: 3 },
        ],
      },
    });

    const signals = inspectPosition(game, 'black');

    expect(signals.learnerAtariGroups).toHaveLength(1);
    expect(signals.captureMoves).toEqual([]);
  });

  it('finds a move that captures an opponent stone in atari', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 1 },
        ],
        white: [{ x: 2, y: 2 }],
      },
    });

    const signals = inspectPosition(game, 'black');

    expect(signals.opponentAtariGroups).toHaveLength(1);
    expect(signals.captureMoves).toContainEqual({ x: 2, y: 3 });
  });
});

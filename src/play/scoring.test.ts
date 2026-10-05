import { describe, expect, it } from 'vitest';

import { createGame } from '../go/engine';
import {
  boardWithoutDeadStones,
  toggleDeadGroup,
} from './scoring';

describe('scoring confirmation', () => {
  it('marks and unmarks an entire connected group', () => {
    const game = createGame({
      size: 5,
      setup: {
        white: [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    });

    const marked = toggleDeadGroup(
      game.board,
      [],
      { x: 2, y: 2 },
    );

    expect(marked).toHaveLength(2);
    expect(marked).toContainEqual({ x: 2, y: 2 });
    expect(marked).toContainEqual({ x: 2, y: 3 });

    const restored = toggleDeadGroup(
      game.board,
      marked,
      { x: 2, y: 3 },
    );

    expect(restored).toEqual([]);
  });

  it('removes only confirmed dead stones for final counting', () => {
    const game = createGame({
      size: 5,
      setup: {
        black: [{ x: 0, y: 0 }],
        white: [{ x: 2, y: 2 }],
      },
    });

    const board = boardWithoutDeadStones(
      game.board,
      [{ x: 2, y: 2 }],
    );

    expect(board.intersections.filter(Boolean)).toHaveLength(1);
  });
});

import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createGame,
} from '../go/engine';
import {
  boardWithoutDeadStones,
  scoreConfirmedPosition,
  toggleDeadGroup,
} from './scoring';

describe('C6 end-game integrity', () => {
  it('removes a confirmed dead group as a whole and scores the resulting area', () => {
    const game = createGame({
      size: 5,
      rules: {
        komi: 0,
      },
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
        white: [
          { x: 1, y: 1 },
          { x: 4, y: 4 },
        ],
      },
    });

    const dead =
      toggleDeadGroup(
        game.board,
        [],
        { x: 1, y: 1 },
      );

    expect(dead).toEqual([
      { x: 1, y: 1 },
    ]);

    const stripped =
      boardWithoutDeadStones(
        game.board,
        dead,
      );

    expect(
      stripped.intersections.filter(
        (stone) =>
          stone === 'white',
      ),
    ).toHaveLength(1);

    const score =
      scoreConfirmedPosition(
        game.board,
        0,
        dead,
      );

    expect(
      score.territory.black,
    ).toBeGreaterThan(0);
    expect(
      score.total.black,
    ).toBeGreaterThan(
      score.total.white,
    );
  });

  it('never mutates the original board while previewing dead-stone removal', () => {
    const game = createGame({
      size: 5,
      setup: {
        white: [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    });

    const before =
      [...game.board.intersections];
    const dead =
      toggleDeadGroup(
        game.board,
        [],
        { x: 2, y: 2 },
      );

    boardWithoutDeadStones(
      game.board,
      dead,
    );

    expect(
      game.board.intersections,
    ).toEqual(before);
  });
});

import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
} from '../go/engine';
import {
  atariGroupsFor,
  captureOpportunities,
  friendlyGroupsAdjacentTo,
  rescueMovesForGroup,
} from './signals';

describe('review tactical signals', () => {
  it('finds immediate captures', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
        white: [
          { x: 2, y: 2 },
        ],
      },
    });

    expect(captureOpportunities(game)).toEqual([
      {
        point: { x: 2, y: 3 },
        captured: 1,
      },
    ]);
  });

  it('finds legal rescue moves for a group in atari', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 2, y: 2 },
        ],
        white: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
      },
    });

    const atari = atariGroupsFor(
      game,
      'black',
    );

    expect(atari).toHaveLength(1);
    expect(
      rescueMovesForGroup(
        game,
        atari[0].stones,
      ),
    ).toContainEqual({ x: 2, y: 3 });
  });

  it('recognizes a point adjacent to two distinct friendly groups', () => {
    const game = createGame({
      size: 5,
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
        ],
      },
    });

    expect(
      friendlyGroupsAdjacentTo(
        game.board,
        { x: 2, y: 2 },
        'black',
      ),
    ).toBe(2);

    const connected = playMove(
      game,
      { x: 2, y: 2 },
    );

    expect(connected.ok).toBe(true);
  });
});

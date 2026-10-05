import { describe, expect, it } from 'vitest';

import type {
  SavedGameRecord,
} from '../play/types';
import {
  buildForcedMoveQuery,
  buildKataGoGameQuery,
} from './request';

const record: SavedGameRecord = {
  id: 'game-1',
  playedAt: 100,
  settings: {
    mode: 'computer',
    boardSize: 9,
    humanColor: 'white',
    botLevel: '25k',
    handicap: 2,
    komi: 0.5,
    assistanceLevel: 'independent',
    clock: 'untimed',
  },
  moves: [
    {
      type: 'play',
      player: 'white',
      point: { x: 4, y: 4 },
      captured: [],
    },
    {
      type: 'pass',
      player: 'black',
    },
  ],
  result: {
    type: 'resign',
    winner: 'white',
    resignedBy: 'black',
  },
  captures: {
    black: 0,
    white: 0,
  },
};

describe('KataGo request builder', () => {
  it('preserves handicap, komi, history, requested turn, policy and ownership', () => {
    const query =
      buildKataGoGameQuery(
        record,
        [0, 1],
        {
          maxVisits: 321,
          humanProfile: 'rank_20k',
        },
      );

    expect(query.initialStones).toHaveLength(2);
    expect(query.initialPlayer).toBe('W');
    expect(query.moves).toEqual([
      ['W', 'E5'],
      ['B', 'pass'],
    ]);
    expect(query.rules).toBe('chinese');
    expect(query.komi).toBe(0.5);
    expect(query.whiteHandicapBonus).toBe(0);
    expect(query.analyzeTurns).toEqual([0, 1]);
    expect(query.maxVisits).toBe(321);
    expect(query.includeOwnership).toBe(true);
    expect(query.includePolicy).toBe(true);
    expect(
      query.overrideSettings?.humanSLProfile,
    ).toBe('rank_20k');
  });

  it('forces the played move at root when a normal search omitted it', () => {
    const query =
      buildForcedMoveQuery(
        record,
        1,
        { maxVisits: 500 },
      );

    expect(query?.moves).toEqual([]);
    expect(query?.analyzeTurns).toEqual([0]);
    expect(query?.allowMoves).toEqual([
      {
        player: 'W',
        moves: ['E5'],
        untilDepth: 1,
      },
    ]);
    expect(query?.maxVisits).toBe(300);
  });
});

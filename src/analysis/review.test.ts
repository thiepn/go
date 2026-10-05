import { describe, expect, it } from 'vitest';

import type {
  SavedGameRecord,
} from '../play/types';
import {
  analyzeSavedGameMove,
} from './review';
import type {
  KataGoProvider,
  KataGoQuery,
  KataGoResponseRaw,
} from './types';

const record: SavedGameRecord = {
  id: 'g1',
  playedAt: 100,
  settings: {
    mode: 'local',
    boardSize: 9,
    humanColor: 'black',
    botLevel: '25k',
    handicap: 0,
    komi: 6.5,
    assistanceLevel: 'independent',
    clock: 'untimed',
  },
  moves: [
    {
      type: 'play',
      player: 'black',
      point: { x: 2, y: 2 },
      captured: [],
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

class Provider implements KataGoProvider {
  public readonly queries: KataGoQuery[] = [];

  public async analyze(
    query: KataGoQuery,
  ): Promise<readonly KataGoResponseRaw[]> {
    this.queries.push(query);

    if (query.allowMoves) {
      return [{
        id: query.id,
        turnNumber: 0,
        moveInfos: [{
          move: 'C7',
          order: 0,
          visits: 120,
          winrate: 0.45,
          scoreLead: -3,
        }],
        rootInfo: {
          currentPlayer: 'B',
          visits: 120,
          winrate: 0.45,
          scoreLead: -3,
        },
      }];
    }

    return [{
      id: query.id,
      turnNumber: 0,
      moveInfos: [{
        move: 'D6',
        order: 0,
        visits: 240,
        winrate: 0.6,
        scoreLead: 2,
      }],
      rootInfo: {
        currentPlayer: 'B',
        visits: 240,
        winrate: 0.58,
        scoreLead: 1.5,
      },
    }];
  }
}

describe('KataGo move review', () => {
  it('forces an omitted played move and computes score loss against the best move', async () => {
    const provider = new Provider();

    const result =
      await analyzeSavedGameMove(
        record,
        1,
        provider,
        {
          maxVisits: 250,
        },
      );

    expect(provider.queries).toHaveLength(2);
    expect(result.best?.coordinate).toBe('D6');
    expect(result.actual?.coordinate).toBe('C7');
    expect(result.scoreLoss).toBe(5);
    expect(result.assessment).toBe('mistake');
  });
});

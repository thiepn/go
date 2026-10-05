import { describe, expect, it } from 'vitest';

import type {
  SavedGameRecord,
} from '../play/types';
import {
  analyzeSavedGameBatch,
} from './game';
import type {
  KataGoProvider,
  KataGoQuery,
  KataGoResponseRaw,
} from './types';

const record: SavedGameRecord = {
  id: 'computer-game',
  playedAt: 100,
  settings: {
    mode: 'computer',
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
    {
      type: 'play',
      player: 'white',
      point: { x: 3, y: 3 },
      captured: [],
    },
    {
      type: 'play',
      player: 'black',
      point: { x: 4, y: 4 },
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
  public query: KataGoQuery | null = null;

  public async analyze(
    query: KataGoQuery,
  ): Promise<readonly KataGoResponseRaw[]> {
    this.query = query;

    return [
      {
        id: query.id,
        turnNumber: 0,
        moveInfos: [{
          move: 'C7',
          order: 0,
          visits: 100,
          scoreLead: 1,
          winrate: 0.55,
        }],
        rootInfo: {
          currentPlayer: 'B',
          visits: 100,
        },
      },
      {
        id: query.id,
        turnNumber: 2,
        moveInfos: [{
          move: 'E5',
          order: 0,
          visits: 100,
          scoreLead: 2,
          winrate: 0.6,
        }],
        rootInfo: {
          currentPlayer: 'B',
          visits: 100,
        },
      },
    ];
  }
}

describe('whole-game KataGo scan', () => {
  it('uses one batched query for the human turns in a computer game', async () => {
    const provider = new Provider();

    const scan =
      await analyzeSavedGameBatch(
        record,
        provider,
      );

    expect(
      provider.query?.analyzeTurns,
    ).toEqual([0, 2]);
    expect(scan.moves).toHaveLength(2);
    expect(
      scan.moves.map(
        (move) => move.moveNumber,
      ),
    ).toEqual([1, 3]);
    expect(
      scan.missingPlayedMoves,
    ).toEqual([]);
  });
});

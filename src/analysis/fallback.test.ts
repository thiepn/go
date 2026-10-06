import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createGame,
  pass,
  playMove,
  type MoveRecord,
} from '../go/engine';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  reviewSavedGame,
} from '../review/analyze';
import {
  HttpKataGoProvider,
  KataGoUnavailableError,
} from './provider';

describe('KataGo failure boundary', () => {
  it('leaves deterministic Review available when the engine is unreachable', async () => {
    let game = createGame({
      size: 9,
      rules: { komi: 6.5 },
    });
    const moves: MoveRecord[] = [];

    for (const action of [
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 8, y: 8 },
      { x: 1, y: 0 },
      { x: 7, y: 7 },
      { x: 2, y: 1 },
      'pass',
    ] as const) {
      const result =
        action === 'pass'
          ? pass(game)
          : playMove(game, action);

      if (!result.ok) {
        throw new Error(
          `fixture failed: ${result.reason}`,
        );
      }

      moves.push(result.move);
      game = result.state;
    }

    const record: SavedGameRecord = {
      id: 'fallback',
      playedAt: 1,
      settings: {
        mode: 'local',
        boardSize: 9,
        humanColor: 'black',
        botLevel: '25k',
        handicap: 0,
        komi: 6.5,
        assistanceLevel:
          'independent',
        clock: 'untimed',
      },
      moves,
      result: {
        type: 'resign',
        winner: 'white',
        resignedBy: 'black',
      },
      captures: game.captures,
    };

    const before =
      reviewSavedGame(record);

    expect(
      before.findings.some(
        (finding) =>
          finding.kind ===
          'pass-in-atari',
      ),
    ).toBe(true);

    const provider =
      new HttpKataGoProvider({
        fetchImpl: async () => {
          throw new Error('offline');
        },
      });

    await expect(
      provider.analyze({
        id: 'offline',
        moves: [],
        rules: 'chinese',
        komi: 6.5,
        boardXSize: 9,
        boardYSize: 9,
      }),
    ).rejects.toBeInstanceOf(
      KataGoUnavailableError,
    );

    const after =
      reviewSavedGame(record);

    expect(after.findings).toEqual(
      before.findings,
    );
  });
});

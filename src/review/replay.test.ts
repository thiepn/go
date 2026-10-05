import { describe, expect, it } from 'vitest';

import {
  createGame,
  pass,
  playMove,
  type MoveRecord,
  type Point,
} from '../go/engine';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  buildReviewFrames,
} from './replay';

function makeRecord(
  actions: readonly (Point | 'pass')[],
): SavedGameRecord {
  let game = createGame({
    size: 9,
    rules: {
      komi: 6.5,
    },
  });
  const moves: MoveRecord[] = [];

  for (const action of actions) {
    const result =
      action === 'pass'
        ? pass(game)
        : playMove(game, action);

    if (!result.ok) {
      throw new Error(
        `Fixture move failed: ${result.reason}`,
      );
    }

    moves.push(result.move);
    game = result.state;
  }

  return {
    id: 'fixture',
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
    moves,
    result: {
      type: 'resign',
      winner: 'white',
      resignedBy: 'black',
    },
    captures: game.captures,
  };
}

describe('review replay', () => {
  it('builds before/after frames for every move', () => {
    const record = makeRecord([
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      'pass',
    ]);

    const frames = buildReviewFrames(record);

    expect(frames).toHaveLength(3);
    expect(frames[0].before.moves).toHaveLength(0);
    expect(frames[0].after.moves).toHaveLength(1);
    expect(frames[2].move.type).toBe('pass');
  });
});

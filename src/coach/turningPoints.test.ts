import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
  type MoveRecord,
  type Point,
} from '../go/engine';
import type {
  KataGoGameScan,
  KataGoMoveReview,
} from '../analysis/types';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  selectCoachTurningPoints,
} from './turningPoints';

function record(
  actions: readonly Point[],
): SavedGameRecord {
  let state = createGame({
    size: 9,
    rules: {
      komi: 6.5,
    },
  });
  const moves: MoveRecord[] = [];

  for (const point of actions) {
    const result =
      playMove(state, point);

    if (!result.ok) {
      throw new Error(result.reason);
    }

    state = result.state;
    moves.push(result.move);
  }

  return {
    id: 'g1',
    playedAt: 1_000,
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
    captures: state.captures,
  };
}

function engineMove(
  moveNumber: number,
  scoreLoss: number,
): KataGoMoveReview {
  return {
    moveNumber,
    actualPoint: { x: 6, y: 6 },
    actualCoordinate: 'G3',
    currentPlayer: 'black',
    best: null,
    actual: null,
    scoreLoss,
    winrateLoss: null,
    assessment:
      scoreLoss >= 8
        ? 'major-mistake'
        : 'mistake',
    position: {
      queryId: 'q',
      turnNumber: moveNumber - 1,
      currentPlayer: 'black',
      boardSize: 9,
      rootVisits: 200,
      rootWinrate: null,
      rootScoreLead: null,
      rootUtility: null,
      candidates: [],
      ownership: null,
      policy: null,
      humanPolicy: null,
      humanProfile: null,
    },
  };
}

describe('coach turning points', () => {
  it('combines engine magnitude with a deterministic moment while leaving engine-only concepts null', () => {
    const game = record([
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 8, y: 8 },
      { x: 1, y: 0 },
      { x: 7, y: 7 },
      { x: 2, y: 1 },
      { x: 6, y: 6 },
      { x: 1, y: 2 },
      { x: 5, y: 5 },
      { x: 0, y: 8 },
    ]);

    const scan: KataGoGameScan = {
      recordId: game.id,
      moves: [
        engineMove(7, 9),
        engineMove(9, 5),
      ],
      missingPlayedMoves: [],
      analyzedAt: 2_000,
    };

    const points =
      selectCoachTurningPoints(
        [game],
        'safety',
        [scan],
      );

    const combined = points.find(
      (point) =>
        point.moveNumber === 7,
    );
    const engineOnly = points.find(
      (point) =>
        point.moveNumber === 9,
    );

    expect(combined?.source).toBe(
      'combined',
    );
    expect(combined?.conceptId).toBe(
      'safety',
    );
    expect(combined?.scoreLoss).toBe(9);

    expect(engineOnly?.source).toBe(
      'engine',
    );
    expect(engineOnly?.conceptId).toBeNull();
  });
});

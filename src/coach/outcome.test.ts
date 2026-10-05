import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
  type MoveRecord,
  type Point,
} from '../go/engine';
import {
  buildMasterySnapshot,
} from '../mastery/model';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  evaluateCoachPlan,
} from './outcome';
import {
  buildCoachPlan,
} from './plan';

function record(
  id: string,
  playedAt: number,
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
      throw new Error(
        `${id}: ${result.reason}`,
      );
    }

    state = result.state;
    moves.push(result.move);
  }

  return {
    id,
    playedAt,
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

describe('coach outcome', () => {
  it('recognizes a substantial reduction in the coached mistake pattern', () => {
    const baseline = record(
      'baseline',
      1_000,
      [
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
        { x: 4, y: 4 },
        { x: 8, y: 0 },
      ],
    );

    const followup = record(
      'followup',
      3_000,
      [
        { x: 0, y: 0 },
        { x: 8, y: 8 },
        { x: 2, y: 0 },
        { x: 6, y: 8 },
        { x: 4, y: 0 },
        { x: 4, y: 8 },
        { x: 6, y: 0 },
        { x: 2, y: 8 },
        { x: 8, y: 0 },
        { x: 0, y: 8 },
        { x: 0, y: 2 },
        { x: 8, y: 6 },
      ],
    );

    const mastery =
      buildMasterySnapshot(
        [],
        1_500,
      );
    const plan =
      buildCoachPlan({
        games: [baseline],
        mastery,
        now: 2_000,
      });

    expect(plan).not.toBeNull();

    const outcome =
      evaluateCoachPlan(
        plan!,
        [followup, baseline],
        mastery,
      );

    expect(outcome.status).toBe(
      'improved',
    );
    expect(
      outcome.followupSignalPer20Moves,
    ).toBe(0);
  });

  it('uses the latest full game and skips shorter follow-ups', () => {
    const baseline = record(
      'baseline',
      1_000,
      [
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
        { x: 4, y: 4 },
        { x: 8, y: 0 },
      ],
    );
    const short = record(
      'short',
      2_500,
      [
        { x: 0, y: 0 },
        { x: 8, y: 8 },
      ],
    );
    const full = record(
      'full',
      3_000,
      [
        { x: 0, y: 0 },
        { x: 8, y: 8 },
        { x: 2, y: 0 },
        { x: 6, y: 8 },
        { x: 4, y: 0 },
        { x: 4, y: 8 },
        { x: 6, y: 0 },
        { x: 2, y: 8 },
        { x: 8, y: 0 },
        { x: 0, y: 8 },
      ],
    );

    const mastery =
      buildMasterySnapshot([]);
    const plan =
      buildCoachPlan({
        games: [baseline],
        mastery,
        now: 2_000,
      });

    const outcome =
      evaluateCoachPlan(
        plan!,
        [full, short, baseline],
        mastery,
      );

    expect(
      outcome.followupGame?.id,
    ).toBe('full');
  });
});

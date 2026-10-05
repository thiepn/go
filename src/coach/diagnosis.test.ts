import { describe, expect, it } from 'vitest';

import {
  createGame,
  playMove,
  type MoveRecord,
  type Point,
} from '../go/engine';
import {
  createLearningEvidence,
} from '../mastery/evidence';
import {
  buildMasterySnapshot,
} from '../mastery/model';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  diagnoseCoachFocus,
} from './diagnosis';

function game(
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
        `Illegal fixture move: ${result.reason}`,
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

const ignoredAtari = [
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
] as const;

describe('coach diagnosis', () => {
  it('walks from a recurring safety symptom to a weaker practiced liberties prerequisite', () => {
    const evidence =
      createLearningEvidence({
        source: 'practice',
        sourceId: 'liberties-baseline',
        sourceConcept: 'liberties',
        success: false,
        firstAttempt: false,
        mistakes: 2,
        hintsUsed: 1,
        occurredAt: 100,
      });

    const snapshot =
      buildMasterySnapshot(
        evidence,
        200,
      );

    const focus =
      diagnoseCoachFocus(
        [
          game(
            'g2',
            2_000,
            ignoredAtari,
          ),
          game(
            'g1',
            1_000,
            ignoredAtari,
          ),
        ],
        snapshot,
      );

    expect(focus?.conceptId).toBe(
      'liberties',
    );
    expect(focus?.reason).toMatch(
      /weaker prerequisite/i,
    );
    expect(
      focus?.practiceTags,
    ).toContain('liberties');
  });
});

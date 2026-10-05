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
  reviewSavedGame,
} from './analyze';

function makeRecord(
  id: string,
  actions: readonly (Point | 'pass')[],
  mode: 'local' | 'computer' = 'local',
  humanColor: 'black' | 'white' = 'black',
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
        `Fixture move failed at ${moves.length + 1}: ${result.reason}`,
      );
    }

    moves.push(result.move);
    game = result.state;
  }

  return {
    id,
    playedAt: 10_000,
    settings: {
      mode,
      boardSize: 9,
      humanColor,
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

describe('deterministic game review', () => {
  it('flags a missed immediate capture as an opportunity, not an automatic blunder', () => {
    const record = makeRecord(
      'missed-capture',
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
        { x: 8, y: 8 },
        { x: 2, y: 1 },
        { x: 7, y: 7 },
        { x: 5, y: 5 },
      ],
    );

    const review = reviewSavedGame(record);
    const finding = review.findings.find(
      (item) =>
        item.kind === 'missed-capture' &&
        item.moveNumber === 7,
    );

    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('opportunity');
    expect(finding?.masteryEligible).toBe(false);
    expect(finding?.alternativePoints).toContainEqual({
      x: 1,
      y: 2,
    });
  });

  it('flags ignored atari as a high-confidence mistake when the group is captured immediately', () => {
    const record = makeRecord(
      'ignored-atari',
      [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 8, y: 8 },
        { x: 1, y: 0 },
        { x: 7, y: 7 },
        { x: 2, y: 1 },
        { x: 6, y: 6 },
        { x: 1, y: 2 },
      ],
    );

    const review = reviewSavedGame(record);
    const finding = review.findings.find(
      (item) =>
        item.kind === 'ignored-atari' &&
        item.moveNumber === 7,
    );

    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('mistake');
    expect(finding?.confidence).toBe('high');
    expect(finding?.masteryEligible).toBe(true);
    expect(finding?.conceptId).toBe('safety');
  });

  it('flags punished self-atari as a high-confidence mistake', () => {
    const record = makeRecord(
      'self-atari',
      [
        { x: 8, y: 8 },
        { x: 1, y: 2 },
        { x: 7, y: 7 },
        { x: 2, y: 1 },
        { x: 6, y: 6 },
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
    );

    const review = reviewSavedGame(record);
    const finding = review.findings.find(
      (item) =>
        item.kind === 'self-atari' &&
        item.moveNumber === 7,
    );

    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('mistake');
    expect(finding?.confidence).toBe('high');
    expect(finding?.masteryEligible).toBe(true);
  });

  it('flags an opponent taking an immediate direct connection point as a warning', () => {
    const record = makeRecord(
      'cut',
      [
        { x: 1, y: 2 },
        { x: 8, y: 8 },
        { x: 2, y: 1 },
        { x: 7, y: 7 },
        { x: 6, y: 6 },
        { x: 2, y: 2 },
      ],
    );

    const review = reviewSavedGame(record);
    const finding = review.findings.find(
      (item) =>
        item.kind === 'direct-cut' &&
        item.moveNumber === 5,
    );

    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('warning');
    expect(finding?.conceptId).toBe('connection');
    expect(finding?.masteryEligible).toBe(false);
  });

  it('flags passing while still in atari as a warning', () => {
    const record = makeRecord(
      'pass-atari',
      [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 8, y: 8 },
        { x: 1, y: 0 },
        { x: 7, y: 7 },
        { x: 2, y: 1 },
        'pass',
      ],
    );

    const review = reviewSavedGame(record);
    const finding = review.findings.find(
      (item) =>
        item.kind === 'pass-in-atari' &&
        item.moveNumber === 7,
    );

    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('warning');
    expect(finding?.masteryEligible).toBe(false);
  });

  it('reviews only the learner color in computer games', () => {
    const record = makeRecord(
      'computer',
      [
        { x: 8, y: 8 },
        { x: 1, y: 2 },
        { x: 7, y: 7 },
        { x: 2, y: 1 },
        { x: 6, y: 6 },
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
      'computer',
      'black',
    );

    const review = reviewSavedGame(record);

    expect(
      review.findings.every(
        (finding) =>
          finding.player === 'black',
      ),
    ).toBe(true);
  });
});

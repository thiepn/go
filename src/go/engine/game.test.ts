import { describe, expect, it } from 'vitest';

import {
  createGame,
  getIntersection,
  pass,
  playMove,
  type GameState,
} from '.';

function expectLegal(
  result: ReturnType<typeof playMove> | ReturnType<typeof pass>,
): GameState {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error(`Expected legal move, got ${result.reason}.`);
  }

  return result.state;
}

describe('game rules', () => {
  it('alternates turns and rejects occupied intersections', () => {
    const game = createGame({ size: 5 });
    const first = playMove(game, { x: 0, y: 0 });

    const afterFirst = expectLegal(first);

    expect(afterFirst.toPlay).toBe('white');

    const occupied = playMove(afterFirst, { x: 0, y: 0 });

    expect(occupied.ok).toBe(false);

    if (!occupied.ok) {
      expect(occupied.reason).toBe('occupied');
    }
  });

  it('rejects points outside the board without changing state', () => {
    const game = createGame({ size: 5 });
    const result = playMove(game, { x: 5, y: 0 });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.reason).toBe('out-of-bounds');
      expect(result.state).toBe(game);
    }
  });

  it('rejects overlapping setup stones', () => {
    expect(() =>
      createGame({
        size: 5,
        setup: {
          black: [{ x: 1, y: 1 }],
          white: [{ x: 1, y: 1 }],
        },
      }),
    ).toThrow(/overlapping/i);
  });

  it('captures a group when its final liberty is filled', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 0 },
        ],
        white: [{ x: 1, y: 1 }],
      },
    });

    const result = playMove(game, { x: 1, y: 2 });
    const next = expectLegal(result);

    expect(getIntersection(next.board, { x: 1, y: 1 })).toBeNull();
    expect(next.captures.black).toBe(1);
  });

  it('captures an entire connected group together', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 0, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
        ],
        white: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
    });

    const result = playMove(game, { x: 1, y: 2 });
    const next = expectLegal(result);

    expect(getIntersection(next.board, { x: 1, y: 1 })).toBeNull();
    expect(getIntersection(next.board, { x: 2, y: 1 })).toBeNull();
    expect(next.captures.black).toBe(2);
  });

  it('rejects suicide', () => {
    const game = createGame({
      size: 3,
      toPlay: 'black',
      setup: {
        white: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    });

    const result = playMove(game, { x: 1, y: 1 });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.reason).toBe('suicide');
    }
  });

  it('allows a move with no initial liberty when it captures surrounding stones', () => {
    const game = createGame({
      size: 3,
      toPlay: 'black',
      setup: {
        black: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 0, y: 2 },
          { x: 2, y: 2 },
        ],
        white: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    });

    const result = playMove(game, { x: 1, y: 1 });
    const next = expectLegal(result);

    expect(next.captures.black).toBe(4);
  });

  it('rejects an immediate simple-ko recapture', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
        white: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
        ],
      },
    });

    const capture = expectLegal(playMove(game, { x: 2, y: 1 }));
    const recapture = playMove(capture, { x: 2, y: 2 });

    expect(recapture.ok).toBe(false);

    if (!recapture.ok) {
      expect(recapture.reason).toBe('ko');
    }
  });

  it('applies positional superko to previously seen positions', () => {
    const game = createGame({
      size: 5,
      toPlay: 'black',
      rules: { koRule: 'positional-superko' },
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
        white: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
        ],
      },
    });

    const capture = expectLegal(playMove(game, { x: 2, y: 1 }));
    const recapture = playMove(capture, { x: 2, y: 2 });

    expect(recapture.ok).toBe(false);

    if (!recapture.ok) {
      expect(recapture.reason).toBe('ko');
    }
  });

  it('finishes after two consecutive passes and rejects further play', () => {
    const game = createGame({ size: 9 });
    const afterBlackPass = expectLegal(pass(game));
    const afterWhitePass = expectLegal(pass(afterBlackPass));

    expect(afterBlackPass.status).toBe('playing');
    expect(afterWhitePass.status).toBe('finished');
    expect(afterWhitePass.consecutivePasses).toBe(2);

    const afterGame = playMove(afterWhitePass, { x: 4, y: 4 });

    expect(afterGame.ok).toBe(false);

    if (!afterGame.ok) {
      expect(afterGame.reason).toBe('game-over');
    }
  });
});

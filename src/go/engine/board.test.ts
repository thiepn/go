import { describe, expect, it } from 'vitest';

import {
  createEmptyBoard,
  getGroup,
  getIntersection,
  neighbors,
  setIntersection,
} from '.';

describe('board', () => {
  it('keeps board updates immutable', () => {
    const board = createEmptyBoard(5);
    const updated = setIntersection(board, { x: 2, y: 2 }, 'black');

    expect(getIntersection(board, { x: 2, y: 2 })).toBeNull();
    expect(getIntersection(updated, { x: 2, y: 2 })).toBe('black');
  });

  it('returns only orthogonal neighbors', () => {
    const board = createEmptyBoard(5);

    expect(neighbors(board, { x: 0, y: 0 })).toHaveLength(2);
    expect(neighbors(board, { x: 2, y: 2 })).toHaveLength(4);
  });

  it('treats connected stones as one group with shared liberties', () => {
    let board = createEmptyBoard(5);
    board = setIntersection(board, { x: 1, y: 1 }, 'black');
    board = setIntersection(board, { x: 1, y: 2 }, 'black');

    const group = getGroup(board, { x: 1, y: 1 });

    expect(group?.stones).toHaveLength(2);
    expect(group?.liberties).toHaveLength(6);
  });
});

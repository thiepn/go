import { describe, expect, it } from 'vitest';

import {
  createEmptyBoard,
  setIntersection,
} from '../../go/engine';
import { diffBoards } from './transitions';

describe('board transition diff', () => {
  it('finds newly placed and captured stones without applying Go rules', () => {
    let before = createEmptyBoard(5);
    before = setIntersection(before, { x: 1, y: 1 }, 'white');

    let after = setIntersection(before, { x: 2, y: 1 }, 'black');
    after = setIntersection(after, { x: 1, y: 1 }, null);

    const diff = diffBoards(before, after);

    expect(diff.entered).toEqual([
      { point: { x: 2, y: 1 }, color: 'black' },
    ]);
    expect(diff.exited).toEqual([
      { point: { x: 1, y: 1 }, color: 'white' },
    ]);
  });
});

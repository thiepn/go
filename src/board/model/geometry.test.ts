import { describe, expect, it } from 'vitest';

import {
  coordinateLabel,
  getBoardGeometry,
  getStarPoints,
  pointToSvg,
} from './geometry';

describe('board geometry', () => {
  it('maps the first and last intersections to the drawable grid bounds', () => {
    const geometry = getBoardGeometry(9);

    expect(pointToSvg(geometry, { x: 0, y: 0 })).toEqual({
      x: geometry.inset,
      y: geometry.inset,
    });

    expect(pointToSvg(geometry, { x: 8, y: 8 })).toEqual({
      x: geometry.inset + geometry.gridSize,
      y: geometry.inset + geometry.gridSize,
    });
  });

  it('uses standard 9x9 star points', () => {
    expect(getStarPoints(9)).toEqual([
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 },
      { x: 6, y: 6 },
    ]);
  });

  it('uses standard Go coordinate letters that skip I', () => {
    expect(coordinateLabel({ x: 7, y: 8 }, 9)).toBe('H1');
    expect(coordinateLabel({ x: 8, y: 8 }, 9)).toBe('J1');
  });
});

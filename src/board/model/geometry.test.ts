import { describe, expect, it } from 'vitest';

import {
  BOARD_VIEWBOX_SIZE,
  PRECISION_TOUCH_SPACING,
  coordinateLabel,
  getBoardGeometry,
  getPrecisionBoardWidth,
  getStarPoints,
  pointToSvg,
  svgPositionToPoint,
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

  it('sizes precision zoom so large boards retain touch spacing', () => {
    for (const size of [13, 19]) {
      const geometry = getBoardGeometry(size);
      const width = getPrecisionBoardWidth(size);
      const renderedSpacing =
        (geometry.spacing / BOARD_VIEWBOX_SIZE) * width;

      expect(renderedSpacing).toBeGreaterThanOrEqual(
        PRECISION_TOUCH_SPACING,
      );
    }
  });

  it('maps arbitrary SVG positions to the nearest valid intersection', () => {
    const geometry = getBoardGeometry(19);

    expect(
      svgPositionToPoint(
        geometry,
        geometry.inset,
        geometry.inset,
      ),
    ).toEqual({ x: 0, y: 0 });

    expect(
      svgPositionToPoint(
        geometry,
        geometry.inset + geometry.gridSize,
        geometry.inset + geometry.gridSize,
      ),
    ).toEqual({ x: 18, y: 18 });

    expect(
      svgPositionToPoint(geometry, -100, 1200),
    ).toEqual({ x: 0, y: 18 });
  });

  it('uses standard Go coordinate letters that skip I', () => {
    expect(coordinateLabel({ x: 7, y: 8 }, 9)).toBe('H1');
    expect(coordinateLabel({ x: 8, y: 8 }, 9)).toBe('J1');
  });
});

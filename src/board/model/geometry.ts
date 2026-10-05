import type { Point } from '../../go/engine';

export const BOARD_VIEWBOX_SIZE = 1000;
export const BOARD_INSET = 72;

export interface BoardGeometry {
  readonly size: number;
  readonly inset: number;
  readonly gridSize: number;
  readonly spacing: number;
  readonly stoneRadius: number;
  readonly hitRadius: number;
}

export function getBoardGeometry(size: number): BoardGeometry {
  if (!Number.isInteger(size) || size < 2) {
    throw new RangeError('Board size must be an integer of at least 2.');
  }

  const gridSize = BOARD_VIEWBOX_SIZE - BOARD_INSET * 2;
  const spacing = gridSize / (size - 1);

  return {
    size,
    inset: BOARD_INSET,
    gridSize,
    spacing,
    stoneRadius: spacing * 0.465,
    hitRadius: spacing * 0.49,
  };
}

export function pointToSvg(
  geometry: BoardGeometry,
  point: Point,
): { readonly x: number; readonly y: number } {
  return {
    x: geometry.inset + point.x * geometry.spacing,
    y: geometry.inset + point.y * geometry.spacing,
  };
}

export function getStarPoints(size: number): readonly Point[] {
  if (size === 19) {
    const values = [3, 9, 15];
    return values.flatMap((y) => values.map((x) => ({ x, y })));
  }

  if (size === 13) {
    return [
      { x: 3, y: 3 },
      { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 },
      { x: 9, y: 9 },
    ];
  }

  if (size === 9) {
    return [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 },
      { x: 6, y: 6 },
    ];
  }

  if (size >= 5 && size % 2 === 1) {
    const center = Math.floor(size / 2);
    return [{ x: center, y: center }];
  }

  return [];
}

const GO_COLUMNS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

export function coordinateLabel(point: Point, size: number): string {
  const column = GO_COLUMNS[point.x] ?? String(point.x + 1);
  return `${column}${size - point.y}`;
}

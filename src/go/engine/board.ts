import type { Intersection, Point } from './types';

export interface Board {
  readonly size: number;
  readonly intersections: readonly Intersection[];
}

export function createEmptyBoard(size = 9): Board {
  if (!Number.isInteger(size) || size < 2 || size > 25) {
    throw new RangeError('Board size must be an integer between 2 and 25.');
  }

  return {
    size,
    intersections: Array<Intersection>(size * size).fill(null),
  };
}

export function isOnBoard(board: Board, point: Point): boolean {
  return (
    Number.isInteger(point.x) &&
    Number.isInteger(point.y) &&
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < board.size &&
    point.y < board.size
  );
}

export function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

export function pointToIndex(board: Board, point: Point): number {
  if (!isOnBoard(board, point)) {
    throw new RangeError(
      `Point (${point.x}, ${point.y}) is outside a ${board.size}×${board.size} board.`,
    );
  }

  return point.y * board.size + point.x;
}

export function indexToPoint(board: Board, index: number): Point {
  if (!Number.isInteger(index) || index < 0 || index >= board.intersections.length) {
    throw new RangeError('Board index is out of bounds.');
  }

  return {
    x: index % board.size,
    y: Math.floor(index / board.size),
  };
}

export function getIntersection(board: Board, point: Point): Intersection {
  return board.intersections[pointToIndex(board, point)] ?? null;
}

export function setIntersection(
  board: Board,
  point: Point,
  value: Intersection,
): Board {
  const index = pointToIndex(board, point);
  const intersections = board.intersections.slice();
  intersections[index] = value;

  return {
    size: board.size,
    intersections,
  };
}

export function neighbors(board: Board, point: Point): Point[] {
  const candidates: Point[] = [
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
  ];

  return candidates.filter((candidate) => isOnBoard(board, candidate));
}

export function serializeBoard(board: Board): string {
  return board.intersections
    .map((intersection) => {
      if (intersection === 'black') return 'B';
      if (intersection === 'white') return 'W';
      return '.';
    })
    .join('');
}

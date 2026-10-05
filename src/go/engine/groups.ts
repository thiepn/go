import {
  getIntersection,
  isOnBoard,
  neighbors,
  pointKey,
  type Board,
} from './board';
import type { Point, Stone } from './types';

export interface Group {
  readonly color: Stone;
  readonly stones: readonly Point[];
  readonly liberties: readonly Point[];
}

export function getGroup(board: Board, start: Point): Group | null {
  if (!isOnBoard(board, start)) {
    return null;
  }

  const color = getIntersection(board, start);

  if (color === null) {
    return null;
  }

  const queue: Point[] = [start];
  const visited = new Set<string>();
  const stones: Point[] = [];
  const liberties = new Map<string, Point>();

  while (queue.length > 0) {
    const point = queue.pop();

    if (!point) continue;

    const key = pointKey(point);

    if (visited.has(key)) continue;

    visited.add(key);
    stones.push(point);

    for (const neighbor of neighbors(board, point)) {
      const value = getIntersection(board, neighbor);

      if (value === null) {
        liberties.set(pointKey(neighbor), neighbor);
      } else if (value === color && !visited.has(pointKey(neighbor))) {
        queue.push(neighbor);
      }
    }
  }

  return {
    color,
    stones,
    liberties: [...liberties.values()],
  };
}

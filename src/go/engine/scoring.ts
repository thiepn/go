import {
  getIntersection,
  indexToPoint,
  neighbors,
  pointKey,
  type Board,
} from './board';
import type { Point, Stone } from './types';

export interface AreaBreakdown {
  readonly black: number;
  readonly white: number;
}

export interface AreaScore {
  readonly stones: AreaBreakdown;
  readonly territory: AreaBreakdown;
  readonly neutral: number;
  readonly komi: number;
  readonly total: AreaBreakdown;
  readonly winner: Stone | 'draw';
  readonly margin: number;
}

interface EmptyRegion {
  readonly points: readonly Point[];
  readonly borderingColors: ReadonlySet<Stone>;
}

function getEmptyRegion(
  board: Board,
  start: Point,
  visited: Set<string>,
): EmptyRegion {
  const queue: Point[] = [start];
  const points: Point[] = [];
  const borderingColors = new Set<Stone>();

  while (queue.length > 0) {
    const point = queue.pop();

    if (!point) continue;

    const key = pointKey(point);

    if (visited.has(key)) continue;

    visited.add(key);
    points.push(point);

    for (const neighbor of neighbors(board, point)) {
      const value = getIntersection(board, neighbor);

      if (value === null) {
        if (!visited.has(pointKey(neighbor))) {
          queue.push(neighbor);
        }
      } else {
        borderingColors.add(value);
      }
    }
  }

  return {
    points,
    borderingColors,
  };
}

export function scoreArea(board: Board, komi = 6.5): AreaScore {
  const stones = {
    black: 0,
    white: 0,
  };

  const territory = {
    black: 0,
    white: 0,
  };

  let neutral = 0;
  const visitedEmpty = new Set<string>();

  for (let index = 0; index < board.intersections.length; index += 1) {
    const point = indexToPoint(board, index);
    const value = getIntersection(board, point);

    if (value === 'black') {
      stones.black += 1;
      continue;
    }

    if (value === 'white') {
      stones.white += 1;
      continue;
    }

    if (visitedEmpty.has(pointKey(point))) {
      continue;
    }

    const region = getEmptyRegion(board, point, visitedEmpty);

    if (
      region.borderingColors.size === 1 &&
      region.borderingColors.has('black')
    ) {
      territory.black += region.points.length;
    } else if (
      region.borderingColors.size === 1 &&
      region.borderingColors.has('white')
    ) {
      territory.white += region.points.length;
    } else {
      neutral += region.points.length;
    }
  }

  const total = {
    black: stones.black + territory.black,
    white: stones.white + territory.white + komi,
  };

  const winner: Stone | 'draw' =
    total.black === total.white
      ? 'draw'
      : total.black > total.white
        ? 'black'
        : 'white';

  return {
    stones,
    territory,
    neutral,
    komi,
    total,
    winner,
    margin: Math.abs(total.black - total.white),
  };
}

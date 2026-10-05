import { pointKey, type Point } from '../../go/engine';

export function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function includesPoint(
  points: readonly Point[],
  target: Point,
): boolean {
  return points.some((point) => samePoint(point, target));
}

export function uniquePoints(points: readonly Point[]): Point[] {
  const result = new Map<string, Point>();

  for (const point of points) {
    result.set(pointKey(point), point);
  }

  return [...result.values()];
}

export function samePointSet(
  a: readonly Point[],
  b: readonly Point[],
): boolean {
  if (a.length !== b.length) return false;

  const aKeys = new Set(a.map(pointKey));
  return b.every((point) => aKeys.has(pointKey(point)));
}

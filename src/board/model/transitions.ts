import {
  indexToPoint,
  type Board,
  type Point,
  type Stone,
} from '../../go/engine';

export interface StoneAtPoint {
  readonly point: Point;
  readonly color: Stone;
}

export interface BoardTransitionDiff {
  readonly entered: readonly StoneAtPoint[];
  readonly exited: readonly StoneAtPoint[];
}

export function diffBoards(
  previous: Board | null,
  current: Board,
): BoardTransitionDiff {
  if (!previous || previous.size !== current.size) {
    return {
      entered: current.intersections.flatMap((value, index) =>
        value
          ? [{ point: indexToPoint(current, index), color: value }]
          : [],
      ),
      exited: [],
    };
  }

  const entered: StoneAtPoint[] = [];
  const exited: StoneAtPoint[] = [];

  current.intersections.forEach((value, index) => {
    const before = previous.intersections[index] ?? null;

    if (before === value) return;

    const point = indexToPoint(current, index);

    if (before) {
      exited.push({ point, color: before });
    }

    if (value) {
      entered.push({ point, color: value });
    }
  });

  return { entered, exited };
}

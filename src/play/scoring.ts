import {
  getGroup,
  getIntersection,
  pointKey,
  scoreArea,
  setIntersection,
  type AreaScore,
  type Board,
  type Point,
} from '../go/engine';

export function normalizeDeadGroup(
  board: Board,
  point: Point,
): Point[] {
  if (getIntersection(board, point) === null) return [];

  const group = getGroup(board, point);
  return group ? [...group.stones] : [];
}

export function toggleDeadGroup(
  board: Board,
  deadStones: readonly Point[],
  point: Point,
): Point[] {
  const group = normalizeDeadGroup(board, point);
  if (group.length === 0) return [...deadStones];

  const deadKeys = new Set(deadStones.map(pointKey));
  const allDead = group.every((stone) =>
    deadKeys.has(pointKey(stone)),
  );

  if (allDead) {
    const groupKeys = new Set(group.map(pointKey));
    return deadStones.filter(
      (stone) => !groupKeys.has(pointKey(stone)),
    );
  }

  for (const stone of group) {
    deadKeys.add(pointKey(stone));
  }

  return [...deadKeys].map((key) => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  });
}

export function boardWithoutDeadStones(
  board: Board,
  deadStones: readonly Point[],
): Board {
  let next = board;

  for (const point of deadStones) {
    if (getIntersection(next, point) !== null) {
      next = setIntersection(next, point, null);
    }
  }

  return next;
}

export function scoreConfirmedPosition(
  board: Board,
  komi: number,
  deadStones: readonly Point[],
): AreaScore {
  return scoreArea(
    boardWithoutDeadStones(board, deadStones),
    komi,
  );
}

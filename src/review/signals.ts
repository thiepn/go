import {
  getGroup,
  getIntersection,
  indexToPoint,
  neighbors,
  playMove,
  pointKey,
  type Board,
  type GameState,
  type Point,
  type Stone,
} from '../go/engine';

export interface CaptureOpportunity {
  readonly point: Point;
  readonly captured: number;
}

export interface AtariGroup {
  readonly stones: readonly Point[];
  readonly liberty: Point;
}

export function collectColorGroups(
  game: GameState,
  color: Stone,
): readonly (readonly Point[])[] {
  const seen = new Set<string>();
  const result: Point[][] = [];

  game.board.intersections.forEach(
    (value, index) => {
      if (value !== color) return;

      const point = indexToPoint(
        game.board,
        index,
      );
      const key = pointKey(point);
      if (seen.has(key)) return;

      const group = getGroup(
        game.board,
        point,
      );
      if (!group) return;

      group.stones.forEach((stone) =>
        seen.add(pointKey(stone)),
      );
      result.push([...group.stones]);
    },
  );

  return result;
}

export function atariGroupsFor(
  game: GameState,
  color: Stone,
): AtariGroup[] {
  return collectColorGroups(game, color)
    .flatMap((stones) => {
      const group = getGroup(
        game.board,
        stones[0],
      );

      if (
        !group ||
        group.liberties.length !== 1
      ) {
        return [];
      }

      return [{
        stones,
        liberty: group.liberties[0],
      }];
    });
}

export function captureOpportunities(
  game: GameState,
): CaptureOpportunity[] {
  const result: CaptureOpportunity[] = [];

  game.board.intersections.forEach(
    (value, index) => {
      if (value !== null) return;

      const point = indexToPoint(
        game.board,
        index,
      );
      const move = playMove(
        game,
        point,
      );

      if (
        move.ok &&
        move.move.type === 'play' &&
        move.move.captured.length > 0
      ) {
        result.push({
          point,
          captured: move.move.captured.length,
        });
      }
    },
  );

  return result.sort(
    (a, b) =>
      b.captured - a.captured ||
      a.point.y - b.point.y ||
      a.point.x - b.point.x,
  );
}

function groupSafeAfter(
  game: GameState,
  originalStones: readonly Point[],
  color: Stone,
): boolean {
  const survivor = originalStones.find(
    (point) =>
      getIntersection(
        game.board,
        point,
      ) === color,
  );

  if (!survivor) return false;

  const group = getGroup(
    game.board,
    survivor,
  );

  return Boolean(
    group &&
    group.liberties.length > 1,
  );
}

export function rescueMovesForGroup(
  game: GameState,
  stones: readonly Point[],
): Point[] {
  const player = game.toPlay;
  const result: Point[] = [];

  game.board.intersections.forEach(
    (value, index) => {
      if (value !== null) return;

      const point = indexToPoint(
        game.board,
        index,
      );
      const move = playMove(
        game,
        point,
      );

      if (
        move.ok &&
        groupSafeAfter(
          move.state,
          stones,
          player,
        )
      ) {
        result.push(point);
      }
    },
  );

  return result;
}

export function groupCapturedByMove(
  stones: readonly Point[],
  captured: readonly Point[],
): boolean {
  const capturedKeys = new Set(
    captured.map(pointKey),
  );

  return stones.some((stone) =>
    capturedKeys.has(pointKey(stone)),
  );
}

function groupIdentity(
  board: Board,
  point: Point,
): string | null {
  const group = getGroup(
    board,
    point,
  );

  if (!group) return null;

  return group.stones
    .map(pointKey)
    .sort()
    .join('|');
}

export function friendlyGroupsAdjacentTo(
  board: Board,
  point: Point,
  color: Stone,
): number {
  const groups = new Set<string>();

  for (const neighbor of neighbors(
    board,
    point,
  )) {
    if (
      getIntersection(
        board,
        neighbor,
      ) !== color
    ) {
      continue;
    }

    const identity = groupIdentity(
      board,
      neighbor,
    );

    if (identity) {
      groups.add(identity);
    }
  }

  return groups.size;
}

export function samePoint(
  a: Point | null,
  b: Point | null,
): boolean {
  if (!a || !b) return a === b;

  return (
    a.x === b.x &&
    a.y === b.y
  );
}

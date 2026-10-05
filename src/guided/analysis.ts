import {
  getGroup,
  indexToPoint,
  playMove,
  pointKey,
  type GameState,
  type Point,
  type Stone,
} from '../go/engine';

export interface PositionSignals {
  readonly learnerAtariGroups: readonly (readonly Point[])[];
  readonly opponentAtariGroups: readonly (readonly Point[])[];
  readonly captureMoves: readonly Point[];
}

function collectGroups(
  game: GameState,
  color: Stone,
): readonly (readonly Point[])[] {
  const seen = new Set<string>();
  const groups: Point[][] = [];

  game.board.intersections.forEach((value, index) => {
    if (value !== color) return;

    const point = indexToPoint(game.board, index);
    const key = pointKey(point);
    if (seen.has(key)) return;

    const group = getGroup(game.board, point);
    if (!group) return;

    group.stones.forEach((stone) => seen.add(pointKey(stone)));
    groups.push([...group.stones]);
  });

  return groups;
}

function atariGroups(
  game: GameState,
  color: Stone,
): readonly (readonly Point[])[] {
  return collectGroups(game, color).filter((stones) => {
    const group = getGroup(game.board, stones[0]);
    return group?.liberties.length === 1;
  });
}

function captureMovesForCurrentPlayer(
  game: GameState,
): readonly Point[] {
  const moves: Point[] = [];

  game.board.intersections.forEach((value, index) => {
    if (value !== null) return;

    const point = indexToPoint(game.board, index);
    const result = playMove(game, point);

    if (
      result.ok &&
      result.move.type === 'play' &&
      result.move.captured.length > 0
    ) {
      moves.push(point);
    }
  });

  return moves;
}

export function inspectPosition(
  game: GameState,
  learnerColor: Stone = 'black',
): PositionSignals {
  const opponentColor: Stone =
    learnerColor === 'black' ? 'white' : 'black';

  return {
    learnerAtariGroups: atariGroups(game, learnerColor),
    opponentAtariGroups: atariGroups(game, opponentColor),
    captureMoves:
      game.toPlay === learnerColor
        ? captureMovesForCurrentPlayer(game)
        : [],
  };
}

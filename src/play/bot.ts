import {
  getGroup,
  getIntersection,
  indexToPoint,
  neighbors,
  playMove,
  pointKey,
  serializeBoard,
  type GameState,
  type Point,
  type Stone,
} from '../go/engine';
import type {
  BotLevel,
  BotProfile,
} from './types';

export type BotDecision =
  | {
      readonly type: 'play';
      readonly point: Point;
    }
  | {
      readonly type: 'pass';
    };

export const BOT_PROFILES: Readonly<Record<BotLevel, BotProfile>> = {
  '25k': {
    id: '25k',
    label: 'Beginner · 25 kyu',
    description:
      'Notices obvious captures but still makes loose, human-like beginner moves.',
    tacticalAwareness: 5.5,
    selfAtariPenalty: 4,
    connectionWeight: 1.15,
    localWeight: 0.55,
    noise: 4.2,
  },
  '20k': {
    id: '20k',
    label: 'Learner · 20 kyu',
    description:
      'More reliable about saving stones, connecting, and taking simple tactics.',
    tacticalAwareness: 8,
    selfAtariPenalty: 6,
    connectionWeight: 1.6,
    localWeight: 0.85,
    noise: 2.6,
  },
  '15k': {
    id: '15k',
    label: 'Club beginner · 15 kyu',
    description:
      'Usually catches one-move tactics and plays more coherent local shapes.',
    tacticalAwareness: 11,
    selfAtariPenalty: 8,
    connectionWeight: 2,
    localWeight: 1.15,
    noise: 1.5,
  },
};

function deterministicNoise(
  game: GameState,
  point: Point,
  amplitude: number,
): number {
  const source =
    `${serializeBoard(game.board)}:${game.moves.length}:${pointKey(point)}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const normalized = ((hash >>> 0) % 10_000) / 10_000;
  return (normalized - 0.5) * 2 * amplitude;
}

function distance(
  a: Point,
  b: Point,
): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function adjacentCount(
  game: GameState,
  point: Point,
  color: Stone,
): number {
  return neighbors(game.board, point).filter(
    (neighbor) =>
      getIntersection(game.board, neighbor) === color,
  ).length;
}

function edgeShapeScore(
  size: number,
  point: Point,
): number {
  const edge = Math.min(
    point.x,
    point.y,
    size - 1 - point.x,
    size - 1 - point.y,
  );

  if (size >= 13) {
    if (edge === 3) return 1.6;
    if (edge === 2) return 1.15;
    if (edge === 1) return 0.45;
    if (edge === 0) return -0.7;
    return 0.25;
  }

  if (edge === 2) return 1.4;
  if (edge === 1) return 0.55;
  if (edge === 0) return -0.55;
  return 0.35;
}

function localScore(
  game: GameState,
  point: Point,
  weight: number,
): number {
  const last = game.moves.at(-1);
  if (!last || last.type !== 'play') return 0;

  const d = distance(point, last.point);
  if (d <= 2) return weight * 1.6;
  if (d <= 4) return weight;
  return 0;
}

function atariEscapePoints(
  game: GameState,
  color: Stone,
): ReadonlySet<string> {
  const seen = new Set<string>();
  const escapes = new Set<string>();

  game.board.intersections.forEach((value, index) => {
    if (value !== color) return;

    const point = indexToPoint(game.board, index);
    const key = pointKey(point);
    if (seen.has(key)) return;

    const group = getGroup(game.board, point);
    if (!group) return;

    group.stones.forEach((stone) =>
      seen.add(pointKey(stone)),
    );

    if (group.liberties.length === 1) {
      escapes.add(pointKey(group.liberties[0]));
    }
  });

  return escapes;
}

function legalMoves(
  game: GameState,
): readonly {
  readonly point: Point;
  readonly state: GameState;
  readonly captures: number;
}[] {
  const moves: {
    point: Point;
    state: GameState;
    captures: number;
  }[] = [];

  game.board.intersections.forEach((value, index) => {
    if (value !== null) return;

    const point = indexToPoint(game.board, index);
    const result = playMove(game, point);

    if (!result.ok || result.move.type !== 'play') return;

    moves.push({
      point,
      state: result.state,
      captures: result.move.captured.length,
    });
  });

  return moves;
}

function evaluateMove(
  game: GameState,
  point: Point,
  next: GameState,
  captures: number,
  profile: BotProfile,
  escapePoints: ReadonlySet<string>,
): number {
  const player = game.toPlay;
  const enemy: Stone = player === 'black' ? 'white' : 'black';
  const ownAdjacent = adjacentCount(game, point, player);
  const enemyAdjacent = adjacentCount(game, point, enemy);
  const ownGroup = getGroup(next.board, point);
  const liberties = ownGroup?.liberties.length ?? 0;

  let score = 0;
  score += captures * profile.tacticalAwareness;

  if (escapePoints.has(pointKey(point))) {
    score += profile.tacticalAwareness * 0.82;
  }

  score += ownAdjacent * profile.connectionWeight;
  score += enemyAdjacent * 0.42;
  score += edgeShapeScore(game.board.size, point);
  score += localScore(game, point, profile.localWeight);

  if (liberties === 1 && captures === 0) {
    score -= profile.selfAtariPenalty;
  } else {
    score += Math.min(3, liberties) * 0.34;
  }

  score += deterministicNoise(
    game,
    point,
    profile.noise,
  );

  return score;
}

export function chooseBotMove(
  game: GameState,
  level: BotLevel,
): BotDecision {
  const profile = BOT_PROFILES[level];
  const moves = legalMoves(game);
  const escapes = atariEscapePoints(
    game,
    game.toPlay,
  );

  if (moves.length === 0) {
    return { type: 'pass' };
  }

  const ranked = moves
    .map((candidate) => ({
      ...candidate,
      score: evaluateMove(
        game,
        candidate.point,
        candidate.state,
        candidate.captures,
        profile,
        escapes,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.point.y - b.point.y ||
        a.point.x - b.point.x,
    );

  const best = ranked[0];
  const occupancy =
    game.board.intersections.filter(Boolean).length /
    game.board.intersections.length;

  if (
    game.consecutivePasses === 1 &&
    occupancy >= 0.42 &&
    best.captures === 0 &&
    best.score < 3
  ) {
    return { type: 'pass' };
  }

  return {
    type: 'play',
    point: best.point,
  };
}

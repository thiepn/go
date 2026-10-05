import {
  createEmptyBoard,
  getIntersection,
  isOnBoard,
  neighbors,
  pointKey,
  serializeBoard,
  setIntersection,
  type Board,
} from './board';
import { getGroup } from './groups';
import { opponent, type Point, type Stone } from './types';

export type KoRule = 'simple' | 'positional-superko';

export interface GameRules {
  readonly koRule: KoRule;
  readonly komi: number;
}

export const DEFAULT_RULES: GameRules = Object.freeze({
  koRule: 'simple',
  komi: 6.5,
});

export interface SetupStones {
  readonly black?: readonly Point[];
  readonly white?: readonly Point[];
}

export interface NewGameOptions {
  readonly size?: number;
  readonly toPlay?: Stone;
  readonly setup?: SetupStones;
  readonly rules?: Partial<GameRules>;
}

export type GameStatus = 'playing' | 'finished';

export interface PlayMoveRecord {
  readonly type: 'play';
  readonly player: Stone;
  readonly point: Point;
  readonly captured: readonly Point[];
}

export interface PassMoveRecord {
  readonly type: 'pass';
  readonly player: Stone;
}

export type MoveRecord = PlayMoveRecord | PassMoveRecord;

export interface CaptureCounts {
  readonly black: number;
  readonly white: number;
}

export interface GameState {
  readonly board: Board;
  readonly toPlay: Stone;
  readonly rules: GameRules;
  readonly moves: readonly MoveRecord[];
  readonly boardHistory: readonly string[];
  readonly consecutivePasses: number;
  readonly captures: CaptureCounts;
  readonly status: GameStatus;
}

export type IllegalMoveReason =
  | 'game-over'
  | 'out-of-bounds'
  | 'occupied'
  | 'suicide'
  | 'ko';

export type MoveResult =
  | {
      readonly ok: true;
      readonly state: GameState;
      readonly move: MoveRecord;
    }
  | {
      readonly ok: false;
      readonly state: GameState;
      readonly reason: IllegalMoveReason;
    };

function validateRules(rules: GameRules): void {
  if (rules.koRule !== 'simple' && rules.koRule !== 'positional-superko') {
    throw new Error(`Unsupported ko rule: ${String(rules.koRule)}.`);
  }

  if (!Number.isFinite(rules.komi)) {
    throw new RangeError('Komi must be a finite number.');
  }
}

function addSetupStones(
  board: Board,
  color: Stone,
  points: readonly Point[] | undefined,
): Board {
  let next = board;

  for (const point of points ?? []) {
    if (!isOnBoard(next, point)) {
      throw new RangeError(
        `Setup stone at (${point.x}, ${point.y}) is outside the board.`,
      );
    }

    if (getIntersection(next, point) !== null) {
      throw new Error(
        `Setup contains overlapping stones at (${point.x}, ${point.y}).`,
      );
    }

    next = setIntersection(next, point, color);
  }

  return next;
}

export function createGame(options: NewGameOptions = {}): GameState {
  const size = options.size ?? 9;
  const rules: GameRules = {
    ...DEFAULT_RULES,
    ...options.rules,
  };

  validateRules(rules);

  let board = createEmptyBoard(size);
  board = addSetupStones(board, 'black', options.setup?.black);
  board = addSetupStones(board, 'white', options.setup?.white);

  return {
    board,
    toPlay: options.toPlay ?? 'black',
    rules,
    moves: [],
    boardHistory: [serializeBoard(board)],
    consecutivePasses: 0,
    captures: {
      black: 0,
      white: 0,
    },
    status: 'playing',
  };
}

function removeStones(board: Board, stones: readonly Point[]): Board {
  let next = board;

  for (const point of stones) {
    next = setIntersection(next, point, null);
  }

  return next;
}

function violatesKo(state: GameState, nextBoardHash: string): boolean {
  if (state.rules.koRule === 'positional-superko') {
    return state.boardHistory.includes(nextBoardHash);
  }

  const boardBeforeOpponentMove =
    state.boardHistory[state.boardHistory.length - 2];

  return boardBeforeOpponentMove === nextBoardHash;
}

export function playMove(state: GameState, point: Point): MoveResult {
  if (state.status !== 'playing') {
    return {
      ok: false,
      state,
      reason: 'game-over',
    };
  }

  if (!isOnBoard(state.board, point)) {
    return {
      ok: false,
      state,
      reason: 'out-of-bounds',
    };
  }

  if (getIntersection(state.board, point) !== null) {
    return {
      ok: false,
      state,
      reason: 'occupied',
    };
  }

  const player = state.toPlay;
  const enemy = opponent(player);
  let nextBoard = setIntersection(state.board, point, player);
  const captured: Point[] = [];
  const processedEnemyStones = new Set<string>();

  for (const neighbor of neighbors(nextBoard, point)) {
    if (getIntersection(nextBoard, neighbor) !== enemy) {
      continue;
    }

    const neighborKey = pointKey(neighbor);

    if (processedEnemyStones.has(neighborKey)) {
      continue;
    }

    const group = getGroup(nextBoard, neighbor);

    if (!group) {
      continue;
    }

    for (const stone of group.stones) {
      processedEnemyStones.add(pointKey(stone));
    }

    if (group.liberties.length === 0) {
      captured.push(...group.stones);
      nextBoard = removeStones(nextBoard, group.stones);
    }
  }

  const ownGroup = getGroup(nextBoard, point);

  if (!ownGroup || ownGroup.liberties.length === 0) {
    return {
      ok: false,
      state,
      reason: 'suicide',
    };
  }

  const nextBoardHash = serializeBoard(nextBoard);

  if (violatesKo(state, nextBoardHash)) {
    return {
      ok: false,
      state,
      reason: 'ko',
    };
  }

  const move: PlayMoveRecord = {
    type: 'play',
    player,
    point,
    captured,
  };

  return {
    ok: true,
    move,
    state: {
      ...state,
      board: nextBoard,
      toPlay: enemy,
      moves: [...state.moves, move],
      boardHistory: [...state.boardHistory, nextBoardHash],
      consecutivePasses: 0,
      captures: {
        ...state.captures,
        [player]: state.captures[player] + captured.length,
      },
    },
  };
}

export function pass(state: GameState): MoveResult {
  if (state.status !== 'playing') {
    return {
      ok: false,
      state,
      reason: 'game-over',
    };
  }

  const move: PassMoveRecord = {
    type: 'pass',
    player: state.toPlay,
  };

  const consecutivePasses = state.consecutivePasses + 1;

  return {
    ok: true,
    move,
    state: {
      ...state,
      toPlay: opponent(state.toPlay),
      moves: [...state.moves, move],
      boardHistory: [...state.boardHistory, serializeBoard(state.board)],
      consecutivePasses,
      status: consecutivePasses >= 2 ? 'finished' : 'playing',
    },
  };
}

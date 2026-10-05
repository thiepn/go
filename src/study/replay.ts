import {
  createGame,
  pass,
  playMove,
  serializeBoard,
  setIntersection,
  type GameState,
  type Point,
} from '../go/engine';
import {
  findStudyPath,
} from './tree';
import type {
  StudyDocument,
  StudyNode,
  StudySetup,
} from './types';

function applySetup(
  game: GameState,
  setup: StudySetup | undefined,
): GameState {
  if (!setup) return game;

  let board = game.board;

  for (const point of setup.empty ?? []) {
    board = setIntersection(board, point, null);
  }
  for (const point of setup.black ?? []) {
    board = setIntersection(board, point, 'black');
  }
  for (const point of setup.white ?? []) {
    board = setIntersection(board, point, 'white');
  }

  return {
    ...game,
    board,
    toPlay: setup.toPlay ?? game.toPlay,
    boardHistory: [serializeBoard(board)],
    consecutivePasses: 0,
    status: 'playing',
  };
}

function ensurePlaying(
  game: GameState,
): GameState {
  return game.status === 'playing'
    ? game
    : {
        ...game,
        status: 'playing',
        consecutivePasses: 0,
      };
}

function applyNode(
  game: GameState,
  node: StudyNode,
): GameState {
  let next = applySetup(game, node.setup);

  if (!node.move) return next;

  next = ensurePlaying(next);

  if (next.toPlay !== node.move.color) {
    next = {
      ...next,
      toPlay: node.move.color,
    };
  }

  if (node.move.point === null) {
    const result = pass(next);
    return result.ok ? result.state : next;
  }

  const result = playMove(next, node.move.point);

  if (!result.ok) {
    throw new Error(
      `Study tree contains illegal ${node.move.color} move at (${node.move.point.x}, ${node.move.point.y}): ${result.reason}.`,
    );
  }

  return result.state;
}

export function replayStudyPath(
  document: StudyDocument,
  nodeId: string,
): GameState {
  const path = findStudyPath(
    document.root,
    nodeId,
  );

  if (!path) {
    throw new Error(
      `Study node "${nodeId}" was not found.`,
    );
  }

  let game = createGame({
    size: document.metadata.boardSize,
    rules: {
      komi: document.metadata.komi,
    },
  });

  for (const node of path) {
    game = applyNode(game, node);
  }

  return game;
}

export function studyPathMoves(
  document: StudyDocument,
  nodeId: string,
): readonly {
  readonly nodeId: string;
  readonly point: Point | null;
}[] {
  const path = findStudyPath(document.root, nodeId) ?? [];

  return path.flatMap((node) =>
    node.move
      ? [{
          nodeId: node.id,
          point: node.move.point,
        }]
      : [],
  );
}

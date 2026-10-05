import {
  createGame,
  pass,
  playMove,
  type GameState,
} from '../go/engine';
import {
  handicapPoints,
} from '../play/handicap';
import type {
  SavedGameRecord,
} from '../play/types';
import type {
  ReviewFrame,
} from './types';

export function createReviewInitialState(
  record: SavedGameRecord,
): GameState {
  const handicap = handicapPoints(
    record.settings.boardSize,
    record.settings.handicap,
  );

  return createGame({
    size: record.settings.boardSize,
    toPlay:
      handicap.length >= 2
        ? 'white'
        : 'black',
    setup: {
      black: handicap,
    },
    rules: {
      komi: record.settings.komi,
    },
  });
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

export function buildReviewFrames(
  record: SavedGameRecord,
): ReviewFrame[] {
  const frames: ReviewFrame[] = [];
  let game = createReviewInitialState(record);

  for (const [index, move] of record.moves.entries()) {
    game = ensurePlaying(game);

    if (game.toPlay !== move.player) {
      throw new Error(
        `Saved game move ${index + 1} has ${move.player} to play, but the reconstructed position expects ${game.toPlay}.`,
      );
    }

    const before = game;
    const result =
      move.type === 'pass'
        ? pass(game)
        : playMove(game, move.point);

    if (!result.ok) {
      throw new Error(
        `Saved game move ${index + 1} is illegal during review reconstruction: ${result.reason}.`,
      );
    }

    game = result.state;

    frames.push({
      moveNumber: index + 1,
      move: result.move,
      before,
      after: game,
    });
  }

  return frames;
}

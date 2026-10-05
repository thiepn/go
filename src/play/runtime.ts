import {
  createGame,
  pass,
  playMove,
  type GameState,
  type Point,
  type Stone,
} from '../go/engine';
import type { BotDecision } from './bot';
import {
  effectiveKomi,
  handicapPoints,
} from './handicap';
import {
  scoreConfirmedPosition,
  toggleDeadGroup,
} from './scoring';
import type {
  IndependentGameSettings,
  IndependentGameState,
} from './types';

export type IndependentGameAction =
  | {
      readonly type: 'play';
      readonly point: Point;
    }
  | {
      readonly type: 'pass';
    }
  | {
      readonly type: 'bot';
      readonly decision: BotDecision;
    }
  | {
      readonly type: 'toggle-dead';
      readonly point: Point;
    }
  | {
      readonly type: 'resume-play';
    }
  | {
      readonly type: 'confirm-score';
    }
  | {
      readonly type: 'resign';
      readonly player: Stone;
    }
  | {
      readonly type: 'timeout';
      readonly player: Stone;
    }
  | {
      readonly type: 'clear-feedback';
    };

function opponent(color: Stone): Stone {
  return color === 'black' ? 'white' : 'black';
}

export function createIndependentGameState(
  settings: IndependentGameSettings,
): IndependentGameState {
  const handicap = handicapPoints(
    settings.boardSize,
    settings.handicap,
  );
  const komi = effectiveKomi(
    settings.handicap,
    settings.komi,
  );

  return {
    settings: {
      ...settings,
      komi,
    },
    game: createGame({
      size: settings.boardSize,
      toPlay: handicap.length >= 2 ? 'white' : 'black',
      setup: {
        black: handicap,
      },
      rules: {
        komi,
      },
    }),
    phase: 'playing',
    deadStones: [],
    result: null,
    feedback:
      handicap.length >= 2
        ? `Black begins with ${handicap.length} handicap stones. White plays first.`
        : null,
    illegalAttempts: 0,
  };
}

function transitionAfterMove(
  state: IndependentGameState,
  game: GameState,
  feedback: string | null = null,
): IndependentGameState {
  if (game.status === 'finished') {
    return {
      ...state,
      game,
      phase: 'scoring',
      deadStones: [],
      feedback:
        'Both players passed. Mark any dead groups before confirming the score.',
    };
  }

  return {
    ...state,
    game,
    feedback,
  };
}

function playPoint(
  state: IndependentGameState,
  point: Point,
): IndependentGameState {
  if (state.phase !== 'playing') return state;

  const result = playMove(state.game, point);

  if (!result.ok) {
    const feedback =
      result.reason === 'occupied'
        ? 'There is already a stone there.'
        : result.reason === 'suicide'
          ? 'That move would leave your own group with no liberties.'
          : result.reason === 'ko'
            ? 'Ko prevents this immediate repetition.'
            : 'That move is not legal here.';

    return {
      ...state,
      illegalAttempts: state.illegalAttempts + 1,
      feedback,
    };
  }

  const captureText =
    result.move.type === 'play' &&
    result.move.captured.length > 0
      ? `${result.move.captured.length} ${result.move.captured.length === 1 ? 'stone' : 'stones'} captured.`
      : null;

  return transitionAfterMove(
    state,
    result.state,
    captureText,
  );
}

function passTurn(
  state: IndependentGameState,
): IndependentGameState {
  if (state.phase !== 'playing') return state;

  const player = state.game.toPlay;
  const result = pass(state.game);

  if (!result.ok) return state;

  return transitionAfterMove(
    state,
    result.state,
    result.state.status === 'finished'
      ? null
      : `${player === 'black' ? 'Black' : 'White'} passed.`,
  );
}

function resumeGame(
  game: GameState,
): GameState {
  return {
    ...game,
    status: 'playing',
    consecutivePasses: 0,
  };
}

export function reduceIndependentGame(
  state: IndependentGameState,
  action: IndependentGameAction,
): IndependentGameState {
  switch (action.type) {
    case 'clear-feedback':
      return {
        ...state,
        feedback: null,
      };

    case 'play':
      return playPoint(state, action.point);

    case 'pass':
      return passTurn(state);

    case 'bot':
      if (state.phase !== 'playing') return state;
      return action.decision.type === 'pass'
        ? passTurn(state)
        : playPoint(state, action.decision.point);

    case 'toggle-dead':
      if (state.phase !== 'scoring') return state;
      return {
        ...state,
        deadStones: toggleDeadGroup(
          state.game.board,
          state.deadStones,
          action.point,
        ),
      };

    case 'resume-play':
      if (state.phase !== 'scoring') return state;
      return {
        ...state,
        game: resumeGame(state.game),
        phase: 'playing',
        deadStones: [],
        feedback:
          'Play resumed. Settle the disputed group on the board, then pass again when finished.',
      };

    case 'confirm-score':
      if (state.phase !== 'scoring') return state;
      return {
        ...state,
        phase: 'complete',
        result: {
          type: 'score',
          score: scoreConfirmedPosition(
            state.game.board,
            state.settings.komi,
            state.deadStones,
          ),
        },
        feedback: null,
      };

    case 'resign':
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        phase: 'complete',
        result: {
          type: 'resign',
          resignedBy: action.player,
          winner: opponent(action.player),
        },
        feedback: null,
      };

    case 'timeout':
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        phase: 'complete',
        result: {
          type: 'timeout',
          timedOut: action.player,
          winner: opponent(action.player),
        },
        feedback: null,
      };
  }
}

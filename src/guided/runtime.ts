import {
  createGame,
  pass,
  playMove,
  scoreArea,
  type AreaScore,
  type GameState,
  type Point,
} from '../go/engine';
import { getAssistanceProfile } from './assistance';
import type {
  GuidedGameScenario,
  GuidedOpponentAction,
  GuidedTurn,
} from './types';

export type GuidedHelpMode =
  | 'none'
  | 'what-matters'
  | 'show-me'
  | 'why'
  | 'sequence';

export type GuidedFeedbackTone =
  | 'neutral'
  | 'success'
  | 'correction';

export interface GuidedFeedback {
  readonly tone: GuidedFeedbackTone;
  readonly text: string;
}

export interface GuidedGameState {
  readonly scenarioId: string;
  readonly game: GameState;
  readonly turnIndex: number;
  readonly helpMode: GuidedHelpMode;
  readonly feedback: GuidedFeedback | null;
  readonly completed: boolean;
  readonly score: AreaScore | null;
  readonly learnerMoves: number;
  readonly helpUses: number;
}

export type GuidedGameAction =
  | { readonly type: 'play'; readonly point: Point }
  | { readonly type: 'pass' }
  | { readonly type: 'help'; readonly mode: Exclude<GuidedHelpMode, 'none'> }
  | { readonly type: 'clear-help' };

export function createGuidedGameState(
  scenario: GuidedGameScenario,
): GuidedGameState {
  return {
    scenarioId: scenario.id,
    game: createGame({
      size: scenario.boardSize,
      rules: {
        komi: scenario.komi,
      },
    }),
    turnIndex: 0,
    helpMode: 'none',
    feedback: {
      tone: 'neutral',
      text: scenario.openingMessage,
    },
    completed: false,
    score: null,
    learnerMoves: 0,
    helpUses: 0,
  };
}

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function includesPoint(
  points: readonly Point[],
  point: Point,
): boolean {
  return points.some((candidate) => samePoint(candidate, point));
}

function applyOpponent(
  game: GameState,
  action: GuidedOpponentAction,
): GameState {
  if (action.type === 'pass') {
    const result = pass(game);

    if (!result.ok) {
      throw new Error('Authored opponent pass was illegal.');
    }

    return result.state;
  }

  const result = playMove(game, action.point);

  if (!result.ok) {
    throw new Error(
      `Authored opponent move (${action.point.x}, ${action.point.y}) was illegal: ${result.reason}.`,
    );
  }

  return result.state;
}

function finishIfNeeded(
  scenario: GuidedGameScenario,
  state: GuidedGameState,
  game: GameState,
  nextTurnIndex: number,
  successText: string,
): GuidedGameState {
  const completed =
    nextTurnIndex >= scenario.turns.length ||
    game.status === 'finished';

  if (!completed) {
    return {
      ...state,
      game,
      turnIndex: nextTurnIndex,
      helpMode: 'none',
      feedback: {
        tone: 'success',
        text: successText,
      },
    };
  }

  return {
    ...state,
    game,
    turnIndex: nextTurnIndex,
    helpMode: 'none',
    feedback: {
      tone: 'success',
      text: scenario.completionMessage,
    },
    completed: true,
    score: scoreArea(game.board, scenario.komi),
  };
}

function playGuidedTurn(
  scenario: GuidedGameScenario,
  state: GuidedGameState,
  turn: GuidedTurn,
  point: Point,
): GuidedGameState {
  if (turn.type !== 'play') {
    return {
      ...state,
      feedback: {
        tone: 'correction',
        text: 'This is a passing moment. Use the Pass button instead of placing a stone.',
      },
    };
  }

  const profile = getAssistanceProfile(scenario.assistanceLevel);

  if (
    profile.constrainMoves &&
    !includesPoint(turn.acceptedMoves, point)
  ) {
    const legality = playMove(state.game, point);

    return {
      ...state,
      feedback: {
        tone: 'correction',
        text: legality.ok
          ? turn.outsidePlanText ??
            'That is a legal Go move, but for this first guided game choose one of the teaching moves so we can see the idea clearly.'
          : legality.reason === 'occupied'
            ? 'There is already a stone there.'
            : 'That move is not legal in this position.',
      },
    };
  }

  const learnerResult = playMove(state.game, point);

  if (!learnerResult.ok) {
    return {
      ...state,
      feedback: {
        tone: 'correction',
        text:
          learnerResult.reason === 'occupied'
            ? 'There is already a stone there.'
            : learnerResult.reason === 'suicide'
              ? 'That move would leave your own group without a liberty.'
              : learnerResult.reason === 'ko'
                ? 'Ko prevents that immediate repetition.'
                : 'That move is not legal here.',
      },
    };
  }

  const afterOpponent = applyOpponent(
    learnerResult.state,
    turn.opponent,
  );

  return finishIfNeeded(
    scenario,
    {
      ...state,
      learnerMoves: state.learnerMoves + 1,
    },
    afterOpponent,
    state.turnIndex + 1,
    turn.successText,
  );
}

function passGuidedTurn(
  scenario: GuidedGameScenario,
  state: GuidedGameState,
  turn: GuidedTurn,
): GuidedGameState {
  if (turn.type !== 'pass') {
    return {
      ...state,
      feedback: {
        tone: 'correction',
        text: 'There is still a move to play in this teaching position.',
      },
    };
  }

  const learnerPass = pass(state.game);

  if (!learnerPass.ok) {
    return {
      ...state,
      feedback: {
        tone: 'correction',
        text: 'The game has already ended.',
      },
    };
  }

  const afterOpponent = applyOpponent(
    learnerPass.state,
    turn.opponent,
  );

  return finishIfNeeded(
    scenario,
    {
      ...state,
      learnerMoves: state.learnerMoves + 1,
    },
    afterOpponent,
    state.turnIndex + 1,
    turn.successText,
  );
}

export function reduceGuidedGame(
  scenario: GuidedGameScenario,
  state: GuidedGameState,
  action: GuidedGameAction,
): GuidedGameState {
  if (action.type === 'clear-help') {
    return {
      ...state,
      helpMode: 'none',
    };
  }

  if (state.completed) {
    return state;
  }

  const turn = scenario.turns[state.turnIndex];

  if (!turn) {
    return {
      ...state,
      completed: true,
      score: scoreArea(state.game.board, scenario.komi),
    };
  }

  if (action.type === 'help') {
    return {
      ...state,
      helpMode: action.mode,
      helpUses: state.helpUses + 1,
      feedback: null,
    };
  }

  if (action.type === 'pass') {
    return passGuidedTurn(scenario, state, turn);
  }

  return playGuidedTurn(
    scenario,
    state,
    turn,
    action.point,
  );
}

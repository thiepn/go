import {
  createGame,
  playMove,
  pointKey,
  type GameState,
  type Point,
} from '../go/engine';
import type {
  ProblemBranch,
  ProblemDefinition,
  ProblemNode,
} from './types';
import { validateProblem } from './validation';

export type ProblemFeedbackTone = 'neutral' | 'success' | 'correction';

export interface ProblemFeedback {
  readonly tone: ProblemFeedbackTone;
  readonly text: string;
}

export interface ProblemRuntimeState {
  readonly problemId: string;
  readonly game: GameState;
  readonly node: ProblemNode;
  readonly attempts: number;
  readonly hintIndex: number;
  readonly hintsUsed: number;
  readonly feedback: ProblemFeedback | null;
  readonly completed: boolean;
  readonly firstTry: boolean;
  readonly pendingOpponent: Point | null;
  readonly pendingNextNode: ProblemNode | null;
  readonly pendingSolved: boolean;
  readonly refutation: readonly Point[];
}

export type ProblemAction =
  | { readonly type: 'play'; readonly point: Point }
  | { readonly type: 'opponent' }
  | { readonly type: 'hint' }
  | { readonly type: 'retry' };

export function createProblemState(
  problem: ProblemDefinition,
): ProblemRuntimeState {
  const issues = validateProblem(problem);

  if (issues.length > 0) {
    throw new Error(
      `Invalid problem "${problem.id}": ${issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  return {
    problemId: problem.id,
    game: createGame({
      size: problem.setup.size,
      toPlay: problem.setup.toPlay,
      setup: {
        black: problem.setup.black,
        white: problem.setup.white,
      },
      rules: {
        komi: 0,
      },
    }),
    node: problem.root,
    attempts: 0,
    hintIndex: 0,
    hintsUsed: 0,
    feedback: null,
    completed: false,
    firstTry: true,
    pendingOpponent: null,
    pendingNextNode: null,
    pendingSolved: false,
    refutation: [],
  };
}

function findBranch(
  node: ProblemNode,
  point: Point,
): ProblemBranch | undefined {
  return node.branches.find(
    (branch) =>
      branch.move.x === point.x &&
      branch.move.y === point.y,
  );
}

function correction(
  problem: ProblemDefinition,
  state: ProblemRuntimeState,
  point: Point,
  fallback: string,
): ProblemRuntimeState {
  return {
    ...state,
    attempts: state.attempts + 1,
    firstTry: false,
    feedback: {
      tone: 'correction',
      text:
        problem.wrongMoveFeedback?.[pointKey(point)] ??
        fallback,
    },
    refutation: [],
  };
}

function playLearnerMove(
  problem: ProblemDefinition,
  state: ProblemRuntimeState,
  point: Point,
): ProblemRuntimeState {
  const branch = findBranch(state.node, point);

  if (!branch) {
    const legality = playMove(state.game, point);

    if (!legality.ok) {
      return correction(
        problem,
        state,
        point,
        legality.reason === 'occupied'
          ? 'There is already a stone there.'
          : 'That move is not legal.',
      );
    }

    return {
      ...correction(
        problem,
        state,
        point,
        'That move is legal Go, but it does not solve this position.',
      ),
      refutation: [],
    };
  }

  const learnerResult = playMove(state.game, point);

  if (!learnerResult.ok) {
    return correction(
      problem,
      state,
      point,
      'This authored solution move is unexpectedly illegal.',
    );
  }

  if (!branch.opponentMove) {
    if (branch.verdict === 'solved') {
      return {
        ...state,
        game: learnerResult.state,
        feedback: {
          tone: 'success',
          text: branch.feedback,
        },
        completed: true,
        refutation: [],
      };
    }

    if (!branch.next) {
      throw new Error('Continuing branch is missing its next node.');
    }

    return {
      ...state,
      game: learnerResult.state,
      node: branch.next,
      feedback: {
        tone: 'success',
        text: branch.feedback,
      },
      refutation: [],
    };
  }

  return {
    ...state,
    game: learnerResult.state,
    feedback: {
      tone: 'success',
      text: branch.feedback,
    },
    pendingOpponent: branch.opponentMove,
    pendingNextNode: branch.next ?? null,
    pendingSolved: branch.verdict === 'solved',
    refutation: [],
  };
}

function playOpponent(
  state: ProblemRuntimeState,
): ProblemRuntimeState {
  if (!state.pendingOpponent) return state;

  const result = playMove(state.game, state.pendingOpponent);

  if (!result.ok) {
    throw new Error(
      `Authored problem reply (${state.pendingOpponent.x}, ${state.pendingOpponent.y}) is illegal: ${result.reason}.`,
    );
  }

  if (state.pendingSolved) {
    return {
      ...state,
      game: result.state,
      completed: true,
      pendingOpponent: null,
      pendingNextNode: null,
      pendingSolved: false,
    };
  }

  if (!state.pendingNextNode) {
    throw new Error('Problem reply has no continuation node.');
  }

  return {
    ...state,
    game: result.state,
    node: state.pendingNextNode,
    pendingOpponent: null,
    pendingNextNode: null,
    pendingSolved: false,
  };
}

export function reduceProblem(
  problem: ProblemDefinition,
  state: ProblemRuntimeState,
  action: ProblemAction,
): ProblemRuntimeState {
  if (action.type === 'opponent') {
    return playOpponent(state);
  }

  if (state.completed || state.pendingOpponent) {
    return state;
  }

  if (action.type === 'hint') {
    const hints = problem.hints ?? [];
    const hint = hints[Math.min(state.hintIndex, hints.length - 1)];

    if (!hint) return state;

    return {
      ...state,
      hintIndex: Math.min(state.hintIndex + 1, hints.length),
      hintsUsed: state.hintsUsed + 1,
      feedback: {
        tone: 'neutral',
        text: hint.text,
      },
      firstTry: false,
    };
  }

  if (action.type === 'retry') {
    return {
      ...createProblemState(problem),
      attempts: state.attempts,
      hintsUsed: state.hintsUsed,
      firstTry: false,
    };
  }

  return playLearnerMove(problem, state, action.point);
}

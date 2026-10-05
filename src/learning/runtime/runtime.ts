import {
  createGame,
  getGroup,
  getIntersection,
  playMove,
  pointKey,
  type GameState,
  type Point,
} from '../../go/engine';
import { applyLessonEffects, EMPTY_PRESENTATION } from './presentation';
import {
  includesPoint,
  samePointSet,
  uniquePoints,
} from './points';
import type {
  LessonBoardSetup,
  LessonDefinition,
  LessonPresentation,
  LessonStep,
} from './types';
import { validateLesson } from './validation';

export type LessonFeedbackTone = 'neutral' | 'success' | 'correction';

export interface LessonFeedback {
  readonly tone: LessonFeedbackTone;
  readonly text: string;
}

export interface LessonRuntimeState {
  readonly lessonId: string;
  readonly stepIndex: number;
  readonly board: GameState;
  readonly selectedPoints: readonly Point[];
  readonly sequence: readonly Point[];
  readonly hintIndex: number;
  readonly attempts: number;
  readonly feedback: LessonFeedback | null;
  readonly presentation: LessonPresentation;
  readonly completed: boolean;
  readonly history: readonly LessonSnapshot[];
}

export interface LessonSnapshot {
  readonly stepIndex: number;
  readonly board: GameState;
  readonly selectedPoints: readonly Point[];
  readonly sequence: readonly Point[];
  readonly hintIndex: number;
  readonly attempts: number;
  readonly feedback: LessonFeedback | null;
  readonly presentation: LessonPresentation;
  readonly completed: boolean;
}

export type LessonAction =
  | { readonly type: 'continue' }
  | { readonly type: 'point'; readonly point: Point }
  | { readonly type: 'choice'; readonly choiceId: string }
  | { readonly type: 'hint' }
  | { readonly type: 'retry' }
  | { readonly type: 'rewind' }
  | {
      readonly type: 'apply-choreography';
      readonly effects: Parameters<typeof applyLessonEffects>[1];
    };

function gameFromSetup(setup: LessonBoardSetup): GameState {
  return createGame({
    size: setup.size,
    toPlay: setup.toPlay,
    setup: {
      black: setup.black,
      white: setup.white,
    },
  });
}

function snapshot(state: LessonRuntimeState): LessonSnapshot {
  return {
    stepIndex: state.stepIndex,
    board: state.board,
    selectedPoints: state.selectedPoints,
    sequence: state.sequence,
    hintIndex: state.hintIndex,
    attempts: state.attempts,
    feedback: state.feedback,
    presentation: state.presentation,
    completed: state.completed,
  };
}

function stepBoard(
  lesson: LessonDefinition,
  index: number,
  previous: GameState,
): GameState {
  const setup = lesson.steps[index]?.board;
  return setup ? gameFromSetup(setup) : previous;
}

function presentationForStep(
  step: LessonStep | undefined,
): LessonPresentation {
  return applyLessonEffects(
    EMPTY_PRESENTATION,
    step?.enterEffects,
  );
}

export function createLessonRuntime(
  lesson: LessonDefinition,
): LessonRuntimeState {
  const issues = validateLesson(lesson);

  if (issues.length > 0) {
    throw new Error(
      `Invalid lesson "${lesson.id}": ${issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  const firstStep = lesson.steps[0];

  return {
    lessonId: lesson.id,
    stepIndex: 0,
    board: firstStep?.board
      ? gameFromSetup(firstStep.board)
      : gameFromSetup(lesson.initialBoard),
    selectedPoints: [],
    sequence: [],
    hintIndex: 0,
    attempts: 0,
    feedback: null,
    presentation: presentationForStep(firstStep),
    completed: false,
    history: [],
  };
}

function advance(
  lesson: LessonDefinition,
  state: LessonRuntimeState,
  successText?: string,
  historyState: LessonRuntimeState = state,
): LessonRuntimeState {
  const nextIndex = state.stepIndex + 1;

  if (nextIndex >= lesson.steps.length) {
    return {
      ...state,
      feedback: {
        tone: 'success',
        text: successText ?? 'Lesson complete.',
      },
      presentation: applyLessonEffects(state.presentation, [
        { type: 'clear-presentation' },
      ]),
      completed: true,
      history: [...state.history, snapshot(historyState)],
    };
  }

  const nextStep = lesson.steps[nextIndex];
  const nextBoard = stepBoard(lesson, nextIndex, state.board);

  return {
    ...state,
    stepIndex: nextIndex,
    board: nextBoard,
    selectedPoints: [],
    sequence: [],
    hintIndex: 0,
    attempts: 0,
    feedback: successText
      ? {
          tone: 'success',
          text: successText,
        }
      : null,
    presentation: presentationForStep(nextStep),
    history: [...state.history, snapshot(historyState)],
  };
}

function correction(
  state: LessonRuntimeState,
  text: string,
): LessonRuntimeState {
  return {
    ...state,
    attempts: state.attempts + 1,
    feedback: {
      tone: 'correction',
      text,
    },
  };
}

function pointFeedback(
  step: {
    readonly wrongPointFeedback?: Readonly<Record<string, string>>;
  },
  point: Point,
  fallback: string,
): string {
  return step.wrongPointFeedback?.[pointKey(point)] ?? fallback;
}

function handlePointCollection(
  lesson: LessonDefinition,
  state: LessonRuntimeState,
  step: Extract<
    LessonStep,
    {
      readonly kind:
        | 'select-points'
        | 'select-stones'
        | 'mark-liberties'
        | 'identify-territory';
    }
  >,
  point: Point,
): LessonRuntimeState {
  if (!includesPoint(step.expectedPoints, point)) {
    return correction(
      state,
      pointFeedback(step, point, 'That point is not part of this answer.'),
    );
  }

  const selectedPoints = uniquePoints([...state.selectedPoints, point]);

  if (!samePointSet(selectedPoints, step.expectedPoints)) {
    return {
      ...state,
      selectedPoints,
      feedback: {
        tone: 'neutral',
        text: `${selectedPoints.length} of ${step.expectedPoints.length} found.`,
      },
    };
  }

  return advance(
    lesson,
    { ...state, selectedPoints },
    step.successText,
    state,
  );
}

function handlePoint(
  lesson: LessonDefinition,
  state: LessonRuntimeState,
  step: LessonStep,
  point: Point,
): LessonRuntimeState {
  switch (step.kind) {
    case 'continue':
    case 'choose-answer':
      return state;

    case 'play-move': {
      if (
        step.acceptedPoints &&
        !includesPoint(step.acceptedPoints, point)
      ) {
        return correction(
          state,
          pointFeedback(step, point, 'Try a different intersection.'),
        );
      }

      const result = playMove(state.board, point);

      if (!result.ok) {
        return correction(
          state,
          pointFeedback(
            step,
            point,
            result.reason === 'occupied'
              ? 'There is already a stone there.'
              : 'That move does not work here yet.',
          ),
        );
      }

      return advance(
        lesson,
        {
          ...state,
          board: result.state,
        },
        step.successText,
        state,
      );
    }

    case 'select-points':
    case 'select-stones':
    case 'mark-liberties':
    case 'identify-territory':
      return handlePointCollection(lesson, state, step, point);

    case 'select-group': {
      if (!includesPoint(step.expectedGroup, point)) {
        return correction(
          state,
          pointFeedback(step, point, 'That stone is not part of the target group.'),
        );
      }

      const value = getIntersection(state.board.board, point);

      if (!value) {
        return correction(state, 'Choose a stone, not an empty intersection.');
      }

      const group = getGroup(state.board.board, point);

      if (!group || !samePointSet(group.stones, step.expectedGroup)) {
        return correction(
          state,
          'That stone belongs to a different connected group.',
        );
      }

      return advance(lesson, state, step.successText);
    }

    case 'predict-move':
      if (!includesPoint(step.acceptedPoints, point)) {
        return correction(
          state,
          pointFeedback(step, point, 'Look again before choosing the move.'),
        );
      }

      return advance(lesson, state, step.successText);

    case 'predict-sequence': {
      const expected = step.expectedSequence[state.sequence.length];

      if (!expected || expected.x !== point.x || expected.y !== point.y) {
        return correction(
          {
            ...state,
            sequence: [],
          },
          pointFeedback(
            step,
            point,
            'That sequence breaks here. Start the reading again.',
          ),
        );
      }

      const sequence = [...state.sequence, point];

      if (sequence.length < step.expectedSequence.length) {
        return {
          ...state,
          sequence,
          feedback: {
            tone: 'neutral',
            text: `${sequence.length} of ${step.expectedSequence.length} moves read correctly.`,
          },
        };
      }

      return advance(
        lesson,
        { ...state, sequence },
        step.successText,
        state,
      );
    }
  }
}

export function reduceLesson(
  lesson: LessonDefinition,
  state: LessonRuntimeState,
  action: LessonAction,
): LessonRuntimeState {
  if (action.type === 'rewind') {
    const previous = state.history.at(-1);

    if (!previous) return state;

    return {
      lessonId: state.lessonId,
      ...previous,
      history: state.history.slice(0, -1),
    };
  }

  if (state.completed) {
    return state;
  }

  const step = lesson.steps[state.stepIndex];

  if (!step) return state;

  switch (action.type) {
    case 'continue':
      return step.kind === 'continue'
        ? advance(lesson, state, step.successText)
        : state;

    case 'point':
      return handlePoint(lesson, state, step, action.point);

    case 'choice':
      if (step.kind !== 'choose-answer') return state;

      if (action.choiceId !== step.correctChoiceId) {
        return correction(
          state,
          step.wrongChoiceFeedback?.[action.choiceId] ??
            'That answer does not fit this position.',
        );
      }

      return advance(lesson, state, step.successText);

    case 'hint': {
      const hints = step.hints ?? [];
      const hint = hints[Math.min(state.hintIndex, hints.length - 1)];

      if (!hint) return state;

      return {
        ...state,
        hintIndex: Math.min(state.hintIndex + 1, hints.length),
        feedback: {
          tone: 'neutral',
          text: hint.text,
        },
        presentation: applyLessonEffects(
          state.presentation,
          hint.effects,
        ),
      };
    }

    case 'retry':
      return {
        ...state,
        selectedPoints: [],
        sequence: [],
        feedback: null,
        presentation: presentationForStep(step),
      };

    case 'apply-choreography':
      return {
        ...state,
        presentation: applyLessonEffects(
          state.presentation,
          action.effects,
        ),
      };
  }
}

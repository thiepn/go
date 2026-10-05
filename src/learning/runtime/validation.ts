import { isOnBoard, pointKey, createEmptyBoard } from '../../go/engine';
import type {
  LessonBoardSetup,
  LessonDefinition,
  LessonStep,
} from './types';

export interface LessonValidationIssue {
  readonly path: string;
  readonly message: string;
}

function validateSetup(
  setup: LessonBoardSetup,
  path: string,
): LessonValidationIssue[] {
  const issues: LessonValidationIssue[] = [];
  let board;

  try {
    board = createEmptyBoard(setup.size);
  } catch (error) {
    return [
      {
        path: `${path}.size`,
        message:
          error instanceof Error ? error.message : 'Invalid board size.',
      },
    ];
  }

  const seen = new Set<string>();

  for (const [color, stones] of [
    ['black', setup.black ?? []],
    ['white', setup.white ?? []],
  ] as const) {
    for (const [index, point] of stones.entries()) {
      if (!isOnBoard(board, point)) {
        issues.push({
          path: `${path}.${color}[${index}]`,
          message: 'Setup stone is outside the board.',
        });
        continue;
      }

      const key = pointKey(point);

      if (seen.has(key)) {
        issues.push({
          path: `${path}.${color}[${index}]`,
          message: 'Setup stones overlap.',
        });
      }

      seen.add(key);
    }
  }

  return issues;
}

function validateStep(
  step: LessonStep,
  index: number,
  boardSize: number,
): LessonValidationIssue[] {
  const issues: LessonValidationIssue[] = [];
  const path = `steps[${index}]`;
  const board = createEmptyBoard(boardSize);

  const validatePoint = (point: { x: number; y: number }, child: string) => {
    if (!isOnBoard(board, point)) {
      issues.push({
        path: `${path}.${child}`,
        message: 'Point is outside the active lesson board.',
      });
    }
  };

  const pointLists: readonly (readonly { x: number; y: number }[])[] =
    step.kind === 'select-points' ||
    step.kind === 'select-stones' ||
    step.kind === 'mark-liberties' ||
    step.kind === 'identify-territory'
      ? [step.expectedPoints]
      : step.kind === 'select-group'
        ? [step.expectedGroup]
        : step.kind === 'predict-move'
          ? [step.acceptedPoints]
          : step.kind === 'predict-sequence'
            ? [step.expectedSequence]
            : step.kind === 'play-move'
              ? [step.acceptedPoints ?? []]
              : step.kind === 'try-illegal-move'
                ? [[step.point]]
                : [];

  for (const [listIndex, points] of pointLists.entries()) {
    points.forEach((point, pointIndex) =>
      validatePoint(point, `points[${listIndex}][${pointIndex}]`),
    );
  }

  if (step.kind === 'choose-answer') {
    const choiceIds = new Set(step.choices.map((choice) => choice.id));

    if (choiceIds.size !== step.choices.length) {
      issues.push({
        path: `${path}.choices`,
        message: 'Choice IDs must be unique.',
      });
    }

    if (!choiceIds.has(step.correctChoiceId)) {
      issues.push({
        path: `${path}.correctChoiceId`,
        message: 'Correct choice must reference an existing choice.',
      });
    }
  }

  if (step.board) {
    issues.push(...validateSetup(step.board, `${path}.board`));
  }

  return issues;
}

export function validateLesson(
  lesson: LessonDefinition,
): LessonValidationIssue[] {
  const issues = validateSetup(lesson.initialBoard, 'initialBoard');
  const stepIds = new Set<string>();
  let activeSize = lesson.initialBoard.size;

  lesson.steps.forEach((step, index) => {
    if (stepIds.has(step.id)) {
      issues.push({
        path: `steps[${index}].id`,
        message: 'Step IDs must be unique.',
      });
    }

    stepIds.add(step.id);

    if (step.board) {
      activeSize = step.board.size;
    }

    issues.push(...validateStep(step, index, activeSize));

    for (const [cueIndex, cue] of (step.choreography ?? []).entries()) {
      if (!Number.isFinite(cue.atMs) || cue.atMs < 0) {
        issues.push({
          path: `steps[${index}].choreography[${cueIndex}].atMs`,
          message: 'Choreography time must be a non-negative number.',
        });
      }
    }
  });

  if (lesson.steps.length === 0) {
    issues.push({
      path: 'steps',
      message: 'Lesson must contain at least one step.',
    });
  }

  return issues;
}

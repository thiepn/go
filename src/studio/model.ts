import {
  createEmptyBoard,
  setIntersection,
  type Board,
  type Point,
  type Stone,
} from '../go/engine';
import {
  validateLesson,
  type LessonBoardSetup,
  type LessonDefinition,
} from '../learning';
import {
  validateProblem,
  type ProblemDefinition,
  type ProblemSetup,
} from '../practice';

export type AuthoringKind = 'lesson' | 'problem';
export type BoardTool = Stone | 'erase';

export interface AuthoringIssue {
  readonly path: string;
  readonly message: string;
}

export interface AuthoringInspection {
  readonly value: LessonDefinition | ProblemDefinition | null;
  readonly issues: readonly AuthoringIssue[];
  readonly parseError: string | null;
}

export interface LessonSummary {
  readonly steps: number;
  readonly hints: number;
  readonly choreographyCues: number;
}

export interface ProblemSummary {
  readonly nodes: number;
  readonly branches: number;
  readonly hints: number;
}

export const LESSON_TEMPLATE: LessonDefinition = {
  id: 'new-lesson',
  title: 'New lesson',
  concept: 'new-concept',
  initialBoard: {
    size: 9,
    toPlay: 'black',
    black: [],
    white: [],
  },
  steps: [
    {
      id: 'intro',
      kind: 'continue',
      title: 'Notice the position',
      instruction:
        'Explain one idea, then let the learner interact with the board.',
      hints: [],
      choreography: [],
      successText: 'Good. Keep going.',
    },
  ],
};

export const PROBLEM_TEMPLATE: ProblemDefinition = {
  id: 'new-problem',
  title: 'New problem',
  instruction: 'Find the best move.',
  concept: 'new-concept',
  tags: ['new-concept'],
  difficulty: 1,
  setup: {
    size: 9,
    toPlay: 'black',
    black: [],
    white: [],
  },
  root: {
    prompt: 'Find the best move.',
    branches: [
      {
        move: { x: 4, y: 4 },
        verdict: 'solved',
        feedback: 'Correct.',
      },
    ],
  },
  hints: [],
  wrongMoveFeedback: {},
};

export function templateSource(kind: AuthoringKind): string {
  return JSON.stringify(
    kind === 'lesson' ? LESSON_TEMPLATE : PROBLEM_TEMPLATE,
    null,
    2,
  );
}

export function inspectAuthoringSource(
  kind: AuthoringKind,
  source: string,
): AuthoringInspection {
  let value: unknown;

  try {
    value = JSON.parse(source);
  } catch (error) {
    return {
      value: null,
      issues: [],
      parseError:
        error instanceof Error ? error.message : 'Invalid JSON.',
    };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      value: null,
      issues: [
        {
          path: 'root',
          message: 'Authoring content must be a JSON object.',
        },
      ],
      parseError: null,
    };
  }

  try {
    if (kind === 'lesson') {
      const lesson = value as LessonDefinition;
      return {
        value: lesson,
        issues: validateLesson(lesson),
        parseError: null,
      };
    }

    const problem = value as ProblemDefinition;
    return {
      value: problem,
      issues: validateProblem(problem),
      parseError: null,
    };
  } catch (error) {
    return {
      value: value as LessonDefinition | ProblemDefinition,
      issues: [
        {
          path: 'root',
          message:
            error instanceof Error
              ? error.message
              : 'The draft does not match the expected content shape.',
        },
      ],
      parseError: null,
    };
  }
}

function uniquePoints(points: readonly Point[]): Point[] {
  const seen = new Set<string>();
  const result: Point[] = [];

  for (const point of points) {
    const key = `${point.x},${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(point);
  }

  return result;
}

export function setupToBoard(
  setup: LessonBoardSetup | ProblemSetup,
): Board {
  let board = createEmptyBoard(setup.size);

  for (const point of setup.black ?? []) {
    board = setIntersection(board, point, 'black');
  }

  for (const point of setup.white ?? []) {
    board = setIntersection(board, point, 'white');
  }

  return board;
}

export function editSetupPoint<
  T extends LessonBoardSetup | ProblemSetup,
>(
  setup: T,
  point: Point,
  tool: BoardTool,
): T {
  const black = (setup.black ?? []).filter(
    (candidate) =>
      candidate.x !== point.x || candidate.y !== point.y,
  );
  const white = (setup.white ?? []).filter(
    (candidate) =>
      candidate.x !== point.x || candidate.y !== point.y,
  );

  if (tool === 'black') black.push(point);
  if (tool === 'white') white.push(point);

  return {
    ...setup,
    black: uniquePoints(black),
    white: uniquePoints(white),
  };
}

export function lessonSummary(
  lesson: LessonDefinition,
): LessonSummary {
  return {
    steps: lesson.steps.length,
    hints: lesson.steps.reduce(
      (total, step) => total + (step.hints?.length ?? 0),
      0,
    ),
    choreographyCues: lesson.steps.reduce(
      (total, step) =>
        total + (step.choreography?.length ?? 0),
      0,
    ),
  };
}

function countProblemNode(
  node: ProblemDefinition['root'],
): { nodes: number; branches: number } {
  let nodes = 1;
  let branches = node.branches.length;

  for (const branch of node.branches) {
    if (!branch.next) continue;

    const child = countProblemNode(branch.next);
    nodes += child.nodes;
    branches += child.branches;
  }

  return { nodes, branches };
}

export function problemSummary(
  problem: ProblemDefinition,
): ProblemSummary {
  const tree = countProblemNode(problem.root);

  return {
    ...tree,
    hints: problem.hints?.length ?? 0,
  };
}

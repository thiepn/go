import {
  createEmptyBoard,
  isOnBoard,
  pointKey,
} from '../go/engine';
import type {
  ProblemDefinition,
  ProblemNode,
} from './types';

export interface ProblemValidationIssue {
  readonly path: string;
  readonly message: string;
}

function validateNode(
  node: ProblemNode,
  boardSize: number,
  path: string,
  seen: Set<ProblemNode>,
): ProblemValidationIssue[] {
  if (seen.has(node)) {
    return [{
      path,
      message: 'Problem tree contains a cycle.',
    }];
  }

  seen.add(node);
  const issues: ProblemValidationIssue[] = [];
  const board = createEmptyBoard(boardSize);
  const moveKeys = new Set<string>();

  if (node.branches.length === 0) {
    issues.push({
      path: `${path}.branches`,
      message: 'Problem node must contain at least one branch.',
    });
  }

  node.branches.forEach((branch, index) => {
    const branchPath = `${path}.branches[${index}]`;

    if (!isOnBoard(board, branch.move)) {
      issues.push({
        path: `${branchPath}.move`,
        message: 'Branch move is outside the board.',
      });
    }

    const key = pointKey(branch.move);
    if (moveKeys.has(key)) {
      issues.push({
        path: `${branchPath}.move`,
        message: 'Branch moves must be unique within a node.',
      });
    }
    moveKeys.add(key);

    if (branch.opponentMove && !isOnBoard(board, branch.opponentMove)) {
      issues.push({
        path: `${branchPath}.opponentMove`,
        message: 'Opponent move is outside the board.',
      });
    }

    for (const [refIndex, point] of (branch.refutation ?? []).entries()) {
      if (!isOnBoard(board, point)) {
        issues.push({
          path: `${branchPath}.refutation[${refIndex}]`,
          message: 'Refutation point is outside the board.',
        });
      }
    }

    if (branch.verdict === 'continue' && !branch.next) {
      issues.push({
        path: branchPath,
        message: 'A continuing branch must have a next node.',
      });
    }

    if (branch.verdict === 'solved' && branch.next) {
      issues.push({
        path: branchPath,
        message: 'A solved branch cannot have a next node.',
      });
    }

    if (branch.next) {
      issues.push(
        ...validateNode(
          branch.next,
          boardSize,
          `${branchPath}.next`,
          new Set(seen),
        ),
      );
    }
  });

  return issues;
}

export function validateProblem(
  problem: ProblemDefinition,
): ProblemValidationIssue[] {
  const issues: ProblemValidationIssue[] = [];
  let board;

  try {
    board = createEmptyBoard(problem.setup.size);
  } catch (error) {
    return [{
      path: 'setup.size',
      message: error instanceof Error ? error.message : 'Invalid board size.',
    }];
  }

  const occupied = new Set<string>();

  for (const [color, stones] of [
    ['black', problem.setup.black ?? []],
    ['white', problem.setup.white ?? []],
  ] as const) {
    stones.forEach((point, index) => {
      if (!isOnBoard(board, point)) {
        issues.push({
          path: `setup.${color}[${index}]`,
          message: 'Setup stone is outside the board.',
        });
        return;
      }

      const key = pointKey(point);
      if (occupied.has(key)) {
        issues.push({
          path: `setup.${color}[${index}]`,
          message: 'Setup stones overlap.',
        });
      }
      occupied.add(key);
    });
  }

  if (problem.tags.length === 0) {
    issues.push({
      path: 'tags',
      message: 'Problem must have at least one tag.',
    });
  }

  issues.push(...validateNode(problem.root, problem.setup.size, 'root', new Set()));

  return issues;
}

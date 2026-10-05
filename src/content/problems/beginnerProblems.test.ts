import { describe, expect, it } from 'vitest';

import {
  createProblemState,
  reduceProblem,
  validateProblem,
  type ProblemRuntimeState,
} from '../../practice';
import { beginnerProblems } from './beginnerProblems';

function walkAllSolutions(
  problem: (typeof beginnerProblems)[number],
  state: ProblemRuntimeState,
): void {
  for (const branch of state.node.branches) {
    let next = reduceProblem(problem, state, {
      type: 'play',
      point: branch.move,
    });

    expect(next.feedback?.tone).not.toBe('correction');

    if (next.pendingOpponent) {
      next = reduceProblem(problem, next, {
        type: 'opponent',
      });
    }

    if (branch.verdict === 'solved') {
      expect(next.completed).toBe(true);
    } else {
      expect(next.completed).toBe(false);
      walkAllSolutions(problem, next);
    }
  }
}

describe('beginner practice pack', () => {
  it('contains valid problem definitions', () => {
    expect(beginnerProblems).toHaveLength(8);

    for (const problem of beginnerProblems) {
      expect(validateProblem(problem)).toEqual([]);
    }
  });

  it('replays every authored solution variation legally', () => {
    for (const problem of beginnerProblems) {
      walkAllSolutions(problem, createProblemState(problem));
    }
  });

  it('contains a true alternate-solution problem', () => {
    const problem = beginnerProblems.find(
      (candidate) => candidate.id === 'atari-choice-01',
    );

    expect(problem?.root.branches).toHaveLength(2);
    expect(
      problem?.root.branches.every(
        (branch) => branch.verdict === 'solved',
      ),
    ).toBe(true);
  });

  it('contains a multi-step reading tree with alternate first moves', () => {
    const problem = beginnerProblems.find(
      (candidate) => candidate.id === 'read-capture-01',
    );

    expect(problem?.root.branches).toHaveLength(2);
    expect(
      problem?.root.branches.every(
        (branch) =>
          branch.verdict === 'continue' &&
          Boolean(branch.opponentMove) &&
          Boolean(branch.next),
      ),
    ).toBe(true);
  });
});

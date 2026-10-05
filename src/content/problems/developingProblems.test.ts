import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createProblemState,
  reduceProblem,
  validateProblem,
  type ProblemRuntimeState,
} from '../../practice';
import {
  developingProblems,
} from './developingProblems';

function walkAllSolutions(
  problem: (
    typeof developingProblems
  )[number],
  state: ProblemRuntimeState,
): void {
  for (
    const branch of
    state.node.branches
  ) {
    let next =
      reduceProblem(
        problem,
        state,
        {
          type: 'play',
          point: branch.move,
        },
      );

    expect(
      next.feedback?.tone,
    ).not.toBe(
      'correction',
    );

    if (
      next.pendingOpponent
    ) {
      next =
        reduceProblem(
          problem,
          next,
          {
            type: 'opponent',
          },
        );
    }

    if (
      branch.verdict ===
      'solved'
    ) {
      expect(
        next.completed,
      ).toBe(true);
    } else {
      expect(
        next.completed,
      ).toBe(false);
      walkAllSolutions(
        problem,
        next,
      );
    }
  }
}

describe('developing practice pack', () => {
  it('contains nineteen valid problem definitions', () => {
    expect(
      developingProblems,
    ).toHaveLength(19);

    for (
      const problem of
      developingProblems
    ) {
      expect(
        validateProblem(problem),
      ).toEqual([]);
    }
  });

  it('replays every authored solution and opponent reply legally', () => {
    for (
      const problem of
      developingProblems
    ) {
      walkAllSolutions(
        problem,
        createProblemState(
          problem,
        ),
      );
    }
  });

  it('covers every developing lesson concept with practice', () => {
    const concepts = new Set(
      developingProblems.map(
        (problem) =>
          problem.concept,
      ),
    );

    for (const concept of [
      'reading',
      'ladder',
      'net',
      'snapback',
      'semeai',
      'false-eye',
      'vital-point',
      'seki',
      'cutting',
      'shape',
      'weak-groups',
      'attack-defense',
      'influence',
      'invasion',
      'reduction',
      'sente-gote',
      'endgame',
      'opening',
      'joseki',
    ]) {
      expect(
        concepts.has(concept),
      ).toBe(true);
    }
  });

  it('contains a true multi-step ladder tree', () => {
    const problem =
      developingProblems.find(
        (item) =>
          item.id ===
          'ladder-read-01',
      );

    expect(
      problem?.root
        .branches[0]
        ?.verdict,
    ).toBe('continue');
    expect(
      problem?.root
        .branches[0]
        ?.opponentMove,
    ).toBeDefined();
    expect(
      problem?.root
        .branches[0]
        ?.next,
    ).toBeDefined();
  });
});

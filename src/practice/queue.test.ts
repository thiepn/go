import { describe, expect, it } from 'vitest';

import { beginnerProblems } from '../content/problems';
import { buildPracticeQueue } from './queue';
import type { ProblemHistory } from './types';

describe('practice queue', () => {
  it('prioritizes a recently shaky problem over unseen problems', () => {
    const shaky = beginnerProblems[5];
    const history: ProblemHistory = {
      [shaky.id]: {
        problemId: shaky.id,
        attempts: 1,
        successes: 1,
        failures: 2,
        firstTrySuccesses: 0,
        totalHintsUsed: 1,
        lastResult: 'failure',
        lastAttemptAt: 10,
      },
    };

    const queue = buildPracticeQueue(
      beginnerProblems,
      history,
      { maxProblems: 4 },
    );

    expect(queue[0].id).toBe(shaky.id);
  });

  it('filters focused sessions by tags', () => {
    const queue = buildPracticeQueue(
      beginnerProblems,
      {},
      {
        tags: ['connection'],
      },
    );

    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('connect-gap-01');
  });

  it('is deterministic when scores are tied', () => {
    const first = buildPracticeQueue(
      beginnerProblems,
      {},
      { maxProblems: 8 },
    ).map((problem) => problem.id);

    const second = buildPracticeQueue(
      beginnerProblems,
      {},
      { maxProblems: 8 },
    ).map((problem) => problem.id);

    expect(second).toEqual(first);
  });
});

import { describe, expect, it } from 'vitest';

import { beginnerProblems } from '../content/problems';
import { migratePracticeHistory } from './store';
import type { ProblemHistory } from '../practice/types';

describe('mastery migration', () => {
  it('turns existing practice aggregates into one normalized evidence record set', () => {
    const problem = beginnerProblems[0];
    const history: ProblemHistory = {
      [problem.id]: {
        problemId: problem.id,
        attempts: 3,
        successes: 3,
        failures: 2,
        firstTrySuccesses: 1,
        totalHintsUsed: 2,
        lastResult: 'failure',
        lastAttemptAt: 500,
      },
    };

    const migrated = migratePracticeHistory(
      [],
      history,
      beginnerProblems,
    );

    expect(migrated.length).toBeGreaterThan(0);
    expect(migrated[0].source).toBe('practice');
    expect(migrated[0].sourceId).toBe(problem.id);
    expect(migrated[0].occurredAt).toBe(500);
  });

  it('does not migrate the same historical problem twice', () => {
    const problem = beginnerProblems[0];
    const history: ProblemHistory = {
      [problem.id]: {
        problemId: problem.id,
        attempts: 1,
        successes: 1,
        failures: 0,
        firstTrySuccesses: 1,
        totalHintsUsed: 0,
        lastResult: 'success',
        lastAttemptAt: 500,
      },
    };

    const once = migratePracticeHistory(
      [],
      history,
      beginnerProblems,
    );
    const twice = migratePracticeHistory(
      once,
      history,
      beginnerProblems,
    );

    expect(twice).toHaveLength(once.length);
  });
});

import { describe, expect, it } from 'vitest';

import { recordProblemSession } from './history';

describe('practice history', () => {
  it('records clean first-try solves separately from shaky solves', () => {
    let history = recordProblemSession({}, {
      problemId: 'p1',
      success: true,
      firstTry: true,
      mistakes: 0,
      hintsUsed: 0,
      attemptedAt: 1,
    });

    expect(history.p1.firstTrySuccesses).toBe(1);
    expect(history.p1.failures).toBe(0);
    expect(history.p1.lastResult).toBe('success');

    history = recordProblemSession(history, {
      problemId: 'p1',
      success: true,
      firstTry: false,
      mistakes: 2,
      hintsUsed: 1,
      attemptedAt: 2,
    });

    expect(history.p1.attempts).toBe(2);
    expect(history.p1.successes).toBe(2);
    expect(history.p1.failures).toBe(2);
    expect(history.p1.totalHintsUsed).toBe(1);
    expect(history.p1.lastResult).toBe('failure');
  });
});

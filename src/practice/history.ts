import type {
  ProblemHistory,
  ProblemHistoryEntry,
} from './types';

export interface ProblemAttemptResult {
  readonly problemId: string;
  readonly success: boolean;
  readonly firstTry: boolean;
  readonly hintsUsed: number;
  readonly attemptedAt: number;
}

export function recordProblemAttempt(
  history: ProblemHistory,
  result: ProblemAttemptResult,
): ProblemHistory {
  const previous: ProblemHistoryEntry =
    history[result.problemId] ?? {
      problemId: result.problemId,
      attempts: 0,
      successes: 0,
      failures: 0,
      firstTrySuccesses: 0,
      totalHintsUsed: 0,
      lastResult: null,
      lastAttemptAt: null,
    };

  return {
    ...history,
    [result.problemId]: {
      problemId: result.problemId,
      attempts: previous.attempts + 1,
      successes: previous.successes + (result.success ? 1 : 0),
      failures: previous.failures + (result.success ? 0 : 1),
      firstTrySuccesses:
        previous.firstTrySuccesses +
        (result.success && result.firstTry ? 1 : 0),
      totalHintsUsed:
        previous.totalHintsUsed + result.hintsUsed,
      lastResult: result.success ? 'success' : 'failure',
      lastAttemptAt: result.attemptedAt,
    },
  };
}

export const PRACTICE_HISTORY_STORAGE_KEY =
  'thiepn-go:practice-history:v1';

export function loadProblemHistory(): ProblemHistory {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(
      PRACTICE_HISTORY_STORAGE_KEY,
    );
    return raw ? (JSON.parse(raw) as ProblemHistory) : {};
  } catch {
    return {};
  }
}

export function saveProblemHistory(
  history: ProblemHistory,
): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      PRACTICE_HISTORY_STORAGE_KEY,
      JSON.stringify(history),
    );
  } catch {
    // Practice remains usable without persistence.
  }
}

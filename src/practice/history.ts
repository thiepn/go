import {
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import type {
  ProblemHistory,
  ProblemHistoryEntry,
} from './types';

export interface ProblemSessionResult {
  readonly problemId: string;
  readonly success: boolean;
  readonly firstTry: boolean;
  readonly mistakes: number;
  readonly hintsUsed: number;
  readonly attemptedAt: number;
}

export function recordProblemSession(
  history: ProblemHistory,
  result: ProblemSessionResult,
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
      failures: previous.failures + result.mistakes + (result.success ? 0 : 1),
      firstTrySuccesses:
        previous.firstTrySuccesses +
        (result.success && result.firstTry ? 1 : 0),
      totalHintsUsed:
        previous.totalHintsUsed + result.hintsUsed,
      lastResult:
        result.success && result.mistakes === 0
          ? 'success'
          : 'failure',
      lastAttemptAt: result.attemptedAt,
    },
  };
}

export const PRACTICE_HISTORY_STORAGE_KEY =
  'thiepn-go:practice-history:v1';

function isProblemHistory(
  value: unknown,
): value is ProblemHistory {
  if (!isRecord(value)) return false;

  return Object.values(value).every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.problemId === 'string' &&
      typeof entry.attempts === 'number' &&
      typeof entry.successes === 'number' &&
      typeof entry.failures === 'number' &&
      typeof entry.firstTrySuccesses === 'number' &&
      typeof entry.totalHintsUsed === 'number',
  );
}

export function loadProblemHistory(): ProblemHistory {
  return readJson(
    PRACTICE_HISTORY_STORAGE_KEY,
    () => ({}),
    isProblemHistory,
  );
}

export function saveProblemHistory(
  history: ProblemHistory,
): void {
  writeJson(
    PRACTICE_HISTORY_STORAGE_KEY,
    history,
  );
}

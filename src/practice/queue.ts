import type {
  ProblemDefinition,
  ProblemHistory,
  ProblemHistoryEntry,
  PracticeQueueOptions,
} from './types';

function historyFor(
  problemId: string,
  history: ProblemHistory,
): ProblemHistoryEntry | undefined {
  return history[problemId];
}

function priorityScore(
  problem: ProblemDefinition,
  entry: ProblemHistoryEntry | undefined,
): number {
  if (!entry) {
    return 100 - problem.difficulty * 2;
  }

  const evidenceCount = entry.successes + entry.failures;
  const failureRate =
    evidenceCount === 0
      ? 0
      : entry.failures / evidenceCount;

  const lastFailureBoost =
    entry.lastResult === 'failure' ? 35 : 0;

  const hintPenalty =
    entry.attempts === 0
      ? 0
      : Math.min(20, entry.totalHintsUsed / entry.attempts * 8);

  const successPenalty = Math.min(45, entry.successes * 7);

  return (
    60 +
    failureRate * 45 +
    lastFailureBoost +
    hintPenalty -
    successPenalty -
    problem.difficulty
  );
}

export function buildPracticeQueue(
  problems: readonly ProblemDefinition[],
  history: ProblemHistory,
  options: PracticeQueueOptions = {},
): ProblemDefinition[] {
  const tags = new Set(options.tags ?? []);
  const difficulties = new Set(options.includeDifficulties ?? []);

  const filtered = problems.filter((problem) => {
    const tagMatch =
      tags.size === 0 ||
      problem.tags.some((tag) => tags.has(tag));

    const difficultyMatch =
      difficulties.size === 0 ||
      difficulties.has(problem.difficulty);

    return tagMatch && difficultyMatch;
  });

  return filtered
    .map((problem, originalIndex) => ({
      problem,
      originalIndex,
      score: priorityScore(
        problem,
        historyFor(problem.id, history),
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.originalIndex - b.originalIndex,
    )
    .slice(0, options.maxProblems ?? filtered.length)
    .map(({ problem }) => problem);
}

import type { ProblemHistory } from '../practice/types';
import type { ProblemDefinition } from '../practice/types';
import {
  isArrayOf,
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import {
  createLearningEvidence,
  type LearningEvidenceInput,
} from './evidence';
import type { MasteryEvidence } from './types';

export const MASTERY_EVIDENCE_STORAGE_KEY =
  'thiepn-go:mastery-evidence:v1';

function isMasteryEvidence(
  value: unknown,
): value is MasteryEvidence {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.conceptId === 'string' &&
    typeof value.source === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.outcome === 'number' &&
    typeof value.weight === 'number' &&
    typeof value.occurredAt === 'number'
  );
}

export function loadMasteryEvidence(): MasteryEvidence[] {
  return readJson(
    MASTERY_EVIDENCE_STORAGE_KEY,
    () => [],
    (value): value is MasteryEvidence[] =>
      isArrayOf(value, isMasteryEvidence),
  );
}

export function saveMasteryEvidence(
  evidence: readonly MasteryEvidence[],
): void {
  writeJson(
    MASTERY_EVIDENCE_STORAGE_KEY,
    evidence,
  );
}

export function appendMasteryEvidence(
  current: readonly MasteryEvidence[],
  input: LearningEvidenceInput,
): MasteryEvidence[] {
  return [
    ...current,
    ...createLearningEvidence(input),
  ];
}

export function recordMasteryEvidence(
  input: LearningEvidenceInput,
): MasteryEvidence[] {
  const next = appendMasteryEvidence(
    loadMasteryEvidence(),
    input,
  );
  saveMasteryEvidence(next);
  return next;
}

export function recordMasteryEvidenceOnce(
  input: LearningEvidenceInput,
): MasteryEvidence[] {
  const current = loadMasteryEvidence();
  const alreadyRecorded = current.some(
    (event) =>
      event.source === input.source &&
      event.sourceId === input.sourceId,
  );

  if (alreadyRecorded) {
    return current;
  }

  const next = appendMasteryEvidence(
    current,
    input,
  );
  saveMasteryEvidence(next);
  return next;
}

export function migratePracticeHistory(
  current: readonly MasteryEvidence[],
  history: ProblemHistory,
  problems: readonly ProblemDefinition[],
): MasteryEvidence[] {
  const existingProblemIds = new Set(
    current
      .filter((event) => event.source === 'practice')
      .map((event) => event.sourceId),
  );

  let next = [...current];

  for (const problem of problems) {
    const entry = history[problem.id];

    if (
      !entry ||
      existingProblemIds.has(problem.id) ||
      entry.attempts === 0
    ) {
      continue;
    }

    const cleanRate =
      entry.firstTrySuccesses / entry.attempts;
    const mistakeRate =
      entry.failures /
      Math.max(1, entry.successes + entry.failures);
    const hintAverage =
      entry.totalHintsUsed / entry.attempts;

    next = appendMasteryEvidence(next, {
      source: 'practice',
      sourceId: problem.id,
      sourceConcept: problem.concept,
      success: entry.successes > 0,
      firstAttempt: cleanRate >= 0.7,
      mistakes: Math.round(mistakeRate * 2),
      hintsUsed: Math.round(hintAverage),
      occurredAt: entry.lastAttemptAt ?? Date.now(),
      baseWeight: Math.min(1.25, 0.55 + entry.attempts * 0.12),
    });
  }

  return next;
}

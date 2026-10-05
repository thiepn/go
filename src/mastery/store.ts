import type { ProblemHistory } from '../practice/types';
import type { ProblemDefinition } from '../practice/types';
import {
  createLearningEvidence,
  type LearningEvidenceInput,
} from './evidence';
import type { MasteryEvidence } from './types';

export const MASTERY_EVIDENCE_STORAGE_KEY =
  'thiepn-go:mastery-evidence:v1';

function parseEvidence(raw: string | null): MasteryEvidence[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as MasteryEvidence[])
      : [];
  } catch {
    return [];
  }
}

export function loadMasteryEvidence(): MasteryEvidence[] {
  if (typeof window === 'undefined') return [];

  try {
    return parseEvidence(
      window.localStorage.getItem(
        MASTERY_EVIDENCE_STORAGE_KEY,
      ),
    );
  } catch {
    return [];
  }
}

export function saveMasteryEvidence(
  evidence: readonly MasteryEvidence[],
): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      MASTERY_EVIDENCE_STORAGE_KEY,
      JSON.stringify(evidence),
    );
  } catch {
    // Learning remains usable without persistence.
  }
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

import { resolveConceptIds } from './graph';
import type {
  MasteryEvidence,
  MasteryEvidenceSource,
} from './types';

export interface LearningEvidenceInput {
  readonly source: MasteryEvidenceSource;
  readonly sourceId: string;
  readonly sourceConcept: string;
  readonly success: boolean;
  readonly firstAttempt?: boolean;
  readonly hintsUsed?: number;
  readonly mistakes?: number;
  readonly responseMs?: number;
  readonly occurredAt: number;
  readonly baseWeight?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createEvidenceId(
  input: LearningEvidenceInput,
  conceptId: string,
  index: number,
): string {
  const random =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${input.occurredAt}-${index}-${Math.round(Math.random() * 1e9)}`;

  return `${input.source}:${input.sourceId}:${conceptId}:${random}`;
}

export function evidenceOutcome(
  input: LearningEvidenceInput,
): number {
  if (!input.success) return 0;

  let score = 1;
  const mistakes = input.mistakes ?? 0;
  const hints = input.hintsUsed ?? 0;

  score -= Math.min(0.42, mistakes * 0.14);
  score -= Math.min(0.3, hints * 0.12);

  if (input.firstAttempt === false) {
    score -= 0.08;
  }

  return clamp01(score);
}

export function createLearningEvidence(
  input: LearningEvidenceInput,
): MasteryEvidence[] {
  const concepts = resolveConceptIds(input.sourceConcept);
  const outcome = evidenceOutcome(input);
  const baseWeight =
    input.baseWeight ??
    (input.source === 'practice'
      ? 1
      : input.source === 'review'
        ? 1.1
        : input.source === 'guided-game'
          ? 0.72
          : 0.58);

  return concepts.map((conceptId, index) => ({
    id: createEvidenceId(input, conceptId, index),
    conceptId,
    source: input.source,
    sourceId: input.sourceId,
    outcome,
    weight: baseWeight / Math.max(1, concepts.length * 0.72),
    firstAttempt: input.firstAttempt,
    hintsUsed: input.hintsUsed,
    mistakes: input.mistakes,
    responseMs: input.responseMs,
    occurredAt: input.occurredAt,
  }));
}

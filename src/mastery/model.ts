import {
  CONCEPTS,
  getConcept,
} from './graph';
import type {
  ConceptMastery,
  MasteryEvidence,
  MasterySnapshot,
  MasteryState,
} from './types';

const DAY_MS = 86_400_000;
const LN2 = Math.log(2);

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function stateFor(
  mastery: number,
  confidence: number,
  evidenceCount: number,
): MasteryState {
  if (evidenceCount === 0) return 'unknown';
  if (mastery >= 0.8 && confidence >= 0.62) return 'mastered';
  if (mastery >= 0.55) return 'established';
  return 'learning';
}

function rawConceptMastery(
  conceptId: string,
  evidence: readonly MasteryEvidence[],
  now: number,
): Omit<ConceptMastery, 'mastery' | 'state'> {
  const concept = getConcept(conceptId);

  if (!concept) {
    throw new Error(`Unknown concept "${conceptId}".`);
  }

  const relevant = evidence
    .filter((event) => event.conceptId === conceptId)
    .sort((a, b) => a.occurredAt - b.occurredAt);

  if (relevant.length === 0) {
    return {
      concept,
      exposureCount: 0,
      evidenceCount: 0,
      sourceCount: 0,
      accuracy: 0,
      firstAttemptAccuracy: null,
      hintRate: 0,
      averageResponseMs: null,
      lastEvidenceAt: null,
      retention: 0,
      confidence: 0,
      rawMastery: 0,
      dueForReview: false,
    };
  }

  const totalWeight = relevant.reduce(
    (sum, event) => sum + event.weight,
    0,
  );

  const weightedAccuracy =
    relevant.reduce(
      (sum, event) => sum + event.outcome * event.weight,
      0,
    ) / totalWeight;

  const firstAttemptEvidence = relevant.filter(
    (event) => event.firstAttempt !== undefined,
  );
  const firstAttemptAccuracy =
    firstAttemptEvidence.length === 0
      ? null
      : firstAttemptEvidence.filter(
          (event) => event.firstAttempt,
        ).length / firstAttemptEvidence.length;

  const hintEvidence = relevant.filter(
    (event) => event.hintsUsed !== undefined,
  );
  const hintRate =
    hintEvidence.length === 0
      ? 0
      : hintEvidence.filter(
          (event) => (event.hintsUsed ?? 0) > 0,
        ).length / hintEvidence.length;

  const timed = relevant.filter(
    (event) =>
      event.responseMs !== undefined &&
      Number.isFinite(event.responseMs),
  );
  const averageResponseMs =
    timed.length === 0
      ? null
      : timed.reduce(
          (sum, event) => sum + (event.responseMs ?? 0),
          0,
        ) / timed.length;

  const sourceCount = new Set(
    relevant.map((event) => event.source),
  ).size;

  const successfulWeight = relevant.reduce(
    (sum, event) =>
      sum + event.weight * event.outcome,
    0,
  );

  const halfLifeDays = Math.min(
    45,
    2.5 + successfulWeight * 4.5 + sourceCount * 2.5,
  );

  const lastEvidenceAt =
    relevant[relevant.length - 1]?.occurredAt ?? null;
  const ageDays =
    lastEvidenceAt === null
      ? Infinity
      : Math.max(0, now - lastEvidenceAt) / DAY_MS;
  const retention =
    lastEvidenceAt === null
      ? 0
      : Math.exp(-LN2 * ageDays / halfLifeDays);

  const confidence =
    1 - Math.exp(-totalWeight / 2.6);

  const firstTryFactor =
    firstAttemptAccuracy === null
      ? 0.92
      : 0.78 + firstAttemptAccuracy * 0.22;

  const hintFactor =
    1 - Math.min(0.18, hintRate * 0.18);

  const rawMastery = clamp01(
    weightedAccuracy *
      firstTryFactor *
      hintFactor *
      (0.68 + confidence * 0.32) *
      (0.62 + retention * 0.38),
  );

  return {
    concept,
    exposureCount: relevant.length,
    evidenceCount: relevant.length,
    sourceCount,
    accuracy: weightedAccuracy,
    firstAttemptAccuracy,
    hintRate,
    averageResponseMs,
    lastEvidenceAt,
    retention,
    confidence,
    rawMastery,
    dueForReview:
      relevant.length > 0 &&
      (retention < 0.66 || weightedAccuracy < 0.68),
  };
}

export function buildMasterySnapshot(
  evidence: readonly MasteryEvidence[],
  now = Date.now(),
): MasterySnapshot {
  const raw = new Map(
    CONCEPTS.map((concept) => [
      concept.id,
      rawConceptMastery(concept.id, evidence, now),
    ]),
  );

  const finalized: Record<string, ConceptMastery> = {};

  const resolve = (
    conceptId: string,
    trail = new Set<string>(),
  ): ConceptMastery => {
    const existing = finalized[conceptId];
    if (existing) return existing;

    if (trail.has(conceptId)) {
      throw new Error('Knowledge graph contains a prerequisite cycle.');
    }

    const base = raw.get(conceptId);
    if (!base) {
      throw new Error(`Unknown concept "${conceptId}".`);
    }

    const nextTrail = new Set(trail);
    nextTrail.add(conceptId);

    const prerequisiteMasteries =
      base.concept.prerequisites.map(
        (prerequisite) =>
          resolve(prerequisite, nextTrail).mastery,
      );

    const prerequisiteFloor =
      prerequisiteMasteries.length === 0
        ? 1
        : Math.min(...prerequisiteMasteries);

    const mastery = clamp01(
      base.rawMastery *
        (0.72 + prerequisiteFloor * 0.28),
    );

    const result: ConceptMastery = {
      ...base,
      mastery,
      state: stateFor(
        mastery,
        base.confidence,
        base.evidenceCount,
      ),
    };

    finalized[conceptId] = result;
    return result;
  };

  for (const concept of CONCEPTS) {
    resolve(concept.id);
  }

  const evidenced = Object.values(finalized).filter(
    (concept) => concept.evidenceCount > 0,
  );
  const overallMastery =
    evidenced.length === 0
      ? 0
      : evidenced.reduce(
          (sum, concept) => sum + concept.mastery,
          0,
        ) / evidenced.length;

  return {
    generatedAt: now,
    concepts: finalized,
    overallMastery,
    evidenceCount: evidence.length,
  };
}

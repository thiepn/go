import {
  recordMasteryEvidenceOnce,
} from '../mastery/store';
import type {
  GameReview,
  ReviewFinding,
} from './types';

function evidenceWeight(
  finding: ReviewFinding,
): number {
  if (
    finding.severity === 'mistake' &&
    finding.confidence === 'high'
  ) {
    return 1.15;
  }

  return 0;
}

export function syncReviewMasteryEvidence(
  review: GameReview,
): void {
  for (const finding of review.findings) {
    if (!finding.masteryEligible) {
      continue;
    }

    const weight = evidenceWeight(
      finding,
    );

    if (weight <= 0) continue;

    recordMasteryEvidenceOnce({
      source: 'review',
      sourceId: finding.id,
      sourceConcept: finding.conceptId,
      success: false,
      firstAttempt: false,
      mistakes: 1,
      hintsUsed: 0,
      occurredAt:
        review.record.playedAt +
        finding.moveNumber,
      baseWeight: weight,
    });
  }
}

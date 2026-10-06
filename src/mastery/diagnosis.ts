import {
  CONCEPTS,
  descendantCount,
  getConcept,
} from './graph';
import type {
  MasteryRecommendation,
  MasterySnapshot,
} from './types';

function recommendationReason(
  snapshot: MasterySnapshot,
  conceptId: string,
): string {
  const concept = snapshot.concepts[conceptId];
  const descendants = descendantCount(conceptId);

  if (concept.dueForReview && concept.mastery >= 0.55) {
    return `${concept.concept.title} is fading with time. A short review now should restore it before harder skills depend on it.`;
  }

  if (descendants >= 3) {
    return `${concept.concept.title} supports ${descendants} later skills. Strengthening this foundation should improve several downstream concepts at once.`;
  }

  const dependent = CONCEPTS.find((candidate) =>
    candidate.prerequisites.includes(conceptId),
  );

  if (dependent) {
    return `${concept.concept.title} is a prerequisite for ${dependent.title}. Improving the foundation is more useful than drilling the downstream symptom.`;
  }

  return `${concept.concept.title} is currently one of your weakest practiced skills and is ready for targeted review.`;
}

function dependsOn(
  conceptId: string,
  prerequisiteId: string,
  seen = new Set<string>(),
): boolean {
  if (seen.has(conceptId)) return false;
  seen.add(conceptId);

  const concept = getConcept(conceptId);
  if (!concept) return false;

  if (concept.prerequisites.includes(prerequisiteId)) {
    return true;
  }

  return concept.prerequisites.some(
    (prerequisite) =>
      dependsOn(prerequisite, prerequisiteId, seen),
  );
}

function evidencedWeakDescendants(
  snapshot: MasterySnapshot,
  conceptId: string,
): number {
  return Object.values(snapshot.concepts).filter(
    (candidate) =>
      candidate.concept.id !== conceptId &&
      candidate.evidenceCount > 0 &&
      candidate.mastery < 0.55 &&
      dependsOn(candidate.concept.id, conceptId),
  ).length;
}

export function recommendMasteryFocus(
  snapshot: MasterySnapshot,
): MasteryRecommendation | null {
  const candidates = Object.values(snapshot.concepts).filter(
    (concept) =>
      concept.evidenceCount > 0 &&
      concept.concept.practiceTags.length > 0,
  );

  if (candidates.length === 0) return null;

  const ranked = candidates
    .map((concept) => {
      const leverage = descendantCount(concept.concept.id);
      const weakness = 1 - concept.mastery;
      const reviewBoost = concept.dueForReview ? 0.22 : 0;
      const evidenceStrength =
        Math.min(0.08, concept.confidence * 0.08);
      const rootCauseBoost = Math.min(
        0.36,
        evidencedWeakDescendants(
          snapshot,
          concept.concept.id,
        ) * 0.12,
      );

      return {
        concept,
        score:
          weakness +
          reviewBoost +
          evidenceStrength +
          rootCauseBoost +
          Math.min(0.28, leverage * 0.035),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.concept.mastery - b.concept.mastery,
    );

  const best = ranked[0]?.concept;
  if (!best) return null;

  return {
    conceptId: best.concept.id,
    title: best.concept.title,
    reason: recommendationReason(
      snapshot,
      best.concept.id,
    ),
    practiceTags: best.concept.practiceTags,
    mastery: best.mastery,
    dueForReview: best.dueForReview,
  };
}

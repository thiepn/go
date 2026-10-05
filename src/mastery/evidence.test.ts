import { describe, expect, it } from 'vitest';

import {
  createLearningEvidence,
  evidenceOutcome,
} from './evidence';

describe('mastery evidence', () => {
  it('maps source concepts onto canonical graph concepts', () => {
    const evidence = createLearningEvidence({
      source: 'lesson',
      sourceId: 'turns',
      sourceConcept: 'turns-and-liberties',
      success: true,
      firstAttempt: true,
      hintsUsed: 0,
      mistakes: 0,
      occurredAt: 100,
    });

    expect(evidence.map((item) => item.conceptId)).toEqual([
      'turns',
      'liberties',
    ]);
  });

  it('scores a clean solve above a hinted mistaken solve', () => {
    const clean = evidenceOutcome({
      source: 'practice',
      sourceId: 'a',
      sourceConcept: 'capture',
      success: true,
      firstAttempt: true,
      hintsUsed: 0,
      mistakes: 0,
      occurredAt: 100,
    });

    const shaky = evidenceOutcome({
      source: 'practice',
      sourceId: 'b',
      sourceConcept: 'capture',
      success: true,
      firstAttempt: false,
      hintsUsed: 2,
      mistakes: 2,
      occurredAt: 100,
    });

    expect(clean).toBe(1);
    expect(shaky).toBeLessThan(clean);
    expect(shaky).toBeGreaterThan(0);
  });
});

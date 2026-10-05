import { describe, expect, it } from 'vitest';

import { buildMasterySnapshot } from './model';
import type { MasteryEvidence } from './types';

const DAY = 86_400_000;

function event(
  conceptId: string,
  occurredAt: number,
  overrides: Partial<MasteryEvidence> = {},
): MasteryEvidence {
  return {
    id: `${conceptId}-${occurredAt}-${overrides.id ?? 'e'}`,
    conceptId,
    source: 'practice',
    sourceId: `${conceptId}-problem`,
    outcome: 1,
    weight: 1,
    firstAttempt: true,
    hintsUsed: 0,
    mistakes: 0,
    occurredAt,
    ...overrides,
  };
}

describe('mastery model', () => {
  it('decays retention and mastery as evidence ages', () => {
    const now = 1_000_000_000;
    const evidence = [
      event('board', now),
      event('liberties', now),
      event('liberties', now - DAY),
    ];

    const fresh = buildMasterySnapshot(evidence, now);
    const later = buildMasterySnapshot(
      evidence,
      now + 30 * DAY,
    );

    expect(
      later.concepts.liberties.retention,
    ).toBeLessThan(
      fresh.concepts.liberties.retention,
    );
    expect(
      later.concepts.liberties.mastery,
    ).toBeLessThan(
      fresh.concepts.liberties.mastery,
    );
    expect(later.concepts.liberties.dueForReview).toBe(true);
  });

  it('moderates downstream mastery when prerequisites are weak', () => {
    const now = 2_000_000_000;
    const captureEvidence = [
      event('capture', now),
      event('capture', now - 1),
      event('capture', now - 2),
    ];

    const withoutFoundation = buildMasterySnapshot(
      captureEvidence,
      now,
    );

    const withFoundation = buildMasterySnapshot(
      [
        event('board', now),
        event('liberties', now),
        event('liberties', now - 1),
        event('groups', now),
        event('groups', now - 1),
        event('atari', now),
        event('atari', now - 1),
        ...captureEvidence,
      ],
      now,
    );

    expect(
      withFoundation.concepts.capture.mastery,
    ).toBeGreaterThan(
      withoutFoundation.concepts.capture.mastery,
    );
  });

  it('records response time without using speed as a mastery reward', () => {
    const now = 3_000_000_000;
    const fast = buildMasterySnapshot(
      [
        event('board', now),
        event('liberties', now, {
          responseMs: 1_000,
        }),
      ],
      now,
    );

    const slow = buildMasterySnapshot(
      [
        event('board', now),
        event('liberties', now, {
          responseMs: 120_000,
        }),
      ],
      now,
    );

    expect(
      fast.concepts.liberties.mastery,
    ).toBe(
      slow.concepts.liberties.mastery,
    );
    expect(
      slow.concepts.liberties.averageResponseMs,
    ).toBe(120_000);
  });
});

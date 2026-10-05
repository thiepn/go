import { describe, expect, it } from 'vitest';

import { recommendMasteryFocus } from './diagnosis';
import { buildMasterySnapshot } from './model';
import type { MasteryEvidence } from './types';

function event(
  conceptId: string,
  outcome: number,
  id: string,
): MasteryEvidence {
  return {
    id,
    conceptId,
    source: 'practice',
    sourceId: id,
    outcome,
    weight: 1,
    firstAttempt: outcome > 0.8,
    hintsUsed: outcome > 0.8 ? 0 : 1,
    mistakes: outcome > 0.8 ? 0 : 1,
    occurredAt: 10_000,
  };
}

describe('mastery diagnosis', () => {
  it('selects a weak high-leverage foundation ahead of capture', () => {
    const snapshot = buildMasterySnapshot(
      [
        event('board', 1, 'board'),
        event('liberties', 0.35, 'liberties-1'),
        event('liberties', 0.4, 'liberties-2'),
        event('groups', 0.72, 'groups'),
        event('atari', 0.55, 'atari'),
        event('capture', 0.3, 'capture-1'),
        event('capture', 0.35, 'capture-2'),
      ],
      10_000,
    );

    const recommendation =
      recommendMasteryFocus(snapshot);

    expect(recommendation).not.toBeNull();
    expect(recommendation?.conceptId).toBe('liberties');
    expect(recommendation?.practiceTags).toContain('liberties');
  });

  it('returns no invented weakness without evidence', () => {
    const snapshot = buildMasterySnapshot([], 10_000);

    expect(recommendMasteryFocus(snapshot)).toBeNull();
  });
});

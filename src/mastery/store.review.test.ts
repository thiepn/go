import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  MASTERY_EVIDENCE_STORAGE_KEY,
  recordMasteryEvidenceOnce,
} from './store';

function fakeStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

describe('review mastery persistence', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not duplicate the same review finding when Review is reopened', () => {
    const localStorage = fakeStorage();

    vi.stubGlobal('window', {
      localStorage,
    });

    const input = {
      source: 'review' as const,
      sourceId: 'game-1:m7:ignored-atari',
      sourceConcept: 'safety',
      success: false,
      firstAttempt: false,
      mistakes: 1,
      hintsUsed: 0,
      occurredAt: 100,
      baseWeight: 1.15,
    };

    recordMasteryEvidenceOnce(input);
    recordMasteryEvidenceOnce(input);

    const stored = JSON.parse(
      localStorage.getItem(
        MASTERY_EVIDENCE_STORAGE_KEY,
      ) ?? '[]',
    ) as unknown[];

    expect(stored).toHaveLength(1);
  });
});

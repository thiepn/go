import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  MASTERY_EVIDENCE_STORAGE_KEY,
} from '../mastery/store';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  syncReviewMasteryEvidence,
} from './mastery';
import type {
  GameReview,
  ReviewFinding,
} from './types';

function fakeStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

const record: SavedGameRecord = {
  id: 'game-1',
  playedAt: 100,
  settings: {
    mode: 'computer',
    boardSize: 9,
    humanColor: 'black',
    botLevel: '25k',
    handicap: 0,
    komi: 6.5,
    assistanceLevel: 'independent',
    clock: 'untimed',
  },
  moves: [],
  result: {
    type: 'resign',
    winner: 'white',
    resignedBy: 'black',
  },
  captures: {
    black: 0,
    white: 0,
  },
};

function finding(
  overrides: Partial<ReviewFinding>,
): ReviewFinding {
  return {
    id: 'game-1:m7:ignored-atari',
    kind: 'ignored-atari',
    moveNumber: 7,
    player: 'black',
    severity: 'mistake',
    confidence: 'high',
    conceptId: 'safety',
    practiceTags: ['defense'],
    title: 'Ignored atari',
    summary: 'summary',
    explanation: 'explanation',
    actualMove: { x: 1, y: 1 },
    highlightPoints: [],
    alternativePoints: [],
    masteryEligible: true,
    ...overrides,
  };
}

describe('review mastery bridge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records only findings explicitly eligible for mastery', () => {
    const localStorage = fakeStorage();
    vi.stubGlobal('window', {
      localStorage,
    });

    const review: GameReview = {
      record,
      frames: [],
      findings: [
        finding({}),
        finding({
          id: 'game-1:m8:missed-capture',
          kind: 'missed-capture',
          moveNumber: 8,
          severity: 'opportunity',
          confidence: 'medium',
          conceptId: 'capture',
          masteryEligible: false,
        }),
      ],
      concepts: [],
      mistakeCount: 1,
      warningCount: 0,
      opportunityCount: 1,
    };

    syncReviewMasteryEvidence(review);

    const stored = JSON.parse(
      localStorage.getItem(
        MASTERY_EVIDENCE_STORAGE_KEY,
      ) ?? '[]',
    ) as {
      sourceId: string;
      conceptId: string;
    }[];

    expect(stored).toHaveLength(1);
    expect(stored[0].sourceId).toBe(
      'game-1:m7:ignored-atari',
    );
    expect(stored[0].conceptId).toBe('safety');
  });
});

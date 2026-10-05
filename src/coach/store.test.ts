import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  CoachPlan,
} from './types';
import {
  activeCoachPlan,
  markCoachPracticeComplete,
  setActiveCoachPlan,
} from './store';

function fakeStorage() {
  const values =
    new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(
      key: string,
      value: string,
    ) {
      values.set(key, value);
    },
  };
}

const plan: CoachPlan = {
  id: 'coach-1',
  createdAt: 100,
  sourceGameIds: ['g1'],
  focus: {
    conceptId: 'safety',
    title: 'Safety',
    confidence: 'medium',
    reason: 'Repeated issue.',
    practiceTags: [
      'defense',
      'atari',
    ],
    currentMastery: 0.4,
    dueForReview: true,
    recurringGameCount: 1,
    findingCount: 2,
  },
  objective:
    'Check your groups first.',
  turningPoints: [],
  baseline: {
    mastery: 0.4,
    signalPer20Moves: 2,
    findingCount: 2,
    learnerMoves: 20,
  },
  engineEnhanced: false,
};

describe('coach store', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records practice completion without replacing the active plan', () => {
    vi.stubGlobal('window', {
      localStorage:
        fakeStorage(),
    });

    setActiveCoachPlan(plan);
    markCoachPracticeComplete(
      plan.id,
      {
        totalProblems: 5,
        cleanSolves: 4,
        repeatedProblems: 1,
      },
      200,
    );

    const stored =
      activeCoachPlan();

    expect(stored?.id).toBe(
      plan.id,
    );
    expect(
      stored?.practiceSummary,
    ).toEqual({
      completedAt: 200,
      totalProblems: 5,
      cleanSolves: 4,
      repeatedProblems: 1,
    });
  });
});

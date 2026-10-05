import { describe, expect, it } from 'vitest';

import {
  firstGuidedGame,
  firstStoneLesson,
} from '../content';
import {
  createGuidedGameState,
  reduceGuidedGame,
} from '../guided';
import {
  createLessonRuntime,
  reduceLesson,
} from '../learning/runtime';

describe('mastery evidence integration counters', () => {
  it('keeps cumulative lesson mistakes and hints across progression and rewind', () => {
    let state = createLessonRuntime(firstStoneLesson);

    state = reduceLesson(firstStoneLesson, state, {
      type: 'continue',
    });

    state = reduceLesson(firstStoneLesson, state, {
      type: 'hint',
    });

    state = reduceLesson(firstStoneLesson, state, {
      type: 'point',
      point: { x: 0, y: 0 },
    });

    expect(state.totalHintsUsed).toBe(1);
    expect(state.totalAttempts).toBe(1);

    state = reduceLesson(firstStoneLesson, state, {
      type: 'point',
      point: { x: 2, y: 2 },
    });

    expect(state.stepIndex).toBe(2);
    expect(state.totalHintsUsed).toBe(1);
    expect(state.totalAttempts).toBe(1);

    state = reduceLesson(firstStoneLesson, state, {
      type: 'rewind',
    });

    expect(state.totalHintsUsed).toBe(1);
    expect(state.totalAttempts).toBe(1);
  });

  it('records off-plan guided moves as mistakes without mutating the game', () => {
    const state = createGuidedGameState(firstGuidedGame);
    const next = reduceGuidedGame(firstGuidedGame, state, {
      type: 'play',
      point: { x: 4, y: 4 },
    });

    expect(next.mistakes).toBe(1);
    expect(next.game.moves).toHaveLength(0);
    expect(next.feedback?.tone).toBe('correction');
  });
});

import { describe, expect, it } from 'vitest';

import type { LessonDefinition } from './types';
import {
  createLessonRuntime,
  reduceLesson,
} from './runtime';

describe('rule-teaching primitives', () => {
  it('treats the expected illegal move as successful learning evidence', () => {
    const lesson: LessonDefinition = {
      id: 'suicide-demo',
      title: 'Suicide demo',
      concept: 'suicide',
      initialBoard: {
        size: 3,
        toPlay: 'black',
        white: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      steps: [
        {
          id: 'try',
          kind: 'try-illegal-move',
          title: 'Try it',
          instruction: 'Try the middle.',
          point: { x: 1, y: 1 },
          expectedReason: 'suicide',
        },
      ],
    };

    let state = createLessonRuntime(lesson);
    state = reduceLesson(lesson, state, {
      type: 'point',
      point: { x: 1, y: 1 },
    });

    expect(state.completed).toBe(true);
  });

  it('passes through the engine and ends after two consecutive passes', () => {
    const lesson: LessonDefinition = {
      id: 'pass-demo',
      title: 'Pass demo',
      concept: 'pass',
      initialBoard: { size: 5 },
      steps: [
        {
          id: 'black-pass',
          kind: 'pass',
          title: 'Pass',
          instruction: 'Pass.',
        },
        {
          id: 'white-pass',
          kind: 'pass',
          title: 'Pass again',
          instruction: 'Pass.',
        },
      ],
    };

    let state = createLessonRuntime(lesson);
    state = reduceLesson(lesson, state, { type: 'pass' });
    expect(state.board.consecutivePasses).toBe(1);

    state = reduceLesson(lesson, state, { type: 'pass' });
    expect(state.board.status).toBe('finished');
    expect(state.completed).toBe(true);
  });
});

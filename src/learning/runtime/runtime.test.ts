import { describe, expect, it } from 'vitest';

import { getIntersection } from '../../go/engine';
import {
  createLessonRuntime,
  reduceLesson,
} from './runtime';
import type { LessonDefinition } from './types';

const lesson: LessonDefinition = {
  id: 'runtime-test',
  title: 'Runtime test',
  concept: 'test',
  initialBoard: {
    size: 5,
    black: [{ x: 2, y: 2 }],
  },
  steps: [
    {
      id: 'continue',
      kind: 'continue',
      title: 'Look',
      instruction: 'Look at the stone.',
    },
    {
      id: 'liberties',
      kind: 'mark-liberties',
      title: 'Find liberties',
      instruction: 'Mark every liberty.',
      expectedPoints: [
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: 3 },
      ],
      successText: 'All four.',
    },
    {
      id: 'move',
      kind: 'play-move',
      title: 'Place',
      instruction: 'Place a stone.',
      board: {
        size: 5,
        toPlay: 'white',
      },
      acceptedPoints: [{ x: 1, y: 1 }],
    },
  ],
};

describe('lesson runtime', () => {
  it('advances explicit continue steps', () => {
    const state = createLessonRuntime(lesson);
    const next = reduceLesson(lesson, state, { type: 'continue' });

    expect(next.stepIndex).toBe(1);
    expect(next.history).toHaveLength(1);
  });

  it('collects point answers until the exact expected set is complete', () => {
    let state = createLessonRuntime(lesson);
    state = reduceLesson(lesson, state, { type: 'continue' });

    for (const point of lesson.steps[1].kind === 'mark-liberties'
      ? lesson.steps[1].expectedPoints
      : []) {
      state = reduceLesson(lesson, state, { type: 'point', point });
    }

    expect(state.stepIndex).toBe(2);
    expect(state.feedback?.tone).toBe('success');
  });

  it('keeps the learner on the step and records correction attempts', () => {
    let state = createLessonRuntime(lesson);
    state = reduceLesson(lesson, state, { type: 'continue' });
    state = reduceLesson(lesson, state, {
      type: 'point',
      point: { x: 0, y: 0 },
    });

    expect(state.stepIndex).toBe(1);
    expect(state.attempts).toBe(1);
    expect(state.feedback?.tone).toBe('correction');
  });

  it('uses the Go engine for play-move steps', () => {
    let state = createLessonRuntime(lesson);
    state = reduceLesson(lesson, state, { type: 'continue' });

    const libertyStep = lesson.steps[1];

    if (libertyStep.kind !== 'mark-liberties') {
      throw new Error('Unexpected fixture.');
    }

    for (const point of libertyStep.expectedPoints) {
      state = reduceLesson(lesson, state, { type: 'point', point });
    }

    state = reduceLesson(lesson, state, {
      type: 'point',
      point: { x: 1, y: 1 },
    });

    expect(getIntersection(state.board.board, { x: 1, y: 1 })).toBe('white');
    expect(state.completed).toBe(true);
  });

  it('rewinds to the previous snapshot', () => {
    const start = createLessonRuntime(lesson);
    const advanced = reduceLesson(lesson, start, { type: 'continue' });
    const rewound = reduceLesson(lesson, advanced, { type: 'rewind' });

    expect(rewound.stepIndex).toBe(0);
  });
});

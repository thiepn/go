import { describe, expect, it } from 'vitest';

import { interactionLabLesson } from '../../content/lessons';
import {
  createLessonRuntime,
  reduceLesson,
} from './runtime';

function completePointSet(
  state: ReturnType<typeof createLessonRuntime>,
  points: readonly { x: number; y: number }[],
) {
  let next = state;

  for (const point of points) {
    next = reduceLesson(interactionLabLesson, next, {
      type: 'point',
      point,
    });
  }

  return next;
}

describe('lesson interaction primitives', () => {
  it('supports select-points and select-stones', () => {
    let state = createLessonRuntime(interactionLabLesson);

    const first = interactionLabLesson.steps[0];
    if (first.kind !== 'select-points') throw new Error('Fixture mismatch.');
    state = completePointSet(state, first.expectedPoints);
    expect(state.stepIndex).toBe(1);

    const second = interactionLabLesson.steps[1];
    if (second.kind !== 'select-stones') throw new Error('Fixture mismatch.');
    state = completePointSet(state, second.expectedPoints);
    expect(state.stepIndex).toBe(2);
  });

  it('supports selecting a connected group from any member stone', () => {
    let state = createLessonRuntime(interactionLabLesson);

    const first = interactionLabLesson.steps[0];
    const second = interactionLabLesson.steps[1];
    if (first.kind !== 'select-points' || second.kind !== 'select-stones') {
      throw new Error('Fixture mismatch.');
    }

    state = completePointSet(state, first.expectedPoints);
    state = completePointSet(state, second.expectedPoints);
    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 1, y: 2 },
    });

    expect(state.stepIndex).toBe(3);
  });

  it('supports territory identification and move prediction', () => {
    let state = createLessonRuntime(interactionLabLesson);

    const pointSteps = interactionLabLesson.steps.slice(0, 2);

    for (const step of pointSteps) {
      if (step.kind !== 'select-points' && step.kind !== 'select-stones') {
        throw new Error('Fixture mismatch.');
      }
      state = completePointSet(state, step.expectedPoints);
    }

    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 1, y: 1 },
    });

    const territory = interactionLabLesson.steps[3];
    if (territory.kind !== 'identify-territory') {
      throw new Error('Fixture mismatch.');
    }
    state = completePointSet(state, territory.expectedPoints);
    expect(state.stepIndex).toBe(4);

    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 3, y: 2 },
    });
    expect(state.stepIndex).toBe(5);
  });

  it('requires predicted sequences in order and resets a broken line', () => {
    let state = createLessonRuntime(interactionLabLesson);

    const first = interactionLabLesson.steps[0];
    const second = interactionLabLesson.steps[1];
    if (first.kind !== 'select-points' || second.kind !== 'select-stones') {
      throw new Error('Fixture mismatch.');
    }

    state = completePointSet(state, first.expectedPoints);
    state = completePointSet(state, second.expectedPoints);
    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 1, y: 1 },
    });

    const territory = interactionLabLesson.steps[3];
    if (territory.kind !== 'identify-territory') {
      throw new Error('Fixture mismatch.');
    }
    state = completePointSet(state, territory.expectedPoints);
    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 3, y: 2 },
    });

    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 0, y: 4 },
    });
    expect(state.sequence).toHaveLength(1);

    state = reduceLesson(interactionLabLesson, state, {
      type: 'point',
      point: { x: 4, y: 0 },
    });
    expect(state.sequence).toHaveLength(0);
    expect(state.attempts).toBe(1);

    for (const point of [
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
    ]) {
      state = reduceLesson(interactionLabLesson, state, {
        type: 'point',
        point,
      });
    }

    expect(state.completed).toBe(true);
  });
});

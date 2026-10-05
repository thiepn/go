import { describe, expect, it } from 'vitest';

import { beginnerProblems } from '../content/problems';
import {
  createProblemState,
  reduceProblem,
} from './runtime';

describe('practice runtime', () => {
  it('does not mutate the board for a legal but incorrect move', () => {
    const problem = beginnerProblems[0];
    const state = createProblemState(problem);
    const next = reduceProblem(problem, state, {
      type: 'play',
      point: { x: 4, y: 4 },
    });

    expect(next.game).toBe(state.game);
    expect(next.attempts).toBe(1);
    expect(next.firstTry).toBe(false);
    expect(next.feedback?.tone).toBe('correction');
  });

  it('records hint use and removes first-try status', () => {
    const problem = beginnerProblems[0];
    const state = createProblemState(problem);
    const next = reduceProblem(problem, state, {
      type: 'hint',
    });

    expect(next.hintsUsed).toBe(1);
    expect(next.firstTry).toBe(false);
    expect(next.feedback?.tone).toBe('neutral');
  });

  it('waits for the authored opponent reply before advancing a tree', () => {
    const problem = beginnerProblems.find(
      (candidate) => candidate.id === 'read-capture-01',
    );

    if (!problem) throw new Error('Fixture missing.');

    let state = createProblemState(problem);
    state = reduceProblem(problem, state, {
      type: 'play',
      point: { x: 3, y: 2 },
    });

    expect(state.pendingOpponent).toEqual({ x: 4, y: 4 });
    expect(state.completed).toBe(false);

    state = reduceProblem(problem, state, {
      type: 'opponent',
    });

    expect(state.pendingOpponent).toBeNull();
    expect(state.node.prompt).toBe('Finish the capture.');
  });

  it('can reset after mistakes while preserving practice evidence', () => {
    const problem = beginnerProblems[0];
    let state = createProblemState(problem);

    state = reduceProblem(problem, state, {
      type: 'play',
      point: { x: 4, y: 4 },
    });
    state = reduceProblem(problem, state, {
      type: 'hint',
    });
    state = reduceProblem(problem, state, {
      type: 'retry',
    });

    expect(state.attempts).toBe(1);
    expect(state.hintsUsed).toBe(1);
    expect(state.firstTry).toBe(false);
    expect(state.game.moves).toHaveLength(0);
  });
});

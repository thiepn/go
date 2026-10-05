import { describe, expect, it } from 'vitest';

import {
  createGuidedGameState,
  reduceGuidedGame,
} from '../../guided';
import { firstGuidedGame } from './firstGuidedGame';

describe('first guided 9x9 game', () => {
  it('plays its authored path legally through two passes and scoring', () => {
    let state = createGuidedGameState(firstGuidedGame);

    for (const turn of firstGuidedGame.turns) {
      if (turn.type === 'play') {
        state = reduceGuidedGame(firstGuidedGame, state, {
          type: 'play',
          point: turn.recommendedMoves?.[0] ?? turn.acceptedMoves[0],
        });
      } else {
        state = reduceGuidedGame(firstGuidedGame, state, {
          type: 'pass',
        });
      }

      expect(state.pendingOpponent).not.toBeNull();

      state = reduceGuidedGame(firstGuidedGame, state, {
        type: 'opponent',
      });
    }

    expect(state.completed).toBe(true);
    expect(state.game.status).toBe('finished');
    expect(state.learnerMoves).toBe(10);
    expect(state.game.captures.black).toBe(1);
    expect(state.score).not.toBeNull();
    expect(state.score?.total.black).toBe(14);
    expect(state.score?.total.white).toBe(18.5);
    expect(state.score?.winner).toBe('white');
  });

  it('does not commit legal but off-plan moves in guided mode', () => {
    const state = createGuidedGameState(firstGuidedGame);
    const next = reduceGuidedGame(firstGuidedGame, state, {
      type: 'play',
      point: { x: 4, y: 4 },
    });

    expect(next.game.moves).toHaveLength(0);
    expect(next.feedback?.tone).toBe('correction');
  });
});

import { describe, expect, it } from 'vitest';

import {
  createIndependentGameState,
  reduceIndependentGame,
} from './runtime';
import type { IndependentGameSettings } from './types';

const settings: IndependentGameSettings = {
  mode: 'local',
  boardSize: 9,
  humanColor: 'black',
  botLevel: '25k',
  handicap: 0,
  komi: 6.5,
  assistanceLevel: 'independent',
  clock: 'untimed',
};

describe('independent game lifecycle', () => {
  it('creates legal 9x9, 13x13, and 19x19 games', () => {
    for (const boardSize of [9, 13, 19] as const) {
      const state = createIndependentGameState({
        ...settings,
        boardSize,
      });

      expect(state.game.board.size).toBe(boardSize);
      expect(state.phase).toBe('playing');
    }
  });

  it('enters scoring after two passes and can resume play', () => {
    let state = createIndependentGameState(settings);

    state = reduceIndependentGame(state, { type: 'pass' });
    state = reduceIndependentGame(state, { type: 'pass' });

    expect(state.phase).toBe('scoring');
    expect(state.game.status).toBe('finished');

    state = reduceIndependentGame(state, {
      type: 'resume-play',
    });

    expect(state.phase).toBe('playing');
    expect(state.game.status).toBe('playing');
    expect(state.game.consecutivePasses).toBe(0);

    state = reduceIndependentGame(state, {
      type: 'play',
      point: { x: 4, y: 4 },
    });

    expect(state.game.moves.at(-1)?.type).toBe('play');
  });

  it('confirms a real score after scoring review', () => {
    let state = createIndependentGameState(settings);

    state = reduceIndependentGame(state, { type: 'pass' });
    state = reduceIndependentGame(state, { type: 'pass' });
    state = reduceIndependentGame(state, {
      type: 'confirm-score',
    });

    expect(state.phase).toBe('complete');
    expect(state.result?.type).toBe('score');
  });

  it('supports resignation and timeout outcomes', () => {
    const initial = createIndependentGameState(settings);

    const resignation = reduceIndependentGame(initial, {
      type: 'resign',
      player: 'black',
    });

    expect(resignation.result).toEqual({
      type: 'resign',
      resignedBy: 'black',
      winner: 'white',
    });

    const timeout = reduceIndependentGame(initial, {
      type: 'timeout',
      player: 'white',
    });

    expect(timeout.result).toEqual({
      type: 'timeout',
      timedOut: 'white',
      winner: 'black',
    });
  });

  it('starts White after fixed handicap stones', () => {
    const state = createIndependentGameState({
      ...settings,
      handicap: 4,
    });

    expect(state.game.toPlay).toBe('white');
    expect(
      state.game.board.intersections.filter(
        (value) => value === 'black',
      ),
    ).toHaveLength(4);
    expect(state.settings.komi).toBe(0.5);
  });
});

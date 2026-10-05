import { describe, expect, it } from 'vitest';

import {
  createIndependentGameState,
  reduceIndependentGame,
} from './runtime';
import {
  createGameRecord,
} from './records';
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

describe('saved game records', () => {
  it('does not create a record before the game finishes', () => {
    expect(
      createGameRecord(
        createIndependentGameState(settings),
        100,
      ),
    ).toBeNull();
  });

  it('captures settings, moves, captures, and result', () => {
    let state = createIndependentGameState(settings);

    state = reduceIndependentGame(state, {
      type: 'resign',
      player: 'black',
    });

    const record = createGameRecord(state, 100);

    expect(record?.playedAt).toBe(100);
    expect(record?.settings.boardSize).toBe(9);
    expect(record?.result.type).toBe('resign');
  });
});

import { describe, expect, it } from 'vitest';

import {
  translateKataGoMoveReview,
} from './translate';
import type {
  KataGoMoveReview,
} from './types';

function review(
  scoreLoss: number,
): KataGoMoveReview {
  return {
    moveNumber: 12,
    actualPoint: { x: 2, y: 2 },
    actualCoordinate: 'C7',
    currentPlayer: 'black',
    best: {
      point: { x: 3, y: 3 },
      coordinate: 'D6',
      order: 0,
      visits: 200,
      winrate: 0.6,
      scoreLead: 2,
      utility: null,
      prior: 0.2,
      humanPrior: 0.14,
      pv: [],
      pvCoordinates: ['D6'],
    },
    actual: {
      point: { x: 2, y: 2 },
      coordinate: 'C7',
      order: 4,
      visits: 30,
      winrate: 0.4,
      scoreLead: 2 - scoreLoss,
      utility: null,
      prior: 0.04,
      humanPrior: 0.1,
      pv: [],
      pvCoordinates: ['C7'],
    },
    scoreLoss,
    winrateLoss: 0.2,
    assessment:
      scoreLoss < 1.5
        ? 'good'
        : scoreLoss < 3.5
          ? 'small-loss'
          : scoreLoss < 8
            ? 'mistake'
            : 'major-mistake',
    position: {
      queryId: 'q',
      turnNumber: 11,
      currentPlayer: 'black',
      boardSize: 9,
      rootVisits: 250,
      rootWinrate: 0.55,
      rootScoreLead: 1.5,
      rootUtility: null,
      candidates: [],
      ownership: null,
      policy: null,
      humanPolicy: null,
      humanProfile: 'rank_20k',
    },
  };
}

describe('beginner engine translation', () => {
  it('does not dramatize small score differences', () => {
    const insight =
      translateKataGoMoveReview(
        review(0.8),
      );

    expect(insight.label).toBe('Reasonable move');
  });

  it('calls large score loss a turning point and explains Human SL separately', () => {
    const insight =
      translateKataGoMoveReview(
        review(9),
      );

    expect(insight.label).toBe('Turning point');
    expect(insight.humanNote).toMatch(/20k/);
    expect(insight.humanNote).toMatch(/10%/);
  });
});

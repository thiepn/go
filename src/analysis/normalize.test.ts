import { describe, expect, it } from 'vitest';

import {
  normalizeKataGoResponse,
} from './normalize';

describe('KataGo normalization', () => {
  it('normalizes candidate moves, PVs, ownership and side to move', () => {
    const ownership = Array(81).fill(0);
    ownership[0] = 0.8;

    const analysis =
      normalizeKataGoResponse(
        {
          id: 'q1',
          turnNumber: 4,
          moveInfos: [
            {
              move: 'D4',
              order: 0,
              visits: 100,
              winrate: 0.61,
              scoreLead: 2.3,
              prior: 0.2,
              humanPrior: 0.12,
              pv: ['C4', 'E5'],
            },
          ],
          rootInfo: {
            currentPlayer: 'W',
            visits: 150,
            winrate: 0.58,
            scoreLead: 1.7,
          },
          ownership,
          policy: [
            ...Array(81).fill(0),
            0.01,
          ],
          humanPolicy: [
            ...Array(81).fill(0),
            0.02,
          ],
        },
        9,
        'rank_20k',
      );

    expect(analysis.currentPlayer).toBe('white');
    expect(analysis.candidates[0].point).toEqual({
      x: 3,
      y: 5,
    });
    expect(analysis.candidates[0].pvCoordinates).toEqual([
      'D4',
      'C4',
      'E5',
    ]);
    expect(analysis.ownership).toHaveLength(81);
    expect(analysis.policy).toHaveLength(82);
    expect(analysis.humanPolicy).toHaveLength(82);
    expect(analysis.humanProfile).toBe('rank_20k');
  });

  it('does not duplicate the candidate when KataGo PV already begins with it', () => {
    const analysis =
      normalizeKataGoResponse(
        {
          id: 'q-pv',
          turnNumber: 0,
          moveInfos: [{
            move: 'D4',
            order: 0,
            pv: ['D4', 'C4', 'E5'],
          }],
          rootInfo: {
            currentPlayer: 'B',
          },
        },
        9,
      );

    expect(
      analysis.candidates[0].pvCoordinates,
    ).toEqual(['D4', 'C4', 'E5']);
  });

  it('rejects malformed numeric arrays rather than shifting their indexes', () => {
    const analysis =
      normalizeKataGoResponse(
        {
          id: 'q2',
          turnNumber: 0,
          moveInfos: [],
          rootInfo: {
            currentPlayer: 'B',
          },
          ownership: [0.2, Number.NaN],
        },
        9,
      );

    expect(analysis.ownership).toBeNull();
  });
});

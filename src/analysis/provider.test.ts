import { describe, expect, it } from 'vitest';

import {
  HttpKataGoProvider,
  KataGoUnavailableError,
} from './provider';
import type {
  KataGoQuery,
} from './types';

const query: KataGoQuery = {
  id: 'q',
  moves: [],
  rules: 'chinese',
  komi: 6.5,
  boardXSize: 9,
  boardYSize: 9,
};

describe('HTTP KataGo provider', () => {
  it('accepts the bridge response envelope and ignores partial search updates', async () => {
    const provider =
      new HttpKataGoProvider({
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              responses: [
                {
                  id: 'q',
                  turnNumber: 0,
                  isDuringSearch: true,
                },
                {
                  id: 'q',
                  turnNumber: 0,
                  isDuringSearch: false,
                  moveInfos: [],
                },
              ],
            }),
            {
              status: 200,
              headers: {
                'content-type':
                  'application/json',
              },
            },
          ),
      });

    const result =
      await provider.analyze(query);

    expect(result).toHaveLength(1);
    expect(
      result[0].isDuringSearch,
    ).toBe(false);
  });

  it('surfaces unavailable services as a typed error', async () => {
    const provider =
      new HttpKataGoProvider({
        fetchImpl: async () => {
          throw new Error('offline');
        },
      });

    await expect(
      provider.analyze(query),
    ).rejects.toBeInstanceOf(
      KataGoUnavailableError,
    );
  });
});

import { describe, expect, it } from 'vitest';

import {
  fetchKataGoHealth,
} from './health';

describe('KataGo health', () => {
  it('returns readiness and Human SL availability', async () => {
    const health =
      await fetchKataGoHealth(
        async () =>
          new Response(
            JSON.stringify({
              configured: true,
              ready: true,
              humanModel: true,
              secret: 'must not matter',
            }),
            {
              status: 200,
            },
          ),
      );

    expect(health).toEqual({
      configured: true,
      ready: true,
      humanModel: true,
    });
  });

  it('degrades safely when the health endpoint is unavailable', async () => {
    const health =
      await fetchKataGoHealth(
        async () => {
          throw new Error('offline');
        },
      );

    expect(health).toEqual({
      configured: false,
      ready: false,
      humanModel: false,
    });
  });
});

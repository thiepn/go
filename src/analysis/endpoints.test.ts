import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  kataGoEndpoint,
} from './endpoints';

describe('KataGo API endpoint', () => {
  it('falls back to the canonical app base in local builds', () => {
    expect(
      kataGoEndpoint('health'),
    ).toBe('/go/api/katago/health');

    expect(
      kataGoEndpoint('analyze'),
    ).toBe('/go/api/katago/analyze');
  });
});

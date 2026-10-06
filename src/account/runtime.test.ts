import { describe, expect, it } from 'vitest';

import {
  supportsThiepnAccountOrigin,
} from './runtime';

describe('THIEPN Account origin boundary', () => {
  it('allows the canonical thiepn.dev origin', () => {
    expect(
      supportsThiepnAccountOrigin({
        origin: 'https://thiepn.dev',
        hostname: 'thiepn.dev',
        protocol: 'https:',
      }),
    ).toBe(true);
  });

  it('allows approved local development origins', () => {
    expect(
      supportsThiepnAccountOrigin({
        origin: 'http://localhost:5173',
        hostname: 'localhost',
        protocol: 'http:',
      }),
    ).toBe(true);
  });

  it('rejects subdomains and unrelated hosts', () => {
    expect(
      supportsThiepnAccountOrigin({
        origin: 'https://go.thiepn.dev',
        hostname: 'go.thiepn.dev',
        protocol: 'https:',
      }),
    ).toBe(false);

    expect(
      supportsThiepnAccountOrigin({
        origin: 'https://example.com',
        hostname: 'example.com',
        protocol: 'https:',
      }),
    ).toBe(false);
  });
});

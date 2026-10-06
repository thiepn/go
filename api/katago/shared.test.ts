import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  consumeRateLimit,
  proxyTimeoutMs,
} from './_shared.js';

describe('KataGo proxy guards', () => {
  it('limits repeated requests from one forwarded client', () => {
    const request = {
      headers: {
        'x-forwarded-for':
          '203.0.113.8, 10.0.0.1',
      },
    };

    const first =
      consumeRateLimit(
        request,
        {
          capacity: 2,
          windowMs: 60_000,
        },
      );
    const second =
      consumeRateLimit(
        request,
        {
          capacity: 2,
          windowMs: 60_000,
        },
      );
    const third =
      consumeRateLimit(
        request,
        {
          capacity: 2,
          windowMs: 60_000,
        },
      );

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(
      third.retryAfterSeconds,
    ).toBeGreaterThan(0);
  });

  it('bounds proxy timeout configuration', () => {
    const before =
      process.env.KATAGO_PROXY_TIMEOUT_MS;

    process.env.KATAGO_PROXY_TIMEOUT_MS =
      '999999';

    expect(proxyTimeoutMs()).toBe(
      120_000,
    );

    if (before === undefined) {
      delete process.env
        .KATAGO_PROXY_TIMEOUT_MS;
    } else {
      process.env.KATAGO_PROXY_TIMEOUT_MS =
        before;
    }
  });
});

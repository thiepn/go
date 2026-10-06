const DEFAULT_ORIGINS = [
  'https://thiepn.dev',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const buckets = new Map();

function allowedOrigins() {
  const configured =
    process.env.KATAGO_ALLOWED_ORIGINS
      ?.split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  return new Set(
    configured?.length
      ? configured
      : DEFAULT_ORIGINS,
  );
}

export function applyCors(
  request,
  response,
) {
  const origin =
    typeof request.headers?.origin === 'string'
      ? request.headers.origin
      : '';

  if (
    origin &&
    allowedOrigins().has(origin)
  ) {
    response.setHeader(
      'access-control-allow-origin',
      origin,
    );
    response.setHeader(
      'vary',
      'Origin',
    );
    response.setHeader(
      'access-control-allow-methods',
      'GET, POST, OPTIONS',
    );
    response.setHeader(
      'access-control-allow-headers',
      'content-type',
    );
  }

  return (
    !origin ||
    allowedOrigins().has(origin)
  );
}

export function handlePreflight(
  request,
  response,
) {
  if (request.method !== 'OPTIONS') {
    return false;
  }

  const allowed = applyCors(
    request,
    response,
  );

  response
    .status(allowed ? 204 : 403)
    .end();
  return true;
}

function clientKey(request) {
  const forwarded =
    request.headers?.['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded
      .split(',')[0]
      .trim()
      .slice(0, 128);
  }

  return 'unknown';
}

export function consumeRateLimit(
  request,
  {
    capacity = Number(
      process.env.KATAGO_RATE_LIMIT_CAPACITY ??
        12,
    ),
    windowMs = Number(
      process.env.KATAGO_RATE_LIMIT_WINDOW_MS ??
        60_000,
    ),
  } = {},
) {
  const now = Date.now();
  const key = clientKey(request);
  const current = buckets.get(key);

  if (
    !current ||
    now - current.startedAt >= windowMs
  ) {
    buckets.set(key, {
      startedAt: now,
      count: 1,
    });

    return {
      allowed: true,
      remaining:
        Math.max(0, capacity - 1),
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= capacity) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds:
        Math.max(
          1,
          Math.ceil(
            (
              windowMs -
              (now - current.startedAt)
            ) / 1000,
          ),
        ),
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining:
      Math.max(
        0,
        capacity - current.count,
      ),
    retryAfterSeconds: 0,
  };
}

export function setRateHeaders(
  response,
  result,
) {
  response.setHeader(
    'x-ratelimit-remaining',
    String(result.remaining),
  );

  if (!result.allowed) {
    response.setHeader(
      'retry-after',
      String(
        result.retryAfterSeconds,
      ),
    );
  }
}

export function proxyTimeoutMs(
  fallback = 60_000,
) {
  const value = Number(
    process.env.KATAGO_PROXY_TIMEOUT_MS ??
      fallback,
  );

  return Number.isFinite(value)
    ? Math.max(
        1_000,
        Math.min(120_000, value),
      )
    : fallback;
}

export async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = proxyTimeoutMs(),
) {
  const controller =
    new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  try {
    return await fetch(
      url,
      {
        ...options,
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timer);
  }
}

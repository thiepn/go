const MAX_BODY_BYTES = 2_000_000;

async function bodyOf(request) {
  if (
    request.body &&
    typeof request.body === 'object'
  ) {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body);
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of request) {
    total += chunk.length;

    if (total > MAX_BODY_BYTES) {
      throw new Error(
        'Request body exceeds 2 MB.',
      );
    }

    chunks.push(chunk);
  }

  return JSON.parse(
    Buffer.concat(chunks).toString('utf8'),
  );
}

function validateQuery(query) {
  if (
    !query ||
    typeof query !== 'object' ||
    typeof query.id !== 'string' ||
    query.id.length === 0
  ) {
    throw new Error(
      'Analysis query requires an id.',
    );
  }

  if (
    !Array.isArray(query.moves) ||
    !Number.isInteger(query.boardXSize) ||
    !Number.isInteger(query.boardYSize) ||
    query.boardXSize < 2 ||
    query.boardYSize < 2 ||
    query.boardXSize > 19 ||
    query.boardYSize > 19
  ) {
    throw new Error(
      'Invalid KataGo board or move payload.',
    );
  }
}

export default async function handler(
  request,
  response,
) {
  if (request.method !== 'POST') {
    response.setHeader(
      'Allow',
      'POST',
    );
    response.status(405).json({
      error: 'Method not allowed.',
    });
    return;
  }

  const bridgeUrl =
    process.env.KATAGO_BRIDGE_URL;

  if (!bridgeUrl) {
    response.status(503).json({
      error:
        'KataGo analysis is not configured.',
    });
    return;
  }

  try {
    const query = await bodyOf(request);
    validateQuery(query);

    const controller =
      new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Number(
        process.env.KATAGO_PROXY_TIMEOUT_MS ??
          120000,
      ),
    );

    const upstream = await fetch(
      `${bridgeUrl.replace(/\/$/, '')}/analyze`,
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
          ...(process.env
            .KATAGO_BRIDGE_TOKEN
            ? {
                authorization:
                  `Bearer ${process.env.KATAGO_BRIDGE_TOKEN}`,
              }
            : {}),
        },
        body: JSON.stringify(query),
        signal: controller.signal,
      },
    );

    clearTimeout(timer);

    const text =
      await upstream.text();

    response
      .status(upstream.status)
      .setHeader(
        'content-type',
        'application/json; charset=utf-8',
      )
      .setHeader(
        'cache-control',
        'no-store',
      )
      .send(text);
  } catch (error) {
    const aborted =
      error?.name === 'AbortError';

    response
      .status(aborted ? 504 : 400)
      .json({
        error: aborted
          ? 'KataGo analysis timed out.'
          : error instanceof Error
            ? error.message
            : 'Analysis proxy failed.',
      });
  }
}

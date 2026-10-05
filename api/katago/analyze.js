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

const ALLOWED_OVERRIDE_SETTINGS = new Set([
  'humanSLProfile',
  'ignorePreRootHistory',
  'rootNumSymmetriesToSample',
  'humanSLRootExploreProbWeightless',
  'humanSLCpuctPermanent',
]);

function finiteNumber(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  );
}

function sanitizeQuery(query) {
  if (
    !query ||
    typeof query !== 'object' ||
    typeof query.id !== 'string' ||
    query.id.length === 0 ||
    query.id.length > 200
  ) {
    throw new Error(
      'Analysis query requires a valid id.',
    );
  }

  if (
    'action' in query ||
    !Array.isArray(query.moves) ||
    query.moves.length > 1000 ||
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

  const maxVisitsLimit = Number(
    process.env.KATAGO_MAX_VISITS ?? 1000,
  );

  const analyzeTurns =
    Array.isArray(query.analyzeTurns)
      ? query.analyzeTurns
      : undefined;

  if (
    analyzeTurns &&
    (
      analyzeTurns.length > 250 ||
      analyzeTurns.some(
        (turn) =>
          !Number.isInteger(turn) ||
          turn < 0 ||
          turn > query.moves.length,
      )
    )
  ) {
    throw new Error(
      'Invalid analyzeTurns payload.',
    );
  }

  const overrideSettings = {};

  if (
    query.overrideSettings &&
    typeof query.overrideSettings === 'object'
  ) {
    for (const [key, value] of Object.entries(
      query.overrideSettings,
    )) {
      if (
        ALLOWED_OVERRIDE_SETTINGS.has(key)
      ) {
        overrideSettings[key] = value;
      }
    }
  }

  const maxVisits =
    finiteNumber(query.maxVisits)
      ? Math.max(
          1,
          Math.min(
            Math.round(query.maxVisits),
            maxVisitsLimit,
          ),
        )
      : undefined;

  const analysisPVLen =
    finiteNumber(query.analysisPVLen)
      ? Math.max(
          1,
          Math.min(
            Math.round(query.analysisPVLen),
            20,
          ),
        )
      : undefined;

  return {
    id: query.id,
    initialStones:
      Array.isArray(query.initialStones)
        ? query.initialStones.slice(0, 361)
        : undefined,
    initialPlayer:
      query.initialPlayer === 'W'
        ? 'W'
        : query.initialPlayer === 'B'
          ? 'B'
          : undefined,
    moves: query.moves,
    rules:
      typeof query.rules === 'string' ||
      (
        query.rules &&
        typeof query.rules === 'object'
      )
        ? query.rules
        : 'chinese',
    komi:
      finiteNumber(query.komi)
        ? Math.max(
            -400,
            Math.min(400, query.komi),
          )
        : 6.5,
    whiteHandicapBonus:
      query.whiteHandicapBonus === 0 ||
      query.whiteHandicapBonus === 'N' ||
      query.whiteHandicapBonus === 'N-1'
        ? query.whiteHandicapBonus
        : 0,
    boardXSize: query.boardXSize,
    boardYSize: query.boardYSize,
    analyzeTurns,
    maxVisits,
    rootPolicyTemperature:
      finiteNumber(
        query.rootPolicyTemperature,
      )
        ? Math.max(
            0.1,
            Math.min(
              4,
              query.rootPolicyTemperature,
            ),
          )
        : undefined,
    rootFpuReductionMax:
      finiteNumber(
        query.rootFpuReductionMax,
      )
        ? Math.max(
            0,
            Math.min(
              2,
              query.rootFpuReductionMax,
            ),
          )
        : undefined,
    analysisPVLen,
    includeOwnership:
      query.includeOwnership === true,
    includeOwnershipStdev:
      query.includeOwnershipStdev === true,
    includeMovesOwnership:
      query.includeMovesOwnership === true,
    includeMovesOwnershipStdev:
      query.includeMovesOwnershipStdev === true,
    includePolicy:
      query.includePolicy === true,
    includePVVisits:
      query.includePVVisits === true,
    includeNoResultValue:
      query.includeNoResultValue === true,
    allowMoves:
      Array.isArray(query.allowMoves)
        ? query.allowMoves.slice(0, 2)
        : undefined,
    overrideSettings:
      Object.keys(overrideSettings).length > 0
        ? overrideSettings
        : undefined,
  };
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
    const rawQuery = await bodyOf(request);
    const query = sanitizeQuery(rawQuery);

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

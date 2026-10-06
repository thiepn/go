const apiBase =
  process.env.KATAGO_C2_API_BASE
    ?.trim()
    .replace(/\/$/, '');

if (!apiBase) {
  throw new Error(
    'KATAGO_C2_API_BASE is required for live C2 certification.',
  );
}

const timeoutMs = Number(
  process.env.KATAGO_C2_TIMEOUT_MS ??
    90_000,
);
const visits = Number(
  process.env.KATAGO_C2_VISITS ?? 80,
);

async function timedFetch(
  url,
  options = {},
) {
  const controller =
    new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );
  const startedAt =
    performance.now();

  try {
    const response = await fetch(
      url,
      {
        ...options,
        signal: controller.signal,
      },
    );

    return {
      response,
      elapsedMs:
        Math.round(
          performance.now() -
            startedAt,
        ),
    };
  } finally {
    clearTimeout(timer);
  }
}

const health = await timedFetch(
  `${apiBase}/health`,
  {
    headers: {
      origin: 'https://thiepn.dev',
      accept: 'application/json',
    },
  },
);
const healthBody =
  await health.response.json();

if (
  !health.response.ok ||
  healthBody?.configured !== true ||
  healthBody?.ready !== true
) {
  throw new Error(
    `KataGo health failed: HTTP ${health.response.status} ${JSON.stringify(healthBody)}`,
  );
}

console.log(
  `KataGo health ready in ${health.elapsedMs}ms; Human SL=${healthBody.humanModel === true}.`,
);

for (const size of [9, 13, 19]) {
  const id =
    `c2-${size}x${size}-${Date.now()}`;
  const result = await timedFetch(
    `${apiBase}/analyze`,
    {
      method: 'POST',
      headers: {
        origin: 'https://thiepn.dev',
        'content-type':
          'application/json',
      },
      body: JSON.stringify({
        id,
        moves: [],
        rules: 'chinese',
        komi: 6.5,
        boardXSize: size,
        boardYSize: size,
        analyzeTurns: [0],
        maxVisits: visits,
        analysisPVLen: 6,
        includeOwnership: true,
        includePolicy: true,
      }),
    },
  );

  const body =
    await result.response.json();

  if (!result.response.ok) {
    throw new Error(
      `${size}x${size} analysis failed: HTTP ${result.response.status} ${JSON.stringify(body)}`,
    );
  }

  const response =
    Array.isArray(body?.responses)
      ? body.responses.find(
          (item) =>
            item?.turnNumber === 0 &&
            item?.isDuringSearch !== true,
        )
      : null;

  if (
    !response ||
    !Array.isArray(
      response.moveInfos,
    ) ||
    response.moveInfos.length === 0 ||
    !response.rootInfo ||
    !Array.isArray(
      response.ownership,
    ) ||
    response.ownership.length !==
      size * size
  ) {
    throw new Error(
      `${size}x${size} analysis returned an incomplete KataGo response.`,
    );
  }

  console.log(
    `${size}x${size}: ${result.elapsedMs}ms, root visits=${response.rootInfo.visits ?? 'unknown'}, candidates=${response.moveInfos.length}.`,
  );
}

const invalid = await fetch(
  `${apiBase}/analyze`,
  {
    method: 'POST',
    headers: {
      origin: 'https://thiepn.dev',
      'content-type':
        'application/json',
    },
    body: JSON.stringify({
      id: 'c2-invalid-20x20',
      moves: [],
      boardXSize: 20,
      boardYSize: 20,
    }),
  },
);

if (invalid.status !== 400) {
  throw new Error(
    `Public workload guard expected HTTP 400 for 20x20, got ${invalid.status}.`,
  );
}

console.log(
  'C2 live KataGo runtime certification passed.',
);

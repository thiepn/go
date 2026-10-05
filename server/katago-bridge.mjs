import { spawn } from 'node:child_process';
import http from 'node:http';
import { createInterface } from 'node:readline';

const PORT = Number(process.env.PORT ?? 2719);
const HOST = process.env.HOST ?? '127.0.0.1';
const KATAGO_BIN = process.env.KATAGO_BIN ?? 'katago';
const KATAGO_CONFIG =
  process.env.KATAGO_CONFIG ?? './server/katago-analysis.cfg';
const KATAGO_MODEL = process.env.KATAGO_MODEL;
const KATAGO_HUMAN_MODEL =
  process.env.KATAGO_HUMAN_MODEL;
const BRIDGE_TOKEN =
  process.env.KATAGO_BRIDGE_TOKEN ?? '';
const REQUEST_TIMEOUT_MS = Number(
  process.env.KATAGO_TIMEOUT_MS ?? 120000,
);
const MAX_PENDING = Number(
  process.env.KATAGO_MAX_PENDING ?? 32,
);

if (!KATAGO_MODEL) {
  throw new Error(
    'KATAGO_MODEL must point to a KataGo neural-network model.',
  );
}

let engine = null;
let engineReady = false;
let restartTimer = null;
const pending = new Map();

function engineArgs() {
  const args = [
    'analysis',
    '-config',
    KATAGO_CONFIG,
    '-model',
    KATAGO_MODEL,
  ];

  if (KATAGO_HUMAN_MODEL) {
    args.push(
      '-human-model',
      KATAGO_HUMAN_MODEL,
    );
  }

  return args;
}

function failPending(message) {
  for (const item of pending.values()) {
    clearTimeout(item.timer);
    item.reject(new Error(message));
  }
  pending.clear();
}

function scheduleRestart() {
  if (restartTimer) return;

  restartTimer = setTimeout(() => {
    restartTimer = null;
    startEngine();
  }, 1000);
}

function startEngine() {
  engineReady = false;

  engine = spawn(
    KATAGO_BIN,
    engineArgs(),
    {
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );

  engine.once('spawn', () => {
    engineReady = true;
  });

  engine.stderr.on('data', (chunk) => {
    process.stderr.write(
      `[katago] ${chunk}`,
    );
  });

  const lines = createInterface({
    input: engine.stdout,
    crlfDelay: Infinity,
  });

  lines.on('line', (line) => {
    let message;

    try {
      message = JSON.parse(line);
    } catch {
      process.stderr.write(
        `[bridge] ignored non-JSON KataGo output: ${line}\n`,
      );
      return;
    }

    const id =
      typeof message.id === 'string'
        ? message.id
        : null;

    if (!id || !pending.has(id)) {
      return;
    }

    const item = pending.get(id);

    if (message.warning) {
      item.warnings.push({
        id: message.id,
        warning: message.warning,
      });
    }

    if (message.error) {
      clearTimeout(item.timer);
      pending.delete(id);
      item.reject(
        new Error(
          message.field
            ? `${message.error} (${message.field})`
            : message.error,
        ),
      );
      return;
    }

    if (message.isDuringSearch === true) {
      return;
    }

    if (
      typeof message.turnNumber !==
      'number'
    ) {
      return;
    }

    item.responses.push(message);

    if (
      item.responses.length >=
      item.expectedFinalResponses
    ) {
      clearTimeout(item.timer);
      pending.delete(id);
      item.resolve({
        responses: item.responses,
        warnings: item.warnings,
      });
    }
  });

  engine.on('error', (error) => {
    engineReady = false;
    failPending(
      `KataGo process error: ${error.message}`,
    );
  });

  engine.on('exit', (code, signal) => {
    engineReady = false;
    failPending(
      `KataGo exited (${code ?? 'no code'} / ${signal ?? 'no signal'}).`,
    );
    scheduleRestart();
  });
}

function sendQuery(query) {
  if (!engineReady || !engine?.stdin?.writable) {
    return Promise.reject(
      new Error('KataGo is not ready.'),
    );
  }

  if (
    !query ||
    typeof query !== 'object' ||
    typeof query.id !== 'string' ||
    query.id.length === 0
  ) {
    return Promise.reject(
      new Error(
        'KataGo query requires a non-empty string id.',
      ),
    );
  }

  if (pending.has(query.id)) {
    return Promise.reject(
      new Error(
        `KataGo query id "${query.id}" is already pending.`,
      ),
    );
  }

  if (pending.size >= MAX_PENDING) {
    return Promise.reject(
      new Error(
        'KataGo bridge is at its concurrency limit.',
      ),
    );
  }

  const expectedFinalResponses =
    Array.isArray(query.analyzeTurns) &&
    query.analyzeTurns.length > 0
      ? query.analyzeTurns.length
      : 1;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(query.id);
      reject(
        new Error(
          `KataGo analysis timed out after ${REQUEST_TIMEOUT_MS}ms.`,
        ),
      );
    }, REQUEST_TIMEOUT_MS);

    pending.set(query.id, {
      resolve,
      reject,
      timer,
      responses: [],
      warnings: [],
      expectedFinalResponses,
    });

    engine.stdin.write(
      `${JSON.stringify(query)}\n`,
      (error) => {
        if (!error) return;

        clearTimeout(timer);
        pending.delete(query.id);
        reject(error);
      },
    );
  });
}

function authorized(request) {
  if (!BRIDGE_TOKEN) return true;

  return (
    request.headers.authorization ===
    `Bearer ${BRIDGE_TOKEN}`
  );
}

function json(
  response,
  status,
  body,
) {
  const encoded = JSON.stringify(body);

  response.writeHead(status, {
    'content-type':
      'application/json; charset=utf-8',
    'content-length':
      Buffer.byteLength(encoded),
    'cache-control': 'no-store',
  });
  response.end(encoded);
}

function readBody(request) {
  return new Promise(
    (resolve, reject) => {
      let total = 0;
      const chunks = [];

      request.on('data', (chunk) => {
        total += chunk.length;

        if (total > 2_000_000) {
          reject(
            new Error(
              'Request body exceeds 2 MB.',
            ),
          );
          request.destroy();
          return;
        }

        chunks.push(chunk);
      });

      request.on('end', () => {
        try {
          resolve(
            JSON.parse(
              Buffer.concat(chunks).toString(
                'utf8',
              ),
            ),
          );
        } catch {
          reject(
            new Error(
              'Request body must be valid JSON.',
            ),
          );
        }
      });

      request.on('error', reject);
    },
  );
}

startEngine();

const server = http.createServer(
  async (request, response) => {
    if (!authorized(request)) {
      json(response, 401, {
        error: 'Unauthorized.',
      });
      return;
    }

    if (
      request.method === 'GET' &&
      request.url === '/health'
    ) {
      json(
        response,
        engineReady ? 200 : 503,
        {
          ready: engineReady,
          pending: pending.size,
          humanModel:
            Boolean(KATAGO_HUMAN_MODEL),
        },
      );
      return;
    }

    if (
      request.method !== 'POST' ||
      request.url !== '/analyze'
    ) {
      json(response, 404, {
        error: 'Not found.',
      });
      return;
    }

    try {
      const query = await readBody(
        request,
      );
      const result = await sendQuery(
        query,
      );
      json(response, 200, result);
    } catch (error) {
      json(response, 400, {
        error:
          error instanceof Error
            ? error.message
            : 'Analysis failed.',
      });
    }
  },
);

server.listen(PORT, HOST, () => {
  process.stdout.write(
    `KataGo bridge listening on http://${HOST}:${PORT}\n`,
  );
});

function shutdown() {
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  server.close();
  engine?.kill('SIGTERM');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

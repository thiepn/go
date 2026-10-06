# C2 — Live KataGo Runtime

C2 converts the P11 adapter from an optional code path into a certifiable
production service while preserving deterministic Review as the fallback.

## Production topology

```
https://thiepn.dev/go/
        |
        | CORS HTTPS
        v
public KataGo proxy
(Vercel project, e.g. go-katago)
        |
        | Bearer token
        v
persistent KataGo bridge
        |
        | JSON lines
        v
katago analysis + neural model
```

The browser never receives `KATAGO_BRIDGE_TOKEN` and never talks directly to
the native engine host.

## Static app configuration

GitHub Pages injects:

```
VITE_KATAGO_API_BASE=${KATAGO_API_BASE repository variable}
```

The value is the public proxy API root, for example:

```
https://go-katago.vercel.app/api/katago
```

When it is absent, the application safely degrades to its local canonical
fallback endpoint and deterministic P10 Review continues to work.

## Public proxy

Required production environment:

```
KATAGO_BRIDGE_URL=https://<protected bridge route>
KATAGO_BRIDGE_TOKEN=<long random shared secret>
KATAGO_ALLOWED_ORIGINS=https://thiepn.dev
KATAGO_PROXY_TIMEOUT_MS=60000
KATAGO_MAX_VISITS=600
KATAGO_RATE_LIMIT_CAPACITY=12
KATAGO_RATE_LIMIT_WINDOW_MS=60000
```

The proxy:

- accepts only the canonical web origin (plus explicit local development origins);
- caps boards at 19×19;
- caps move history, analysis turns, visits, PV length, and allowMoves;
- strips unknown KataGo override settings;
- applies a best-effort per-instance rate limit before forwarding;
- returns 429 for public request bursts;
- uses bounded upstream timeouts;
- never exposes bridge URL/token/model paths;
- disables response caching.

The in-process request limiter is intentionally a first layer, not a globally
distributed abuse-prevention system. A wider public launch should additionally
use Vercel Firewall/rate limiting or another shared limiter.

## Bridge

The bridge remains a long-running Node process around KataGo's JSON analysis
engine.

Required host environment:

```
KATAGO_MODEL=/absolute/path/to/model.bin.gz
KATAGO_BRIDGE_TOKEN=<same proxy/bridge secret>
KATAGO_BIN=katago
KATAGO_CONFIG=./server/katago-analysis.cfg
HOST=0.0.0.0
PORT=2719
KATAGO_TIMEOUT_MS=90000
KATAGO_MAX_PENDING=4
```

Optional:

```
KATAGO_HUMAN_MODEL=/absolute/path/to/human-model.bin.gz
```

Bridge status behavior:

- 401 — invalid bridge token;
- 409 — duplicate pending query id;
- 429 — concurrency limit reached;
- 503 — KataGo process unavailable;
- 504 — native analysis timeout.

## Hosting boundary

KataGo is a native long-running process with a large model. It is not deployed
inside the GitHub Pages site and should not be embedded in a short-lived
serverless function.

A persistent CPU/GPU VM/container host is the default production target.

For this low-traffic personal product, a persistent Vercel Sandbox with an
exposed bridge port is also a viable operational target if the Vercel project
scope is authorized. Its filesystem snapshot can retain the binary/model and
the named sandbox can be resumed when needed.

C2 encountered a Vercel authorization boundary while creating the dedicated
`go-katago` project: the connected session can read existing projects but is
not currently authorized to create resources under the `thiepn-project` team
scope. Live activation therefore remains an external-account gate rather than
an application-code uncertainty.

## Live certification

`npm run qa:katago:live` requires:

```
KATAGO_C2_API_BASE=https://<proxy>/api/katago
```

It must prove:

1. public health says configured + ready;
2. empty-board 9×9 analysis succeeds;
3. empty-board 13×13 analysis succeeds;
4. empty-board 19×19 analysis succeeds;
5. responses include candidates, root data, and correctly sized ownership;
6. public 20×20 workload is rejected.

The GitHub workflow `katago-live-qa` runs this after Pages deployment whenever
the repository variable `KATAGO_API_BASE` is configured.

## Fallback requirement

KataGo is never a boot dependency.

If the proxy or native engine is unavailable:

- Learn works;
- Practice works;
- Play works;
- deterministic P10 Review works;
- Study works;
- Progress works;
- Coach may omit engine enrichment.

That boundary is release-critical.

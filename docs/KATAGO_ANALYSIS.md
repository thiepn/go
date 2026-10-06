# KataGo Analysis Adapter

## P11 / C2 status

P11's application-side integration is implemented. C2 adds the production external-proxy contract, workload guards, live 9×9/13×13/19×19 certification script, and explicit bridge overload/timeout behavior.

A live engine result still requires an external KataGo analysis process and compatible neural-network model to be configured. The current C2 candidate is `1.0.0-rc.3`; live certification remains blocked until the connected Vercel team scope is re-authorized and the proxy/engine host can be activated.

The rest of the Go app remains fully usable when KataGo is offline or absent.

## Product role

KataGo is an optional analysis layer.

It does not replace:

- the P1 rules engine;
- P7 mastery;
- P9 Study;
- P10 deterministic review.

The intended hierarchy is:

```
P10 deterministic fact
        ↓
plain-language explanation
        ↓
P11 engine comparison
        ↓
candidate / variation / ownership context
```

When P10 can explain a concrete tactical mistake, that explanation remains primary.

Engine output adds magnitude and alternatives.

When P10 has no safe deterministic finding, P11 can still inspect a selected learner move without pretending the engine score itself identifies a curriculum concept.

## Runtime topology

```
Browser
  │
  │ POST /api/katago/analyze
  ▼
THIEPN Go web runtime / Vercel proxy
  │
  │ authenticated server-to-server request
  ▼
External KataGo bridge
  │
  │ JSON lines over stdin/stdout
  ▼
katago analysis
  │
  ├── main neural-network model
  └── optional Human SL model
```

The native engine and model files are deliberately not shipped to the browser.

They are also not assumed to live inside the Vercel application bundle.

KataGo is a long-running native process with large model files and benefits from a persistent CPU/GPU host.

## Official analysis protocol

The adapter targets KataGo's parallel JSON analysis engine.

The bridge starts:

```bash
katago analysis -config <config> -model <model>
```

and optionally:

```bash
katago analysis \
  -config <config> \
  -model <model> \
  -human-model <human-model>
```

The Node bridge sends one JSON query per line and consumes one JSON response per line.

## Repository pieces

### Browser domain

`src/analysis/`

Contains:

- GTP coordinate conversion;
- typed KataGo request/response contracts;
- P8 game → KataGo query conversion;
- response normalization;
- per-move analysis;
- batched whole-game analysis;
- forced played-move analysis;
- local result cache;
- health checks;
- beginner-language translation;
- Engine Check UI.

### Same-origin proxy

`api/katago/analyze.js`

Receives browser requests and forwards a sanitized query to the bridge.

`api/katago/health.js`

Exposes only:

- configured;
- ready;
- Human SL model available.

It does not expose bridge URLs, tokens, model paths, or process details.

### Engine bridge

`server/katago-bridge.mjs`

A dependency-free Node process that:

- starts KataGo;
- writes JSON queries to stdin;
- reads line-delimited JSON from stdout;
- correlates results by query ID;
- handles multi-turn analysis responses;
- ignores partial search updates;
- captures engine errors;
- times out stalled requests;
- caps pending requests;
- restarts after unexpected engine exit;
- optionally requires a bearer token.

### Baseline config

`server/katago-analysis.cfg`

The baseline sets:

```
reportAnalysisWinratesAs = SIDETOMOVE
```

so score, winrate, ownership, and related values are interpreted from the side-to-move perspective.

It intentionally uses conservative thread/batch defaults. Tune them for the actual analysis host.

## Environment contract

Copy the relevant values from `.env.example`.

### Web / Vercel

Required for live analysis:

```
KATAGO_BRIDGE_URL=https://private-or-protected-katago-host
KATAGO_BRIDGE_TOKEN=<shared secret>
```

Optional:

```
KATAGO_PROXY_TIMEOUT_MS=120000
KATAGO_MAX_VISITS=1000
```

### Analysis host

Required:

```
KATAGO_MODEL=/absolute/path/to/main-model.bin.gz
```

Usually:

```
KATAGO_BIN=katago
KATAGO_CONFIG=./server/katago-analysis.cfg
KATAGO_BRIDGE_TOKEN=<same shared secret>
PORT=2719
HOST=127.0.0.1
```

Optional Human SL:

```
KATAGO_HUMAN_MODEL=/absolute/path/to/human-model.bin.gz
```

Model and binary artifacts are excluded from Git.

## Start the bridge

After KataGo and a compatible model are installed on the analysis host:

```bash
npm run katago:bridge
```

Health endpoint:

```
GET /health
```

Analysis endpoint:

```
POST /analyze
```

The web app should normally talk only to its same-origin `/api/katago/*` routes, not directly to the bridge.

## Query construction

P11 converts a saved P8 game into:

- board dimensions;
- effective komi;
- fixed handicap stones;
- initial player;
- complete move history;
- requested analysis turn(s);
- visit budget;
- principal-variation length;
- ownership request;
- policy request.

Passes become:

```
"pass"
```

Board coordinates use standard Go / GTP columns, skipping I.

## Handicap

Fixed P8 handicap stones are sent as `initialStones`.

White is set as the first player after fixed handicap.

The adapter sends the effective komi stored with the game and explicitly sets:

```
whiteHandicapBonus = 0
```

for the application's current area-scoring model.

## Rules compatibility

P8's beginner game engine currently uses:

- area-style scoring;
- app-controlled komi;
- simple ko or the app's configured ko rule.

P11 sends KataGo:

```
rules = "chinese"
```

plus the exact game komi.

This is intentionally close to the product's area-scoring teaching model, but it is **not a claim of perfect rule equivalence**.

Rare superko, encore, tax, or other ruleset edge cases can differ.

The adapter should therefore not use KataGo to retroactively override P1 legality.

## Analyze-turn convention

For KataGo:

```
turn 0 = initial position
turn 1 = after moves[0]
turn 2 = after moves[1]
...
```

To grade app move N, P11 asks for the position at:

```
turn N - 1
```

so candidates are evaluated before the learner plays that move.

## Candidate search

Normal review requests widen root candidate discovery with:

```
rootPolicyTemperature = 1.35
rootFpuReductionMax = 0
```

The goal is not to change KataGo into a weaker engine.

It is to make move comparison less likely to omit plausible alternatives.

## Played-move recovery

Very poor or low-policy played moves may not appear in normal `moveInfos`.

P11 handles this explicitly.

```
normal root search
      ↓
played move missing?
      ↓ yes
second root query
      ↓
allowMoves = exact played move
      ↓
obtain score/winrate for actual move
      ↓
compare with normal best candidate
```

This prevents:

> actual move was absent → analysis says unknown

for exactly the moves most worth reviewing.

## Score-loss classification

P11 uses score lead as the primary move-comparison quantity.

Current product thresholds are:

```
< 1.5 pt     Reasonable
< 3.5 pt     Small improvement
< 8 pt       Meaningful mistake
≥ 8 pt       Turning point
```

These are **THIEPN Go product heuristics**, not thresholds defined by KataGo.

They can be calibrated later against learner level and board size.

Winrate loss remains visible as secondary context.

## Why score first

Win probability can become extremely close to 0% or 100% even while moves still differ meaningfully in quality.

That is especially unhelpful for:

- handicap games;
- large skill mismatches;
- developing players.

P11 therefore leads with:

> roughly N points

rather than:

> winrate changed by N%.

## Ownership

When requested, P11 renders KataGo ownership directly in the shared SVG Go board.

Because the baseline engine config reports analysis as `SIDETOMOVE`:

- positive ownership values map to the player to move;
- negative ownership values map to the opponent.

Weak ownership values are hidden by a visual threshold.

The overlay is intentionally soft rather than a raw square heatmap.

## Candidate visualization

The engine board can show the top candidate moves as:

```
1
2
3
```

The played move receives `!` when it is outside those top displayed candidates.

Candidate rows show:

- coordinate;
- score lead;
- visits;
- search policy;
- optional Human SL policy;
- principal variation preview.

## Principal variation

P11 preserves KataGo PV coordinates and normalized board points.

The current UI shows a short textual sequence.

The data contract is ready for richer ghost-stone / scrubbed PV playback during later V10/P12 work.

## Policy

Standard KataGo search policy is preserved.

Candidate-level `prior` is shown as secondary information.

Raw full-board policy arrays are retained in the normalized analysis contract for later visualization but are not exposed as the primary beginner experience.

## Human SL

If a compatible Human SL model is configured, the Engine Check can request profiles such as:

- 20k;
- 15k;
- 10k;
- 5k.

The request sets the selected `humanSLProfile` and the review-oriented root settings.

When KataGo returns `humanPrior`, the app can say:

> This is a recognizable human move at the selected modeled level.

Human likelihood is context, not correctness.

A human-looking move can still lose points, and an unusual move can still be excellent.

## Whole-game batching

P11 exposes:

`analyzeSavedGameBatch(...)`

For a computer game it requests only the human player's turns.

For a local game it can request all played turns.

Missing uncached turns are sent in one KataGo query through `analyzeTurns`.

This API is primarily groundwork for P12, where the coach can identify a game's largest meaningful turning points efficiently.

## Cache

Normalized position analysis is cached locally using:

- game ID;
- move number;
- visit budget;
- Human SL profile;
- ownership flag;
- policy flag.

Default freshness is 30 days.

The cache stores engine results, not neural-network models.

## Public proxy security

The same-origin analysis endpoint does **not** forward arbitrary KataGo JSON.

It:

- rejects special engine actions;
- limits request body size;
- validates board dimensions;
- limits move history;
- limits analyze-turn count;
- caps visits;
- caps PV length;
- bounds root-search tuning;
- limits `allowMoves`;
- allowlists Human SL override settings.

This matters because KataGo's analysis protocol also contains advanced control features that a public client should never receive unrestricted access to.

For a wider public deployment, P15/P16 should additionally add account-level quotas and rate limiting.

## Failure behavior

If KataGo is not configured or unavailable:

- Learn works;
- Practice works;
- Play works;
- deterministic P10 Review works;
- Study works;
- Progress works.

The Review screen reports engine status and Engine Check shows a recoverable unavailable state.

KataGo is not a boot dependency.

## Mastery boundary

P11 does **not** automatically turn engine point loss into negative P7 mastery evidence.

A score swing says:

> this move mattered

but does not necessarily say:

> the learner misunderstands concept X.

P10's high-confidence deterministic findings can already feed mastery.

P12 will combine:

- deterministic concept evidence;
- engine magnitude;
- recurring patterns;
- learner level;
- prior mastery;
- remediation results

before deciding what becomes personalized coaching evidence.

## Automated validation

Tests cover:

- Go/GTP coordinates and skipped I;
- pass conversion;
- handicap query construction;
- komi;
- analyze-turn indexing;
- ownership/policy requests;
- Human SL query settings;
- exact played-move forcing;
- normalized candidate data;
- PVs that include the root candidate;
- PVs that omit the root candidate;
- ownership/policy array alignment;
- played-move recovery;
- score-loss calculation;
- whole-game batching;
- human-turn filtering for computer games;
- HTTP response envelopes;
- partial-search filtering;
- unavailable-service errors;
- health response sanitization;
- beginner translation;
- Human SL explanation.

## P11 boundary

Application integration is complete.

Operational activation still requires:

1. installing KataGo on an analysis host;
2. supplying a compatible main neural-network model;
3. optionally supplying a Human SL model;
4. starting the bridge;
5. setting the web application's bridge URL/token.

P12 builds personalized coaching on top of this adapter.

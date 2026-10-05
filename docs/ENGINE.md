# Go Engine

## P1 status

The initial headless Go rules engine is complete.

It intentionally has no React, DOM, CSS, animation, persistence, account, or AI dependencies.

## Public modules

```
src/go/engine/
├── types.ts
├── board.ts
├── groups.ts
├── game.ts
├── scoring.ts
└── index.ts
```

## Supported behavior

### Board

- immutable board updates;
- arbitrary supported teaching/game sizes from 2×2 through 25×25;
- orthogonal-neighbor geometry;
- coordinate/index conversion;
- deterministic board serialization.

### Groups

- connected same-color group detection;
- unique liberty calculation.

### Game rules

- alternating play;
- curated setup positions;
- occupation checks;
- captures;
- multi-stone captures;
- capture-before-suicide resolution;
- suicide rejection;
- simple ko;
- positional-superko option;
- pass tracking;
- two-pass game termination;
- capture counts;
- immutable move/history state.

### Scoring foundation

Current scoring uses area scoring:

```
score = stones on board + exclusively surrounded empty intersections
```

Komi is added to White.

Neutral regions touching both colors remain neutral.

## Important scoring limitation

P1 does **not** attempt automatic dead-group adjudication.

That is deliberate.

A finished human Go position can contain stones that both players agree are dead. Determining those groups automatically is a separate semantic problem and should not be hidden inside the primitive area flood-fill.

The later scoring/game-end experience will explicitly support dead-stone confirmation or play-out before final scoring.

## Engine invariants

1. UI code never decides move legality.
2. Captures are resolved before suicide is checked.
3. Illegal moves return the unchanged game state.
4. Ko checks operate on serialized board history.
5. Setup positions are validated for bounds and overlap.
6. Engine state is treated as immutable.
7. Scoring is deterministic and independent of rendering.

## Validation

The production engine has been compiled independently with strict TypeScript settings.

Smoke validation covers:

- single-stone capture;
- suicide rejection;
- legal capture from an apparently surrounded point;
- four-stone simultaneous capture;
- immediate ko rejection;
- two-pass ending;
- area territory calculation.

Repository unit tests additionally cover:

- board immutability;
- corner/center neighbor geometry;
- connected groups and liberty counts;
- occupied/out-of-bounds moves;
- setup overlap;
- multi-stone group capture;
- simple ko;
- positional-superko path;
- play after game end;
- neutral-area scoring.

## Next boundary

P2 may consume the engine through `src/go/engine/index.ts`.

The board renderer may:

- display engine positions;
- emit requested intersection coordinates;
- animate differences between positions.

It may **not** duplicate capture, liberty, ko, or scoring rules.

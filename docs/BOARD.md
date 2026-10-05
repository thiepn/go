# Board Rendering & Interaction

## P2 status

The reusable Go board rendering and interaction foundation is complete.

The board consumes engine state and presentation metadata. It does not own Go legality, captures, ko, scoring, or turn rules.

## Public API

`src/board/index.ts` exports:

- `GoBoard`
- board geometry helpers
- presentation metadata types
- transition diff helpers
- feedback hooks

## Rendering model

The board is SVG-first.

Reasons:

- crisp at every device scale;
- easy 5×5 / 9×9 / 13×13 / 19×19 reuse;
- direct intersection hit targets;
- semantic overlays;
- lightweight animations;
- straightforward accessibility;
- easy future export/screenshot support.

## Supported presentation

### Board

- warm kaya-inspired surface;
- restrained grain;
- responsive grid;
- standard star points for 9×9, 13×13, and 19×19;
- optional Go coordinates using the standard alphabet that skips I.

### Stones

- material-style radial lighting;
- independent black/white treatments;
- soft shadows;
- instance-scoped SVG resources so multiple boards can render safely.

### Interaction

- pointer;
- touch;
- keyboard arrow navigation;
- Enter/Space activation;
- hover/focus ghost stone;
- accessible live coordinate/state announcement.

The renderer emits a point intent. The engine decides whether that point is legal.

### State markers

- last move;
- custom text/dot markers;
- focus highlights;
- liberty highlights;
- warning highlights;
- success highlights;
- selected highlights;
- connected-group halos.

## Motion

### Placement

New stones animate from a small raised state into a settled physical position.

### Capture/removal

The board diffs the previous engine position against the new engine position. Removed stones briefly lift, fade, and shrink.

This diff is presentation-only. It does not infer why a stone disappeared.

### Educational emphasis

Highlights may pulse unless reduced motion is active.

## Feedback boundary

Board feedback currently exposes semantic events:

```
place
capture
invalid
focus
success
```

The feedback layer supports:

- optional haptics;
- an injected sound callback.

Actual recorded stone sounds belong to V3 rather than being approximated with synthetic browser beeps.

## Accessibility

Current foundation includes:

- keyboard navigation;
- focus-visible cursor;
- explicit board label;
- live focused-coordinate announcement;
- color-independent marker shapes;
- reduced-motion behavior;
- no information that requires haptics.

Later accessibility work will include higher-contrast board variants and deeper screen-reader game descriptions.

## Engine-backed integration surface

The current app shell now includes a real 9×9 board using P1 engine state.

It demonstrates:

- alternating placement colors;
- legal/illegal move response;
- capture transitions;
- last-move marker;
- optional coordinates;
- reset;
- beginner-safe error wording.

This screen is a board-foundation preview, not the final course lesson system.

## CI

A GitHub Actions verification workflow is present at:

`.github/workflows/verify.yml`

It is configured to run:

1. dependency installation;
2. unit tests;
3. production build.

## Architectural invariant

The board may:

- display a position;
- display teaching overlays;
- animate changes between positions;
- emit an intersection intent.

The board may not:

- decide captures;
- decide suicide;
- decide ko;
- change turns;
- score the game;
- infer lesson correctness.

Those responsibilities remain outside the renderer.

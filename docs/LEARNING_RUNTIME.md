# Educational Interaction Runtime

## P3 status

The educational runtime foundation is complete.

The runtime converts declarative lesson content into:

- engine-backed board state;
- learner interaction;
- validation;
- misconception feedback;
- progressive hints;
- semantic board presentation;
- timed choreography;
- retry and rewind behavior;
- lesson progression.

Lessons are data. They are not React pages.

## Core architecture

```
LessonDefinition
      ↓
validateLesson
      ↓
LessonRuntime reducer
      ↓
LessonPlayer
      ↓
GoBoard + Go engine
```

The runtime owns pedagogy state. The Go engine owns Go rules. The board renderer owns presentation.

## Interaction primitives

P3 supports:

- `continue`
- `play-move`
- `select-points`
- `select-stones`
- `select-group`
- `mark-liberties`
- `identify-territory`
- `choose-answer`
- `predict-move`
- `predict-sequence`

Each primitive can define:

- instruction;
- board setup override;
- accepted answer;
- misconception-specific feedback;
- hints;
- success text;
- presentation effects;
- choreography cues.

## Correctness model

### Play move

The lesson may constrain acceptable teaching moves, but actual move legality is still decided by the Go engine.

### Point collections

The learner must identify the exact expected set. Partial progress is retained and displayed.

### Group selection

The runtime asks the Go engine for the actual connected group and compares it with the lesson target.

### Reading sequences

Predicted sequences are order-sensitive. A broken line resets the active sequence while preserving correction feedback.

## Progressive hints

Hints form a ladder.

A hint can provide:

- text only;
- text + highlight;
- text + engine-derived liberties;
- text + ghost move;
- other semantic presentation effects.

Repeated hint requests progress through the ladder rather than immediately revealing the final answer.

## Misconception feedback

Lessons may define targeted feedback for individual board points or choices.

Example:

```
"1,1": "That point is diagonal. Only points connected by a grid line touch the stone."
```

This lets content explain the learner's actual mistake rather than returning a generic failure message.

## Semantic board effects

Content supports low-level presentation effects:

- highlight;
- group highlight;
- marker;
- ghost stone;
- clear presentation.

It also supports engine-aware semantic effects:

- `show-group`
- `show-liberties`
- `show-atari`

Semantic effects are resolved against the current engine position. Lesson authors do not need to duplicate group/liberty calculations.

## Choreography

A step may define timed cues:

```ts
choreography: [
  {
    atMs: 650,
    effects: [
      {
        type: 'ghost',
        ghost: { point: center, color: 'black' },
      },
    ],
  },
]
```

The React runtime schedules cues for the active step and cancels them when the learner moves on.

The timeline currently controls presentation effects only. Future visual phases may add richer educational motion primitives without changing lesson structure.

## State/history

Runtime state tracks:

- current step;
- engine game state;
- selected points;
- predicted sequence;
- hint depth;
- attempts;
- learner feedback;
- presentation state;
- completion;
- step history.

Rewind restores the state from before the completed action, including the board position.

Retry clears the active attempt while preserving the lesson step.

## Generic LessonPlayer

`LessonPlayer` renders all supported lesson types through one reusable interface.

It owns:

- lesson progress;
- instruction hierarchy;
- board interaction routing;
- choice UI;
- hint controls;
- retry;
- rewind;
- correction/success feedback;
- completion state.

It does not contain curriculum-specific logic.

## First real lesson

The app now launches the data-driven lesson:

`foundation-first-stone`

It teaches:

1. intersections;
2. first stone placement;
3. direct adjacency;
4. discovering four liberties;
5. naming the concept only after the learner has experienced it.

This is intentionally a small vertical slice. P4 expands the same runtime into the complete zero-to-first-game curriculum.

## Validation and tests

Current tests cover:

- lesson schema validation;
- duplicate IDs;
- invalid choice references;
- continue progression;
- point-set completion;
- correction attempts;
- engine-backed play steps;
- rewind;
- select-points;
- select-stones;
- connected-group selection;
- territory identification;
- move prediction;
- ordered sequence prediction;
- semantic liberty visualization;
- semantic atari visualization.

## P3 boundary

P3 does not yet provide the complete beginner curriculum.

That belongs to P4.

P3's requirement is that curriculum authors can express the needed teaching interactions without adding custom React screens. That requirement is now satisfied.

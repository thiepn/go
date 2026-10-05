# Technical Architecture

## Architectural goal

Keep Go rules, learning logic, content, rendering, persistence, and future AI analysis independent enough that each can evolve without rewriting the others.

## Layer model

```
app shell
│
├── learning experience
│   ├── curriculum
│   ├── lesson runtime
│   ├── mastery
│   └── Beginner Guardian
│
├── board UI
│   ├── renderer
│   ├── interaction
│   ├── animation timeline
│   ├── sound
│   └── haptics
│
├── Go domain
│   ├── rules engine
│   ├── game history
│   ├── scoring
│   └── SGF adapter
│
├── persistence
│   ├── anonymous local state
│   └── later account sync
│
└── later analysis
    ├── deterministic review
    └── KataGo adapter
```

## Proposed repository structure

```
src/
  app/
  components/
  features/
    learn/
    practice/
    play/
    review/
  go/
    engine/
    scoring/
    sgf/
  learning/
    concepts/
    curriculum/
    guardian/
    mastery/
    runtime/
  board/
    model/
    renderer/
    animation/
    audio/
  content/
    lessons/
    problems/
  storage/
  styles/
  test/
docs/
```

This may evolve, but dependency direction must remain disciplined.

## Dependency rules

### Go engine

May depend on:
- standard TypeScript utilities.

Must not depend on:
- React;
- DOM;
- CSS;
- audio;
- persistence;
- lesson content;
- KataGo.

### Learning runtime

May consume:
- engine state;
- content definitions;
- mastery state.

Must not manipulate raw DOM animation directly.

### Board renderer

Receives:
- position;
- presentation state;
- interaction permissions.

It does not decide Go legality.

### Animation system

Expose semantic commands rather than lesson-specific imperative code.

Examples:

```ts
board.placeStone(...)
board.capture(...)
board.highlightLiberties(...)
board.highlightGroup(...)
board.showAtari(...)
board.showTerritory(...)
board.previewVariation(...)
board.showEye(...)
board.rewind(...)
```

Lesson content should request semantic effects; the visual system owns implementation.

## Lesson runtime

Must support:

- sequence;
- parallel effects;
- delay;
- wait for learner;
- validate action;
- branch on result;
- retry;
- progressive hint;
- rewind;
- replay;
- skip nonessential animation;
- resume persisted lesson state.

## Content as data

Lessons should not be hardcoded as React pages.

Conceptual lesson unit:

```ts
type LessonStep =
  | DemonstrationStep
  | PlayMoveStep
  | SelectPointsStep
  | SelectStonesStep
  | PredictMoveStep
  | PredictSequenceStep
  | IdentifyTerritoryStep
  | ChoiceStep
  | ExplanationStep;
```

A content definition should declare:

- concept;
- prerequisites;
- board setup;
- learner action;
- valid outcomes;
- misconception feedback;
- hints;
- semantic animations;
- mastery evidence.

## Beginner Guardian

The Guardian sits between content/runtime and learner presentation.

Responsibilities:

- detect unknown terminology;
- enforce prerequisites;
- choose explanation level;
- trigger remediation;
- cap simultaneous novelty;
- control advanced UI exposure.

It must be deterministic/testable before any future generative explanation layer is considered.

## Go engine requirements

Core engine eventually owns:

- board sizes;
- coordinates;
- stones;
- groups;
- liberties;
- legal moves;
- capture;
- suicide rules;
- ko;
- superko where rules require it;
- passes;
- history;
- undo;
- game end;
- scoring;
- ruleset configuration.

Every domain behavior requires tests independent of the UI.

## SGF boundary

SGF is the external interchange format for games/study trees.

Internal domain objects may be richer, but import/export must preserve:
- moves;
- setup stones;
- comments;
- variations;
- marks;
- metadata where supported.

## Persistence

Begin anonymously.

Local learner state includes:
- curriculum position;
- concept mastery;
- lesson attempts;
- hint usage;
- game history;
- settings.

Account sync is additive later. Account creation must not be required to begin learning.

## Future analysis boundary

KataGo must remain behind an adapter.

The learning UI should request meanings such as:

- candidate moves;
- ownership;
- score change;
- principal variation;
- human-like policy where available.

The raw engine protocol must not leak throughout UI code.

## Quality gates

No phase may bypass:

- engine unit tests;
- lesson-schema validation;
- keyboard interaction checks;
- reduced-motion semantics;
- mobile touch-target verification;
- no-unknown-vocabulary checks for beginner content.

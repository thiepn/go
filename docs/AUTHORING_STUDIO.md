# Content Authoring Studio

P14 adds an internal authoring workspace for Go lessons and practice problems.

## Access

Open the app with:

`?studio=1`

The studio is intentionally hidden from the learner-facing home screen. It is an internal content-production tool and must not add complexity to the beginner experience.

## What it edits

### Lessons

The studio authors the existing `LessonDefinition` contract used by the production learning runtime.

Structured controls cover:
- lesson ID, title, and concept;
- visual board setup;
- player to move;
- step ordering, duplication, removal, and interaction type;
- step title, instruction, and success copy;
- progressive hint ladders;
- misconception-specific point feedback;
- choreography cue timing.

The canonical JSON source remains visible for advanced fields such as:
- exact accepted/expected point sets;
- choice definitions;
- semantic presentation effects;
- choreography effect payloads;
- per-step board overrides.

### Practice problems

The studio authors the existing `ProblemDefinition` contract.

Structured controls cover:
- ID, title, concept, tags, and difficulty;
- visual board setup;
- player to move;
- root solution branches;
- solved/continue verdicts;
- branch feedback;
- progressive hint ladders.

Nested problem-tree continuations, opponent replies, refutations, highlighted hint points, and other advanced branch details remain directly editable in canonical JSON.

## Safety model

The studio does not introduce a second content format.

Every draft is validated with the same production validators used by:
- `LessonPlayer`;
- `ProblemPlayer`.

Preview is disabled until the draft is valid. A valid draft can then be run through the real lesson or practice runtime before export.

This keeps authoring, validation, and learner execution on one contract instead of letting an editor silently diverge from production behavior.

## Persistence and transfer

Each lesson/problem draft is autosaved locally.

The source pane supports:
- JSON formatting;
- clipboard copy;
- JSON import;
- JSON export;
- reset to a known-valid template.

Exported JSON is intentionally plain data. Moving content into the shipped curriculum still requires a deliberate repository change so production content remains reviewable, testable, and version-controlled.

## Boundaries

P14 is an internal production tool, not a public no-code CMS.

It deliberately does not:
- write directly into the GitHub repository;
- publish content without review;
- invent new lesson/problem schemas;
- bypass engine replay tests;
- expose authoring UI to ordinary learners.

Future content can extend the structured controls as authoring patterns stabilize, while canonical JSON remains the escape hatch for the full runtime schema.

# Mastery & Knowledge Graph

## P7 status

The first retention-aware, prerequisite-aware mastery system is complete.

P7 connects evidence from:

- course lessons;
- practice / tsumego;
- guided games;
- future game review.

The system no longer treats "completed" as equivalent to "mastered."

## Knowledge graph

The beginner graph currently contains:

```
Board
├── Turns
├── Liberties
│   ├── Groups
│   │   ├── Atari
│   │   │   └── Capture
│   │   │       ├── Ko
│   │   │       └── Reading
│   │   └── Connection
│   │       ├── Safety
│   │       └── Territory
│   └── Safety
│
Territory
├── Life & eyes
├── Passing
│   └── Scoring
└── Scoring
```

The actual graph is stored as explicit prerequisite edges rather than inferred from lesson order.

## Canonical concepts

P7 normalizes lesson and problem terminology into stable concept IDs.

For example:

```
turns-and-liberties
→ turns
→ liberties

groups-and-connection
→ groups
→ connection

group-capture
→ groups
→ capture
```

This prevents content naming from becoming the analytics schema.

## Evidence model

Each evidence event records:

- canonical concept;
- source;
- source item ID;
- success outcome;
- evidence weight;
- first-attempt status when meaningful;
- hints used;
- mistakes;
- response time;
- timestamp.

Sources currently include:

```
lesson
practice
guided-game
review   // reserved for P10+
```

## Lesson evidence

When a learner finishes a lesson, P7 records:

- concept;
- cumulative mistakes across the lesson;
- cumulative hints;
- whether it was effectively first-try / no-help;
- elapsed lesson time.

Rewind does not erase cumulative mistake or hint evidence.

## Practice evidence

Each solved problem records:

- concept;
- first-try status;
- mistakes;
- hints;
- elapsed problem time.

Existing P6 aggregate practice history is migrated into approximate P7 evidence once so earlier work is not discarded.

Migration is idempotent.

## Guided-game evidence

A guided scenario declares the concepts it actually exercises.

The first 9×9 game currently contributes lower-weight evidence for:

- connection;
- territory;
- atari;
- capture;
- passing;
- scoring.

The guided runtime now also tracks off-plan / illegal attempts as mistakes.

Help-button use is recorded as hint dependence.

Guided evidence has lower base weight than independent practice because the line is deliberately scaffolded.

## Response behavior

Response time is recorded.

It does **not** currently increase or decrease mastery.

This is deliberate:

- quick guessing should not be rewarded;
- slow deliberate reading should not be punished;
- later diagnostics may use response behavior to distinguish fluent recall from effortful recall, but only with sufficient evidence.

## Mastery calculation

For each concept, P7 derives:

- exposure count;
- evidence count;
- source diversity;
- weighted accuracy;
- first-attempt accuracy;
- hint dependence;
- average response time;
- last evidence time;
- estimated retention;
- confidence;
- raw mastery;
- prerequisite-adjusted mastery;
- review-due state.

## Retention

Recent evidence has higher estimated retention.

The model derives a concept-specific half-life from:

- amount of successful evidence;
- evidence weight;
- source diversity.

More repeated and varied success therefore decays more slowly.

Retention is not presented as a scientifically precise memory probability. It is an application-level scheduling estimate.

## Prerequisite adjustment

A downstream concept cannot fully ignore weak foundations.

Concept mastery is moderated by the weakest prerequisite.

This means a few successful capture problems cannot completely hide very weak:

- liberties;
- groups;
- atari.

The adjustment is intentionally a moderation rather than a hard minimum so genuine transfer evidence can still count.

## Mastery states

The visual state system is:

```
○        Not measured
◐        Learning
●        Established
● + ring Mastered
```

A concept also may be marked:

```
Review due
```

when retention or recent accuracy has fallen below the review threshold.

## Weakness diagnosis

P7 ranks review candidates using:

- low mastery;
- review-due status;
- low confidence;
- graph leverage / number of downstream dependents.

This makes foundational skills more valuable remediation targets.

Example:

```
capture failures
        ↑
weak atari recognition
        ↑
weak liberty counting
```

Rather than blindly prescribing more capture drills, the system can recommend liberties because improving them supports multiple later concepts.

## Focused remediation

The Progress screen exposes one primary recommendation:

```
Best next focus
Liberties
43% mastery

[ Practice this ]
```

The action passes that concept's practice tags directly into the P6 practice system, creating a targeted session instead of returning the learner to a generic menu.

## Progress UI

Progress unlocks after the first guided game alongside Practice.

It shows:

- measured overall mastery;
- number of measured concepts;
- number due for review;
- one primary diagnosis;
- direct remediation action;
- all knowledge-graph concepts;
- mastery stone state;
- accuracy;
- retention;
- evidence count;
- prerequisite labels.

The screen explicitly shows no recommendation when evidence is insufficient.

The product does not invent a weakness just to fill a dashboard.

## Local-first persistence

P7 evidence is stored locally:

`thiepn-go:mastery-evidence:v1`

No account is required.

P16 can later synchronize this evidence without changing the mastery domain model.

## Automated validation

Tests cover:

- concept alias normalization;
- clean vs hinted/mistaken evidence quality;
- retention decay over time;
- review-due behavior;
- prerequisite moderation;
- response-time neutrality;
- prerequisite-aware weakness recommendation;
- no recommendation without evidence;
- migration from P6 practice history;
- idempotent history migration.

## M4 status

P7 implements the machinery required for:

> M4 — the app identifies the learner's actual conceptual weakness.

Automated tests verify that the model can prefer a weak prerequisite over a downstream symptom in controlled evidence sets.

That is implementation validation, not empirical learner validation.

Real M4 certification still requires comparing app diagnoses with observed mistakes from real learners, especially once P10 supplies richer game-review evidence.

## P7 boundary

P7 models knowledge from existing evidence.

It does not yet provide unrestricted independent games.

That is P8.

P8 will create broader natural play evidence and begin the transition away from authored game lines.

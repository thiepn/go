# Personalized Coach

## P12 status

Implementation complete.

Empirical learning-transfer certification remains pending.

P12 closes the first full product loop:

```
play
→ review
→ diagnose
→ practice
→ carry one objective into the next game
→ measure the same pattern again
→ keep or change focus
```

The Coach is not a generic chatbot.

It is a decision layer over:

- P7 mastery evidence;
- P10 deterministic review;
- P11 optional KataGo analysis;
- P6 targeted practice;
- P8 independent games.

## Core principle

The Coach should answer:

> What is the single most useful thing for me to work on next?

It should not answer with:

- a long list of every weakness;
- raw engine metrics;
- speculative strategy advice;
- motivational filler;
- an invented diagnosis when evidence is missing.

## Evidence hierarchy

### Concept diagnosis

Concept diagnosis may come from:

1. deterministic P10 findings;
2. P7 mastery evidence;
3. supported prerequisite relationships in the knowledge graph.

KataGo does **not** create concept diagnoses.

A large engine score loss can tell the Coach:

> This position mattered.

It cannot by itself tell the Coach:

> The learner misunderstands liberties.

That distinction is enforced in code.

### Turning-point importance

KataGo may increase the importance of an already identified review moment.

For example:

```
P10:
ignored atari
→ Safety

P11:
same move lost about 9 points

P12:
high-priority Safety turning point
```

Engine-only turning points remain concept-neutral.

## Recent-game signal

The Coach reviews up to five recent games.

Each deterministic finding receives a conservative weight:

- high-confidence mistake: highest;
- warning: medium;
- opportunity: low.

Recent games receive a modest recency bonus.

Recurring concepts across several games receive more weight than a single isolated event.

## Root-cause diagnosis

P12 does not automatically train the visible symptom.

Example:

```
Recent games:
Safety mistakes repeat

Mastery graph:
Safety
├── Liberties
└── Connection

Evidence:
Liberties is materially weaker / due for review
Connection is stable

Coach focus:
Liberties
```

The Coach walks backward through supported trainable prerequisites when:

- that prerequisite has actual evidence;
- it is meaningfully weaker than the symptom; or
- it is due for review.

It does not choose an unmeasured prerequisite merely because it exists in the graph.

## Confidence

Coach focus confidence is:

- Early signal;
- Moderate evidence;
- Strong evidence.

Strong evidence requires repeated game behavior plus a minimally supported mastery model.

This is a display of evidence strength, not a probability that the learner has a diagnosis.

## One focus

Every active plan has exactly one primary concept.

A plan contains:

- concept;
- evidence strength;
- reason;
- practice tags;
- current mastery;
- recurrence counts;
- one next-game objective;
- up to four turning points;
- baseline behavior metrics;
- optional KataGo enrichment.

## Next-game objectives

The Coach converts abstract concepts into one observable in-game cue.

Examples:

### Safety

> Before every move, scan your own groups first. If any group has one liberty, decide deliberately whether to save, connect, capture, or sacrifice it.

### Capture

> Before choosing a move, scan every nearby opponent group for an immediate final-liberty capture.

### Connection

> Before playing elsewhere, check whether two nearby groups can be cut apart and whether one move connects them safely.

### Reading

> Before committing to a tactical move, predict the opponent’s most forcing reply and your answer to it.

The objective is displayed:

- in the Play setup;
- during the coached game.

The Coach deliberately uses one objective rather than stacking multiple prompts.

## Targeted practice

If the focus concept has P6 practice tags, the Coach launches a five-problem focused session.

Practice completion records:

- total problems;
- clean solves;
- repeated problems;
- completion time.

Normal Practice remains unchanged.

A coach-origin practice session returns to the active Coach cycle.

## Turning-point selection

P12 ranks a maximum of four important recent moments.

Deterministic importance combines:

- severity;
- confidence;
- relationship to the active focus;
- recency.

The list is capped at two moments per game so one noisy game cannot monopolize the plan.

## KataGo enhancement

When P11 is live, the Coach can optionally run a batched scan over recent source games.

The button is:

> Add KataGo ranking

P12 requests only recent source games and uses a moderate visit budget.

Engine score loss may:

- boost the rank of an existing deterministic moment;
- add a strategically important engine-only turning point.

It may not:

- create a mastery concept;
- reduce mastery by itself;
- change the active focus solely because of score loss.

If KataGo fails, the deterministic plan remains valid.

## Baseline

Each Coach plan freezes a baseline at creation.

The baseline stores:

- focus mastery;
- weighted matching review findings;
- learner move count;
- normalized signal per 20 learner moves;
- source game IDs.

This prevents the comparison target from silently changing after the intervention.

## Behavior metric

P12 measures matching deterministic findings per 20 learner moves.

Current finding weights:

```
mistake      2.5
warning      1.1
opportunity  0.45
```

Then:

```
weighted signal
÷ learner moves
× 20
```

This avoids declaring improvement merely because the follow-up game was shorter.

The metric is a product-level behavior signal, not an official Go rating.

## Follow-up game selection

A follow-up game must occur after plan creation.

Games with fewer than ten learner moves are considered too short for a meaningful behavior check.

If the learner later plays a full game, the abandoned/short game no longer blocks evaluation.

For an active cycle, the Coach evaluates the latest sufficiently long follow-up game.

This lets the learner repeat the same focus over several games and see later improvement or regression.

## Outcome classes

### Ready to test

No follow-up game yet.

### Need a fuller game

Only short/abandoned follow-ups exist.

### The pattern improved

The normalized matching signal fell substantially.

A complete absence of the coached deterministic pattern is treated as a strong positive signal, but the UI still recommends repeating it before assuming stable mastery.

### No clear change yet

The difference is too small to call.

The Coach recommends keeping the same narrow focus rather than immediately switching topics.

### The pattern needs another cycle

The same pattern increased substantially.

The Coach points back to:

- turning point;
- focused practice;
- another coached game.

## Improvement thresholds

For plans with a game baseline, improvement currently means either:

- follow-up signal <= 65% of baseline; or
- absolute improvement >= 0.65 weighted findings per 20 moves.

Regression currently means:

- follow-up >= 135% of baseline; and
- absolute increase >= 0.45.

These are THIEPN Go product heuristics.

They are deliberately conservative and should be calibrated using real learner data.

## Mastery change

The outcome also shows the change in P7 mastery since plan creation.

Practice can improve mastery evidence.

However:

- mastery gain alone does not prove game transfer;
- game transfer and practice mastery are shown separately.

## Persistent cycles

Coach plans are stored locally.

The store keeps:

- active plan;
- up to 12 recent plans;
- practice completion;
- engine-enhanced turning points;
- frozen baseline.

The learner can choose:

> Build next plan

after a follow-up measurement.

The old plan is archived rather than overwritten.

## Navigation

Home now exposes:

> Coach

after beginner onboarding.

Coach can launch:

- focused Practice;
- coached Play;
- Review of a turning point;
- Review of the follow-up game.

Coach-origin practice returns to Coach.

Coach-origin Play returns to Coach.

Coach-origin Review returns to Coach.

## Empty-state behavior

If there is no supported game or mastery evidence, P12 says:

> The coach needs evidence before it gives advice.

It then offers:

- Practice;
- Play.

It does not manufacture a recommendation.

## Automated validation

Tests cover:

- repeated deterministic symptoms;
- prerequisite root-cause selection;
- legal multi-game fixtures;
- deterministic + KataGo turning-point merging;
- engine-only turning points remaining concept-neutral;
- behavior signal normalization;
- improved follow-up detection;
- short-game skipping;
- later full-game selection;
- coaching-plan persistence;
- practice completion persistence;
- no plan with no evidence;
- no concept diagnosis from engine-only scans.

## M5 status

M5 is:

> targeted practice measurably improves the next game.

P12 now implements the full measurement path needed for M5.

Code can verify that:

- an intervention was selected;
- practice was completed;
- a focused game was played;
- the same deterministic behavior signal changed.

That does **not** prove the teaching intervention genuinely causes learner improvement.

M5 remains empirically pending until real learners repeatedly show better behavior after targeted remediation compared with their own prior games.

## P12 boundary

P12 does not yet provide a large developing-player curriculum.

Its diagnoses are limited by the concepts and practice material currently available.

The next phase expands what the Coach can actually teach:

P13 — Developing-Player Curriculum.

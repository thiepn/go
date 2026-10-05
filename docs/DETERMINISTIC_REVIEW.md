# Deterministic Game Review

## P10 status

The first explainable game-review system is implemented.

P10 reviews complete P8 game records without requiring an external Go engine.

Its purpose is narrow and deliberate:

> identify tactical facts the app can explain from the rules and immediate move sequence.

It does **not** pretend to evaluate subtle strategy.

## Review pipeline

```
saved P8 game
→ reconstruct every position
→ inspect learner move
→ inspect immediate reply
→ deterministic detectors
→ confidence / severity
→ concept mapping
→ optional retry
→ focused practice
→ mastery evidence when justified
```

For computer games, only the human player's moves are reviewed.

For local games, both sides can receive findings.

## Position reconstruction

Every review frame contains:

- position before the move;
- actual move;
- position after the move.

The game is rebuilt from the beginning using the P1 Go engine.

This preserves:

- handicap setup;
- side to play;
- captures;
- suicide legality;
- ko;
- passes.

If a stored move cannot be replayed legally, review fails explicitly rather than analyzing an invented position.

## Finding classes

### Ignored atari

High confidence when:

1. one of the player's groups has exactly one liberty before the move;
2. the move does not rescue it;
3. the opponent captures that group immediately.

Classification:

- severity: mistake;
- confidence: high;
- concept: Safety;
- eligible for P7 mastery evidence.

The review also computes legal rescue moves from the original position.

### Group left in atari

Detected when a threatened group still has one liberty after the learner moves elsewhere.

Classification:

- severity: warning;
- confidence: medium;
- concept: Safety;
- not automatically used as negative mastery evidence.

This distinction exists because sacrificing a group can be correct.

### Self-atari

Detected when the group containing the newly played stone has exactly one liberty and the move captured nothing.

If the opponent captures that group immediately:

- severity: mistake;
- confidence: high;
- mastery eligible.

If it is not immediately punished:

- severity: warning;
- confidence: medium;
- review only.

This avoids calling every deliberate sacrifice or tesuji a blunder.

### Missed immediate capture

Detected when a legal move could immediately capture opposing stones but the learner chooses a non-capturing move or passes.

Classification:

- severity: opportunity;
- confidence: medium;
- concept: Capture;
- never automatically treated as a mastery failure.

Taking every available capture is not always strategically correct.

P10 therefore says:

> An immediate capture was available.

rather than:

> Your move was wrong.

### Direct cut / missed connection point

Detected when the opponent's immediate next move occupies a point that:

- is adjacent to at least two separate learner groups;
- was also a direct connection point before the learner's move;
- was legal for the learner to occupy.

Classification:

- severity: warning;
- confidence: medium;
- concept: Connection;
- review only.

This is a concrete tactical connection observation, not a whole-board strategic judgment.

### Pass while in atari

Detected when the learner passes while one of their groups still has one liberty.

Classification:

- severity: warning;
- confidence: medium;
- concept: Safety;
- review only.

This provides a safe end-of-game / unsettled-group warning without claiming the app can solve arbitrary life and death.

## Dead-group boundary

P10 does **not** run a general dead-group classifier.

That would create unacceptable false certainty in positions involving:

- seki;
- ko;
- unsettled eye shapes;
- sacrifices;
- capturing races;
- large tactical sequences.

The deterministic end-state check is therefore limited to directly observable danger such as passing while a group remains in atari.

Broader life/death evaluation belongs to stronger later analysis.

## Severity

P10 uses three levels.

### Mistake

A concrete tactical error was immediately punished.

Examples:

- ignored atari → group captured;
- self-atari → group captured.

### Check this

The app can prove the tactical condition, but not that the strategic choice was wrong.

Examples:

- group left in atari;
- direct cut;
- unpunished self-atari;
- pass while in atari.

### Opportunity

A simple alternative existed but choosing it was not necessarily mandatory.

Example:

- immediate capture available.

## Confidence

P10 currently uses:

- high;
- medium.

High confidence is reserved for directly verifiable cause/effect such as:

```
group in atari
→ learner ignores it
→ opponent captures it immediately
```

Medium confidence is used when the board fact is certain but strategic interpretation is ambiguous.

## Review UI

The review workspace shows:

- total mistakes;
- checks;
- opportunities;
- finding list;
- move number;
- severity;
- confidence;
- mapped concept;
- explanation;
- before position;
- after position.

The actual learner move is marked on the board.

Relevant endangered stones and candidate alternatives can be highlighted.

## Before / After

Every finding can switch between:

- Before;
- After.

This makes the causal relationship visible instead of explaining it only in text.

## Show better idea

When P10 has deterministic alternatives, the learner can reveal them on the board.

Examples:

- final liberty for a capture;
- legal rescue moves for an atari group;
- direct connection point before a cut.

Every highlighted connection alternative is checked for legality before being suggested.

## Try another move

The learner can enter an interactive retry state from the exact pre-move position.

The attempted alternative is processed by the real Go engine.

The app distinguishes:

- occupied;
- suicide;
- ko;
- other illegal moves;
- legal alternative;
- legal move matching the deterministic remediation.

This is not a static diagram.

## Study handoff

Every reviewed game can be opened in the P9 Study workspace.

Review answers:

> What concrete tactical issue happened?

Study answers:

> What other branches do I want to explore?

The two systems remain separate but connected.

## Practice handoff

Every finding maps to a P7 concept.

Where that concept has P6 practice tags, Review exposes:

> Practice this

Examples:

```
ignored atari
→ Safety
→ defense / atari practice

missed capture
→ Capture
→ capture practice

direct cut
→ Connection
→ connection practice
```

## Mastery integration

Only findings marked `masteryEligible` feed negative P7 evidence.

Current eligible findings are high-confidence, immediately punished tactical mistakes.

Medium-confidence warnings and capture opportunities do not reduce mastery.

This prevents strategically debatable findings from polluting the learner model.

Review evidence uses stable source IDs:

```
<game id>:m<move>:<finding type>
```

Persistence is idempotent.

Reopening the same review does not repeatedly penalize the same mistake.

## Validation

Automated tests cover:

- exact before/after review reconstruction;
- passes in reconstructed games;
- immediate capture discovery;
- atari-group detection;
- legal rescue generation;
- distinct-group connection points;
- missed-capture classification;
- ignored-atari + immediate capture;
- punished self-atari;
- direct-cut detection;
- pass-in-atari detection;
- human-only review in computer games;
- idempotent review mastery evidence;
- exclusion of medium-confidence findings from mastery evidence.

## P10 boundary

P10 cannot reliably answer:

- whether an opening move is inefficient;
- whether influence is valuable;
- whether an invasion is correctly timed;
- whether a joseki choice is appropriate;
- how many points a move lost;
- which move is globally best;
- territory ownership probabilities;
- deep life-and-death sequences.

Those require stronger analysis.

P11 adds the KataGo adapter for:

- candidate moves;
- principal variations;
- score lead;
- ownership;
- policy;
- engine-backed move comparison.

The beginner UI should still translate those results into understandable explanations rather than displaying raw engine numbers as the primary experience.

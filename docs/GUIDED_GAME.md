# Guided 9×9 Game Engine

## P5 status

The first complete guided-game implementation is complete.

The goal is to bridge the gap between isolated lessons and independent Go.

The learner is still playing a real legal game on the P1 engine, but the first match deliberately constrains choices so every important concept can be explained reliably.

## First-game philosophy

The first game is not a weak-AI match.

A weak engine that makes arbitrary mistakes would be unpredictable as a teacher.

Instead, P5 uses an authored scenario:

```
learner move
→ board visibly settles
→ short feedback
→ opponent reply
→ next teaching decision
```

All moves are still processed by the real Go engine.

If an authored move becomes illegal, automated scenario tests fail.

## First guided game

Scenario:

`first-guided-9x9`

The learner plays Black from an empty 9×9 board.

The game teaches, inside one continuous game:

1. why corners are efficient to surround;
2. connected boundary building;
3. completing clear territory;
4. shifting attention from territory to tactics;
5. reducing liberties;
6. recognizing atari;
7. making a real capture;
8. recognizing when the teaching position is settled;
9. passing;
10. ending on two consecutive passes;
11. reading an actual area score.

The authored result is:

- Black: 14
- White: 18.5
- White wins by 4.5

That result is intentional.

The product does not manufacture a learner victory. The learning objective is completing and understanding a real game.

## Teaching controls

The game exposes four layers of help.

### What matters?

Provides the current decision frame without giving the move.

Example:

> You are beginning a boundary around the upper-left corner.

### Show me

Highlights the relevant area and may show a ghost stone for a single recommended move.

### Why?

Explains the Go principle behind the recommendation.

### Show the sequence

Shows numbered future points when a short concrete sequence is useful.

These controls are disabled while the opponent reply is being animated.

## Contextual position signals

P5 adds deterministic beginner-oriented board inspection.

The app can detect:

- learner groups in atari;
- opponent groups in atari;
- legal capturing moves for the learner.

This currently powers simple contextual warnings such as:

> There is a capture available in this position.

The detector uses the real rules engine rather than duplicating capture logic.

## Opponent choreography

The learner move and opponent move are intentionally separate runtime states.

The opponent waits briefly before replying.

This prevents two stones from appearing simultaneously and makes move causality visually legible.

## Assistance fade model

The runtime defines five support levels:

```
demonstrated
→ guided
→ assisted
→ optional
→ independent
```

The first game uses `guided`.

Current progression policy:

- Game 1: guided
- Games 2–3: assisted
- Game 4: optional
- Game 5+: independent

The infrastructure exists now even though later games are built in subsequent phases.

### Guided

- proactive teaching;
- all four help controls;
- teaching-move constraints.

### Assisted

- no constant prompting;
- all help controls remain;
- legal move freedom.

### Optional

- learner initiates help;
- no sequence reveal;
- full legal move freedom.

### Independent

- no guided-game overlays;
- normal play/review flow.

## Move constraints

For the first game, the scenario may limit a learner turn to authored teaching moves.

If the learner taps another legal point, the app explicitly says it is a legal Go move but outside the current teaching line.

This distinction is important:

> “Not the teaching move” is not presented as “illegal Go.”

## End-of-game experience

The final teaching turn is Pass.

The authored opponent passes in reply.

The engine therefore reaches its normal two-pass finished state.

The result screen shows:

- winner;
- margin;
- Black stones;
- Black territory;
- White stones;
- White territory;
- komi;
- learner turns;
- help requests;
- captures.

The result also explicitly states that winning was not the lesson.

## Course integration

The P4 completion screen now has:

> Play your first 9×9 game

This creates one uninterrupted beginner path:

```
zero knowledge
→ 12 foundation lessons
→ 9×9 readiness
→ guided 9×9 game
→ real score
```

## Automated validation

Tests verify:

- the entire authored path is legal;
- every opponent reply is legal;
- two passes finish the game;
- Black makes the intended capture;
- the final score is exactly 14–18.5;
- off-plan legal moves do not mutate a constrained guided game;
- atari detection;
- capture-move detection;
- assistance-level fade behavior.

## Certification boundary

P5 implementation provides the complete M3 path.

It does **not** prove M3 with real humans.

M3 remains empirically pending until a person who genuinely did not know Go can:

1. complete the foundation course;
2. complete the guided 9×9 game;
3. explain why stones were captured;
4. explain why the game ended;
5. understand how the final score was produced.

That novice usability test is a product certification task, not something unit tests can establish.

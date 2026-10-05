# Independent Play

## P8 status

Independent Play is implemented.

P8 is the transition from authored teaching lines to unrestricted legal Go.

The learner can now choose any legal move, play complete games, resolve the end, and keep local game records.

## Play modes

### Computer

Play against the built-in beginner-oriented heuristic opponent.

Current levels are framed as learning targets rather than guaranteed ratings:

- Beginner · 25 kyu;
- Learner · 20 kyu;
- Club beginner · 15 kyu.

These labels describe intended behavior and difficulty progression.

They are **not rank certifications**.

The built-in opponent is not KataGo and is not intended to provide strong-player analysis.

### Local

Two people can play on the same device.

The same:

- rules engine;
- clock;
- handicap;
- passing;
- scoring;
- resignation;
- saved-result flow

are reused.

## Board sizes

Independent Play supports:

- 9×9;
- 13×13;
- 19×19.

The setup screen explicitly recommends 9×9 for learners and describes 13×13 as a bridge to full-board play.

## Beginner bot

The P8 bot evaluates every legal move using deterministic beginner-oriented heuristics.

It considers:

- immediate captures;
- escaping a group in atari;
- avoiding obvious self-atari;
- connection to friendly stones;
- nearby opponent stones;
- local response to the previous move;
- basic edge / line preference;
- deterministic profile-specific noise.

The difficulty profiles differ in:

- tactical awareness;
- self-atari aversion;
- connection preference;
- locality;
- noise.

Higher levels therefore behave more consistently rather than merely receiving arbitrary bonuses.

The bot may pass after the opponent passes when the board is sufficiently developed and no urgent capture or clearly valuable local move remains.

## Determinism

The bot's variation is generated from the board state, move count, and candidate point.

The same position at the same difficulty therefore produces the same move.

This gives:

- reproducible tests;
- stable debugging;
- no random illegal behavior.

## Handicap

Fixed handicap supports 2–9 stones.

Standard star-point-style placements are generated for:

- 9×9;
- 13×13;
- 19×19.

With fixed handicap:

- Black stones are placed before play;
- White moves first;
- komi is reduced to 0.5.

## Assistance

Independent Play supports:

### Assisted

Urgent tactical facts can surface automatically.

Examples:

- your group is in atari;
- an immediate capture is available.

### Hints only

No proactive interruption.

The learner can request:

> What matters?

### Off

No coach overlays.

Unlike P5, P8 assistance never restricts legal moves.

The learner is always free to ignore the suggestion.

## Clocks

P8 provides beginner-friendly absolute time controls:

- Untimed;
- 10 minutes each;
- 20 minutes each.

Untimed remains the default.

The clock:

- runs only during active play;
- changes with the side to play;
- also counts computer thinking time;
- stops during scoring;
- can end the game on time.

Byo-yomi and advanced tournament time systems are deliberately deferred.

## Passing and game ending

Passing uses the real P1 game engine.

```
one pass
→ opponent still plays

two consecutive passes
→ scoring confirmation
```

P8 does **not** instantly accept an automatic life/death judgment.

## Dead-group confirmation

After two passes the app enters a separate scoring phase.

The player can:

- tap any stone in a dead group;
- mark the entire connected group dead;
- tap it again to restore it;
- see the score preview update;
- confirm the score;
- resume play if the status is disputed.

This follows the beginner principle:

> If you are unsure whether a group is dead, play it out.

## Area scoring

P8 continues using beginner-friendly area scoring.

After confirmed dead stones are removed:

```
stones on board
+
surrounded empty intersections
+
White's komi
=
final score
```

The result screen shows:

- winner;
- margin;
- Black area;
- White area;
- komi;
- move count;
- captures;
- board size.

## Other endings

P8 also supports:

- resignation;
- timeout.

The result is represented separately from scored endings.

## Saved games

Completed independent games are stored locally.

Each record contains:

- timestamp;
- settings;
- complete move list;
- final result;
- captures.

The Play screen shows the five most recent results.

Up to 50 records are retained locally.

This record format is intentionally richer than a visual recent-results card so P9 can later convert/replay games through SGF.

## Coordinates

13×13 and 19×19 games show board coordinates.

9×9 keeps the cleaner beginner-first board presentation by default.

## Visual behavior

The independent board reuses the same physical Go visual language as lessons and guided games.

On scoring screens:

- interactions remain enabled for selecting groups;
- placement ghosts are disabled;
- confirmed dead stones receive × markers.

This prevents the scoring phase from visually implying that a new move is being played.

## Validation

Automated tests cover:

- 9×9 / 13×13 / 19×19 game creation;
- fixed handicap layouts;
- handicap komi;
- White-to-play after fixed handicap;
- pass/pass transition into scoring;
- resume-after-dispute;
- confirmed score completion;
- resignation;
- timeout;
- dead connected-group toggling;
- dead-stone removal;
- clock presets and formatting;
- game-record creation;
- bot determinism;
- bot move legality;
- immediate capture behavior;
- atari escape preference.

## P8 boundary

The built-in opponent is intentionally modest.

It provides a useful beginner play partner, but it does not claim:

- accurate kyu calibration;
- high-quality whole-board strategy;
- joseki knowledge;
- strong life/death reading;
- professional analysis.

Those require later engine work, particularly P11's KataGo adapter.

P8 also stores move records but does not yet expose:

- SGF import/export;
- variation trees;
- comments;
- replay workspaces.

Those belong to P9.

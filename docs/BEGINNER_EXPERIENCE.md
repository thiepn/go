# Beginner Experience

## Design test

Every learner-facing screen must answer three questions immediately:

1. **What am I looking at?**
2. **What should I do now?**
3. **Why did the app respond that way?**

If a complete beginner cannot answer those without outside help, the screen is not finished.

## First-run flow

Do not open on a dashboard.

Initial experience:

```
Brand moment
   ↓
Learn Go
   ↓
tiny interactive board
   ↓
first stone
```

No account prompt, rank selector, ruleset selector, SGF terminology, analysis settings, or 19×19 board.

## Opening lesson sequence

### 0. The board

Goal: understand that Go uses intersections.

- show a tiny board;
- animate one intersection;
- place a ghost stone;
- ask learner to place the stone;
- reinforce that stones stay where placed.

### 1. Turns

Goal: understand alternating placement.

- Black places;
- White places;
- learner alternates with the app;
- no strategic burden yet.

### 2. Breathing space

Goal: discover adjacency before naming liberties.

- place one stone;
- animate its neighboring empty intersections;
- ask learner to tap them;
- only then introduce the term **liberty**.

### 3. Capture

Goal: understand removal by filling liberties.

- gradually surround a stone;
- visually reduce its remaining liberties;
- pulse the final liberty;
- learner plays the capture;
- captured stone lifts/fades from board.

### 4. Groups

Goal: understand connected stones as one unit.

- show two touching stones;
- touch one and outline the connected group;
- count shared liberties;
- contrast disconnected stones.

### 5. Staying safe

Goal: make the learner predict danger.

- identify a group with one liberty;
- show that it can be captured next;
- let learner escape or connect.

### 6. Territory

Goal: understand that capturing is not the whole purpose.

- create simple enclosed areas;
- animate ownership fill;
- compare enclosed and open space;
- let learner finish boundaries.

### 7. Life

Goal: build an intuitive idea of survival.

- introduce eye-shaped safe space;
- demonstrate why one eye is insufficient in a controlled example;
- demonstrate two secure eyes;
- delay advanced life/death vocabulary.

### 8. Ending a game

Goal: understand passing and scoring.

- show a nearly finished board;
- identify useful vs pointless moves;
- introduce pass;
- remove clearly dead stones;
- count result visually.

### 9. First guided 9×9 game

The learner plays an actual game with layered support.

Help controls:
- **What matters?**
- **Show me**
- **Why?**
- **Show the sequence**

The learner should never need to guess what the interface expects.

## Assistance fade

| Game | Assistance |
|---|---|
| 1 | heavy guidance and teaching interruptions |
| 2 | frequent hints and warnings |
| 3 | selective warnings |
| 4 | optional hints |
| 5 | independent play with post-game review |

Do not remove help based only on completed screens. Remove it when behavior shows readiness.

## Progressive hint ladder

### Hint 1 — attention

Point toward the relevant group/region without answering.

### Hint 2 — concept

State the useful concept using known vocabulary.

### Hint 3 — relation

Visualize the specific liberty, cut, eye, or boundary involved.

### Hint 4 — answer

Show a ghost move or short sequence.

Hints should preserve agency as long as possible.

## Beginner copy rules

Early copy should:

- use short sentences;
- prefer concrete verbs;
- avoid multiple unfamiliar nouns in one sentence;
- pair terminology with a plain-language meaning;
- use “this group has one liberty” before relying on “atari”;
- explain cause and effect.

Bad:

> Black has sente after the joseki and White has bad aji.

Beginner-safe:

> White still has a weakness here. Black can attack it later.

## Failure behavior

Never punish experimentation with lives or lockouts.

On a failed action:

1. preserve the learner’s attempted move briefly;
2. show the consequence or missing relationship;
3. explain in one sentence;
4. rewind;
5. let them retry.

## Beginner UI exposure

### Initially visible

- lesson title;
- tiny progress indicator;
- board;
- instruction;
- hint when useful;
- sound/motion controls through settings.

### Hidden until learned/useful

- coordinates;
- move numbers;
- move tree;
- engine evaluation;
- rank system;
- ownership heatmaps;
- SGF;
- ruleset details;
- joseki/fuseki terminology.

## Beginner usability acceptance test

Before release, observe first-time Go learners without coaching.

Treat these as defects:

- unexplained hesitation;
- repeated tapping on non-interactive surfaces;
- asking what a displayed term means;
- not knowing why an answer failed;
- not understanding a visual cue;
- not knowing what to do next;
- finishing a game without understanding why it ended;
- understanding tutorial tasks but being unable to begin an independent 9×9 game.

# Zero-to-First-Game Beginner Course

## P4 status

The first complete beginner curriculum is implemented as 12 interactive lessons across four modules.

The target learner starts with no knowledge of Go.

The end state is not “expert.” It is:

> I understand the rules well enough to begin a heavily guided 9×9 game without needing an outside explanation.

## Course structure

### Module 1 — Board basics

#### 1. Your first stone

Teaches:
- intersections;
- stone placement;
- direct adjacency;
- discovering liberties before naming them.

#### 2. Turns and breathing room

Teaches:
- Black moves first;
- alternating turns;
- stones stay where placed;
- corner stones have fewer starting liberties than center stones.

### Module 2 — Capture & safety

#### 3. Atari and capture

Teaches:
- one remaining liberty;
- the term atari;
- taking the final liberty;
- captured stones leave the board;
- capture depends on liberties rather than a fixed number of attackers.

#### 4. Stones work together

Teaches:
- connected stones form one group;
- groups share liberties;
- direct connection;
- selecting a whole group from one member stone.

#### 5. Keep your stones safe

Teaches:
- escaping atari;
- extending to gain liberties;
- suicide prohibition;
- capture-before-suicide exception.

### Module 3 — Territory & life

#### 6. Surround space

Teaches:
- capturing is not the main scoring objective;
- surrounded empty space;
- territory vs still-open contested space.

#### 7. How groups stay alive

Teaches:
- eyes;
- why one eye is generally not sufficient;
- two-eye life;
- connection to the suicide rule.

#### 8. Why immediate repetition stops

Teaches:
- a real ko capture;
- an actual attempted illegal immediate recapture;
- why the move is blocked;
- the basic idea of playing elsewhere before returning.

### Module 4 — Finish a game

#### 9. Know when the game is over

Teaches:
- passing;
- one pass does not end the game;
- two consecutive passes move the game to scoring.

#### 10. Dead stones at the end

Teaches:
- recognizing an obviously doomed group;
- removing agreed dead stones;
- resuming play when life/death is disputed instead of hiding uncertainty behind an automatic guess.

#### 11. Count the result

Teaches:
- beginner area scoring;
- stones + surrounded empty intersections;
- raw score;
- why White normally receives komi;
- higher final score wins.

#### 12. Ready for your first game

Moves to a 9×9 board and checks:
- capture recognition;
- the overall objective;
- two-eye life;
- passing/end condition;
- confidence that the rules stay the same on a larger board.

## Beginner UX constraints

The course still follows the product constitution:

- one primary idea at a time;
- visual interaction before jargon;
- no account wall;
- no rank selection;
- no 19×19 opening screen;
- no engine numbers;
- no joseki/fuseki terminology;
- targeted correction rather than generic failure;
- progressive hints;
- support can be requested rather than punished.

## Course progression

The app now launches `CoursePlayer` rather than a single lesson.

Course progress is stored locally at lesson granularity.

If local storage is unavailable, learning still works; progress simply does not persist between sessions.

The course validates:
- unique lesson IDs;
- lesson schemas;
- prerequisite concept ordering.

## New teaching primitives introduced for P4

### Expected illegal move

A learner can intentionally try a move that should be illegal.

The runtime verifies the actual engine rejection reason.

This powers:
- suicide teaching;
- ko teaching.

### Pass

A lesson can invoke a real Go pass through the engine.

Two consecutive lesson passes therefore create the same finished game state as normal engine play.

## Scoring scope

P4 teaches area scoring because it is concrete for beginners.

It does not pretend automatic dead-group detection is solved.

The course explicitly teaches:
- players resolve dead stones first;
- if they disagree, the position should be played out;
- scoring follows after that resolution.

## Validation status

Automated validation checks content structure and prerequisite order.

This is **implementation completion**, not learner certification.

M2 and M3 require real novice usability observation:
- M2: a complete beginner actually understands capture;
- M3: a complete beginner can finish and understand a 9×9 game.

M3 cannot be tested until P5 provides the guided 9×9 game.

## P4 exit state

A learner reaching the end has encountered and interacted with:

- board/intersections;
- turns;
- liberties;
- atari;
- capture;
- groups;
- connection;
- safety;
- suicide;
- territory;
- eyes;
- basic life;
- ko;
- passing;
- game ending;
- dead stones;
- area scoring;
- komi;
- winning condition.

The next phase applies those rules inside an actual guided game.

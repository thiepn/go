# Practice & Tsumego System

## P6 status

The first reusable practice system is complete.

Its purpose is different from the P3 lesson runtime:

- lessons introduce concepts;
- practice problems require retrieval and reading;
- problem history creates repetition pressure;
- P7 will later convert that evidence into concept mastery.

## Problem model

A `ProblemDefinition` contains:

- board setup;
- side to play;
- concept;
- tags;
- difficulty 1–5;
- instruction;
- problem tree;
- progressive hints;
- optional misconception-specific wrong-move feedback.

Problems are data, not React pages.

## Problem trees

Each node can contain multiple correct branches.

A branch can:

- solve immediately;
- continue to another node;
- trigger an authored opponent reply before the next learner decision.

This supports:

- alternate correct moves;
- short reading sequences;
- multiple valid solution variations;
- deterministic opponent responses.

All learner solution moves and authored opponent replies are processed through the real Go engine.

## Incorrect moves

A wrong move is not committed to the problem board.

The runtime distinguishes:

- illegal Go;
- legal Go that does not solve the problem.

Problems can override generic correction text for specific misconceptions.

Examples include:

- confusing diagonal points with liberties;
- ignoring a group in atari;
- filling one's own territory instead of closing its boundary.

## Hints

Hints form a progressive ladder.

Each hint can provide:

- text;
- highlighted points.

Using any hint removes first-try status but does not prevent solving the problem.

## Retry

Resetting a position restores the authored setup while preserving practice evidence from the current attempt:

- mistakes;
- hint count;
- loss of first-try status.

## Starter problem pack

P6 ships eight beginner problems covering:

- center capture;
- corner capture;
- escape from atari;
- connection;
- alternate ways to put a stone in atari;
- multi-stone group capture;
- two-ply reading with alternate first moves;
- territory boundary closure.

The reading problem is a real tree:

```
correct first move A
→ opponent reply
→ finish capture

or

correct first move B
→ opponent reply
→ finish capture
```

## Practice modes

The Practice hub exposes:

- Mixed review;
- Capture;
- Atari & safety;
- Connection;
- Territory;
- Reading.

The interface remains intentionally smaller than a full Go problem database.

## Local problem history

Each completed session records:

- sessions attempted;
- successes;
- wrong moves;
- first-try successes;
- hints used;
- last result quality;
- last attempt time.

A solve that required mistakes or hints is intentionally retained as weak evidence rather than treated as equivalent to a clean solve.

## Adaptive queue

P6 includes a deterministic lightweight scheduler.

Priority increases for:

- unseen problems;
- recent shaky performance;
- higher mistake rate;
- hint dependence.

Repeated clean successes lower priority.

This is **not yet the P7 mastery model**. It is only enough to make practice useful before concept-level retention modeling exists.

## Immediate remediation

Within one practice session, a problem that required a mistake or hint is appended once to the back of the queue.

This produces:

```
miss problem
→ finish it with help
→ practice other positions
→ see the shaky problem once more
```

The repeat is capped to avoid loops.

## Visual experience

Practice reuses the premium Go board but has a distinct task-focused shell:

- problem title;
- tags;
- five-step difficulty indicator;
- board;
- correction feedback;
- hint control;
- reset;
- opponent reply delay;
- solve result;
- mistake/hint summary;
- session summary.

## Beginner gating

Practice is hidden from a brand-new learner.

It unlocks after completion of the first guided 9×9 game.

This preserves the product rule that beginners should always know what to do next rather than being confronted with a toolbox of unexplained modes.

## Persistence

Practice history currently uses local storage.

No account is required.

P16 can later merge this evidence into account sync.

## Automated validation

Tests cover:

- every starter problem schema;
- every authored solution branch;
- every authored opponent reply;
- alternate correct moves;
- multi-step reading trees;
- wrong legal moves leaving the board unchanged;
- hint evidence;
- retry evidence preservation;
- adaptive queue ordering;
- focused tag filtering;
- deterministic queue order;
- clean vs shaky history recording.

## P6 boundary

P6 knows problem performance.

It does not yet answer:

> “How strong is this learner at liberties?”

or:

> “Which prerequisite is causing their capture failures?”

Those are P7 responsibilities.

P7 will aggregate lesson, practice, and eventually game evidence into a knowledge graph and retention-aware mastery model.

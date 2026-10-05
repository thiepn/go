# SGF Study Workspace

## P9 status

The first SGF-backed Study workspace is implemented.

P9 turns played games and imported records into interactive study trees rather than static move lists.

## Core model

The internal study model is independent from raw SGF syntax.

A study contains:

- metadata;
- board size;
- komi;
- a root position;
- a recursive variation tree;
- optional setup edits;
- comments;
- board marks;
- local persistence.

SGF is the interchange format, not the UI architecture.

## SGF support

The parser and serializer support the practical FF[4] subset needed by the product:

- FF;
- GM;
- CA;
- AP;
- SZ;
- KM;
- GN;
- PB;
- PW;
- RE;
- DT;
- RU;
- PL;
- B;
- W;
- AB;
- AW;
- AE;
- C;
- TR;
- SQ;
- CR;
- MA;
- LB.

Also supported:

- passes with empty move values;
- recursive variations;
- SGF collections containing multiple game trees;
- escaped property values;
- escaped composed label values;
- compressed point-list ranges for setup and simple marks.

The exporter writes FF[4], GM[1], UTF-8, and a THIEPN Go application identifier.

## Import

Study accepts SGF through:

- pasted SGF text;
- local .sgf files.

A collection with multiple game trees is imported as multiple local studies.

Malformed input produces an explicit import error rather than silently falling back to a partial game.

## Export

Each study can:

- copy SGF to the clipboard;
- download a .sgf file.

The study title is exported as GN when no explicit imported game name exists.

## P8 game integration

Independent Play records convert directly into Study documents.

The conversion preserves:

- board size;
- komi;
- fixed handicap setup;
- side to play;
- every played move;
- passes;
- capture comments;
- date;
- result.

Results map to SGF conventions:

- B+number / W+number;
- B+R / W+R;
- B+T / W+T;
- 0 for draw.

Saved-game study IDs are stable so reopening the same P8 game updates the same local study rather than creating uncontrolled duplicates.

## Replay

Any node can be selected from the game tree.

The board is reconstructed by replaying the complete path from the root through the real P1 Go engine.

That means replay honors:

- captures;
- suicide rules;
- ko;
- passes;
- setup stones;
- side-to-play setup.

An illegal authored/imported study move fails explicitly instead of producing a fake board.

## Navigation

The workspace provides:

- Start;
- Previous;
- Next along the main continuation;
- direct tree-node selection.

Move labels reuse the same Go coordinate convention as the board renderer.

## Variations

Variation mode lets the learner branch from any selected position.

```
select move 37
→ enter Variation
→ play another legal move
→ new child branch
→ continue reading from there
```

If the exact variation already exists, it is selected instead of duplicated.

Pass variations are supported.

Every new move is replayed through the Go rules engine before becoming part of the usable study tree.

## Comments

Every node has an editable comment field.

Comments are:

- persisted locally;
- exported to C[];
- restored on SGF import.

This supports personal game notes, explanations, questions, and later review annotations.

## Board marks

The workspace supports:

- triangle;
- square;
- circle;
- cross;
- text label.

They map to standard SGF properties:

- TR;
- SQ;
- CR;
- MA;
- LB.

The current board renderer displays these using clear symbol markers.

## Position editor

A study can begin from a custom setup position.

The root editor supports:

- Black setup stones;
- White setup stones;
- erase;
- explicit Black-to-play;
- explicit White-to-play.

This enables:

- life-and-death study positions;
- tactical positions;
- partial-board reconstructions;
- positions copied from books or lectures.

The P9 editor intentionally edits the **starting position**.

It does not silently rewrite historical board states in the middle of an imported game tree. Arbitrary mid-tree setup authoring is better handled by the later P14 content-authoring tooling.

## Study library

The Study hub provides three entry paths:

### New position

Create a blank:

- 9×9;
- 13×13;
- 19×19

study.

### Your games

Open recent P8 games directly as studies.

### Saved studies

Resume locally stored studies with comments and variations intact.

Study is also available directly from Home after beginner onboarding.

Recent-game cards in Play now include:

> Study

for immediate Play → Study handoff.

## Persistence

Up to 50 study documents are retained locally.

The current architecture remains account-free and offline-friendly.

P16 can later synchronize these same documents without changing the tree model.

## Validation

Automated test coverage now includes:

- SGF coordinate conversion;
- pass representation;
- bounds validation;
- metadata parsing;
- setup stones;
- comments;
- escaped closing brackets;
- common marks;
- labels;
- composed label escaping;
- recursive variations;
- SGF collections;
- compressed point-list ranges;
- SGF serialize → parse round-trip;
- custom setup editing;
- mark toggling;
- duplicate variation detection;
- engine-validated variation replay;
- capture replay;
- pass followed by later study continuation;
- P8 handicap conversion;
- P8 pass conversion;
- P8 result conversion.

## P9 boundary

P9 is a study and variation workspace.

It does not yet judge whether a move was good or bad.

That distinction matters.

The workspace can answer:

> What happened?

and:

> What if I play here instead?

It does not yet answer:

> What was my mistake?

That is P10.

P10 will run deterministic beginner/intermediate diagnostics over recorded game positions and map explainable mistakes back to the P7 concept graph.

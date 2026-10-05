# Roadmap

## P0 — Product Constitution, Beginner Contract & Architecture

Status: **complete**

Deliverables:
- product constitution;
- zero-knowledge learner contract;
- first-game journey;
- visual/motion constitution;
- architecture boundaries;
- phased roadmap;
- minimal React/TypeScript/Vite shell;
- initial design-token layer.

Exit criteria:
- new features can be judged against explicit learning principles;
- beginner complexity rules are documented;
- visual motion has semantic rules;
- engine and UI boundaries are explicit.

## P1 — Trusted Go Rules Engine

Status: **complete**

Implemented and tested:
- board model;
- coordinates;
- stone placement;
- groups;
- liberties;
- captures;
- suicide handling;
- ko;
- pass/history;
- game-ending foundation;
- scoring foundation.

Exit criterion:
- rules can be tested without rendering a board.

Validation:
- headless TypeScript engine compiles independently of React;
- smoke validation covers capture, suicide, capture-before-suicide, ko, passes, and area scoring;
- repository tests cover immutable board behavior, groups/liberties, setup positions, multi-stone capture, invalid play, ko, game ending, and scoring.

## V1/P2 — Board Rendering & Interaction Foundation

Status: **complete**

Implemented:
- SVG board;
- responsive geometry;
- stones;
- ghost stones;
- markers;
- highlights;
- touch/pointer/keyboard interaction;
- placement/capture motion;
- sound/haptic hooks;
- reduced motion.

Exit criterion:
- reusable SVG renderer supports responsive standard board sizes, engine-backed interaction, overlays, motion, accessibility, and reduced-motion behavior.

Validation:
- engine-backed 9×9 integration is live in the app shell;
- geometry and transition behavior have unit coverage;
- repository verification workflow runs tests and production build;
- rendering resources are isolated per board instance for multi-board course/review layouts.

## P3 — Educational Interaction Runtime

Status: **complete**

Implemented primitives:
- place a stone;
- select intersections;
- select stones/groups;
- mark liberties;
- identify territory;
- choose an answer;
- predict a move;
- predict a sequence.

Added:
- deterministic lesson reducer;
- reusable LessonPlayer;
- timeline/choreography runtime;
- retry/rewind;
- progressive hint ladder;
- misconception-specific feedback;
- lesson-schema validation;
- semantic engine-aware board effects;
- first data-driven beginner lesson.

Exit criterion:
- curriculum authors can express all core beginner teaching interactions as data without adding bespoke React lesson screens.

## P4 — Zero-to-First-Game Course

Status: **complete**

Implemented beginner curriculum:
- board;
- turns;
- liberties;
- capture;
- groups;
- safety;
- territory;
- basic life;
- passing;
- scoring.

Added:
- 12 interactive lessons across four beginner modules;
- course prerequisite validation;
- sequential CoursePlayer;
- lesson-level local progress;
- real pass teaching;
- engine-verified suicide and ko demonstrations;
- 9×9 readiness checkpoint.

Exit criterion:
- implementation now covers every rule concept needed before a guided 9×9 game.

Certification note:
- actual novice comprehension remains a user-testing requirement; M2/M3 are not marked certified by code alone.

## P5 — Guided 9×9 Game Engine

Status: **implementation complete — novice certification pending**

Implemented:
- complete authored 9×9 teaching game from an empty board;
- real engine legality for learner and opponent moves;
- learner/opponent move choreography;
- teaching interruptions;
- contextual atari/capture signals;
- “What matters?”;
- “Show me”;
- “Why?”;
- “Show the sequence”;
- guided/assisted/optional/independent assistance profiles;
- constrained teaching moves that distinguish “off-plan” from “illegal”;
- real pass/pass game ending;
- engine-backed final area score;
- course-to-first-game handoff.

Automated validation:
- authored path legality;
- opponent reply legality;
- intended capture;
- two-pass completion;
- exact final score;
- tactical signal detection;
- assistance-fade behavior.

Exit criterion:
- implementation now provides the full path for a zero-knowledge learner to finish a 9×9 game.

Certification note:
- M3 remains empirically pending until a genuine first-time Go learner completes the path without outside coaching and demonstrates understanding of capture, ending, and scoring.

## P6 — Practice / Tsumego System

Status: **complete**

Implemented:
- declarative problem definitions;
- engine-backed problem trees;
- alternate correct variations;
- authored opponent replies;
- multi-step reading positions;
- misconception-specific feedback;
- progressive hints;
- retries with evidence preservation;
- tags;
- difficulty levels;
- local attempt history;
- mixed and focused practice modes;
- deterministic adaptive queues;
- immediate one-time remediation repeats;
- eight-problem beginner pack;
- practice unlock after the first guided game.

Validation:
- every starter solution variation and opponent reply is replayed through the Go engine;
- queue/history behavior has automated coverage;
- legal-but-wrong moves are distinguished from illegal moves.

## P7 — Mastery & Knowledge Graph

Status: **implementation complete — empirical diagnosis validation pending**

Implemented:
- explicit beginner concept graph and prerequisite edges;
- canonical concept aliases across lessons and practice content;
- normalized lesson/practice/guided-game evidence;
- concept exposure;
- weighted accuracy;
- first-attempt accuracy;
- hint dependence;
- recency;
- retention decay;
- confidence;
- response-time tracking without speed scoring;
- guided-game mistake evidence;
- prerequisite-adjusted mastery;
- review-due detection;
- prerequisite-aware weakness diagnosis;
- direct focused-practice remediation;
- learner-facing Progress / knowledge-graph view;
- migration of existing P6 practice history.

Validation:
- retention decays with time;
- prerequisite evidence raises downstream confidence;
- careful slow solving is not penalized;
- synthetic weak-foundation histories select the prerequisite ahead of the downstream symptom;
- no weakness is invented when evidence is absent.

Certification note:
- M4 has an implementation path and controlled-model validation, but real learner diagnosis remains an empirical product test, especially once game-review evidence arrives in P10.

## P8 — Independent Play

Status: **complete**

Implemented:
- unrestricted legal 9×9, 13×13, and 19×19 play;
- computer and local modes;
- deterministic beginner-oriented 25k / 20k / 15k bot profiles;
- immediate capture and atari-escape bot priorities;
- human color selection;
- fixed 2–9 stone handicap;
- handicap komi handling;
- optional assisted / hints-only / off coaching;
- untimed / 10-minute / 20-minute absolute clocks;
- pass;
- resignation;
- timeout;
- two-pass scoring transition;
- dead connected-group confirmation;
- live score preview;
- resume play when life/death is disputed;
- final area scoring;
- local game records and recent-results view;
- responsive phone/tablet/desktop game layout.

Validation:
- standard board-size creation;
- handicap layout and turn order;
- game lifecycle;
- scoring confirmation;
- dispute/resume flow;
- resignation and timeout;
- bot determinism and legality;
- basic tactical bot behavior;
- record creation;
- clocks.

Boundary:
- bot rank labels are intended difficulty framing, not empirical rank certification;
- online multiplayer remains deferred;
- advanced tournament clocks remain deferred;
- strong AI analysis belongs to P11.

## P9 — SGF Study Workspace

Status: **next**

Add:
- SGF import/export;
- game tree;
- variations;
- comments;
- board editor;
- replay;
- study positions.

## P10 — Deterministic Game Review

Detect explainable beginner/intermediate issues:
- missed captures;
- self-atari;
- unanswered atari;
- obvious cuts;
- failed connections;
- simple dead-group mistakes.

Map errors back to concepts.

## P11 — KataGo Analysis Adapter

Add:
- candidate moves;
- principal variations;
- score;
- ownership;
- policy;
- human-policy inputs where useful.

Do not expose raw analysis directly to beginners.

## P12 — Personalized Coach

Close the loop:

```
game mistake
→ concept diagnosis
→ targeted micro-practice
→ next game
→ compare behavior
```

## P13 — Developing-Player Curriculum

Expand into:
- reading;
- ladders;
- nets;
- snapback;
- capturing races;
- life/death;
- shape;
- cutting/connection;
- influence;
- attack/defense;
- invasions/reductions;
- endgame;
- opening principles;
- introductory joseki.

## P14 — Content Authoring Studio

Build internal tooling for:
- board setup;
- lesson steps;
- problem trees;
- explanations;
- hint ladders;
- misconception branches;
- animation timelines;
- validation.

## P15 — Production Hardening

Audit:
- mobile;
- PWA/offline;
- accessibility;
- performance;
- persistence;
- browser compatibility;
- corrupted-state recovery;
- touch precision;
- reduced motion;
- sound/haptic settings.

## P16 — Account/Ecosystem Integration

Only after anonymous learning is excellent:
- account sync;
- cross-device progress;
- backup/export;
- shared ecosystem identity where appropriate.

## Visual track

Visual development runs in parallel rather than being postponed:

- **V0** visual constitution — complete
- **V1** tokens and material language — complete foundation
- **V2** board renderer — complete foundation
- **V3** stone physics / sound / haptics — placement/capture/haptic hooks started; recorded sound layer next
- **V4** educational motion primitives — semantic foundation started
- **V5** lesson choreography — runtime foundation complete
- **V6** learning home / map — mastery/progress foundation started
- **V7** practice / milestone visuals — practice foundation complete
- **V8** play / scoring visuals — independent play and scoring foundation complete
- **V9** review / variation visuals
- **V10** engine-analysis visualization
- **V11** responsive / accessibility variants
- **V12** visual performance and QA

## Certification milestones

**M1** — engine plays legal Go correctly.  
**M2** — complete beginner understands capturing.  
**M3** — complete beginner finishes and understands a 9×9 game.  
**M4** — app identifies the learner’s actual conceptual weakness.  
**M5** — targeted practice measurably improves the next game.

M5 is the core product outcome.

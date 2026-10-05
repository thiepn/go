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

Status: **next**

Build the minimum complete beginner curriculum:
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

Exit criterion:
- a zero-knowledge learner is ready to start a guided 9×9 game.

## P5 — Guided 9×9 Game Engine

Build:
- teaching interruptions;
- contextual explanations;
- “What matters?”;
- “Show me”;
- “Why?”;
- “Show the sequence”;
- assistance-fade model.

Exit criterion:
- zero-knowledge test users complete and understand a full 9×9 game.

## P6 — Practice / Tsumego System

Build:
- problem trees;
- alternate correct lines;
- misconception feedback;
- hints;
- retries;
- tags;
- difficulty;
- practice queues.

## P7 — Mastery & Knowledge Graph

Track:
- concept exposure;
- accuracy;
- first-attempt accuracy;
- hint usage;
- recency;
- retention;
- response behavior;
- game-derived mistakes.

Build prerequisite-aware remediation.

## P8 — Independent Play

Add:
- 9×9;
- 13×13;
- 19×19;
- local play;
- computer opponent;
- handicap;
- useful clock/scoring controls.

Online multiplayer remains deferred.

## P9 — SGF Study Workspace

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
- **V6** learning home / map
- **V7** practice / milestone visuals
- **V8** play / scoring visuals
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

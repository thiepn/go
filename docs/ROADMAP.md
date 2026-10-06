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

Status: **complete**

Implemented:
- internal recursive study-tree model;
- SGF FF[4] import;
- SGF export and .sgf download;
- pasted-text and local-file import;
- multi-game SGF collections;
- board size / komi / player / result metadata;
- moves and passes;
- setup stones and player-to-move;
- comments;
- triangle / square / circle / cross / label annotations;
- compressed point-list import;
- escaped SGF values and composed labels;
- engine-backed arbitrary-node replay;
- previous / next / start navigation;
- visual recursive variation tree;
- legal variation creation from any position;
- duplicate-variation reuse;
- pass variations;
- custom root-position editor;
- 9×9 / 13×13 / 19×19 blank studies;
- local study persistence;
- P8 saved-game conversion;
- direct Play → Study handoff;
- recent-game Study action;
- board-first responsive workspace.

Validation:
- SGF coordinates, metadata, setup, marks, comments, passes and branches;
- SGF collection parsing;
- compressed point ranges;
- serialize / parse round-trips;
- engine-backed captures and variation replay;
- setup editing and annotation toggles;
- P8 handicap, move, pass and result conversion.

Boundary:
- P9 explains and explores positions but does not grade move quality;
- deterministic mistake detection begins in P10.

## P10 — Deterministic Game Review

Status: **complete**

Implemented:
- exact P8 move-by-move game reconstruction;
- human-only analysis for computer games;
- both-side analysis for local games;
- missed immediate capture opportunities;
- unanswered / left-in-atari warnings;
- high-confidence ignored-atari detection when the group is captured immediately;
- self-atari detection;
- high-confidence punished self-atari detection;
- direct-cut / missed-connection-point warnings;
- pass-while-in-atari end-state warnings;
- legal rescue-move generation;
- severity and confidence model;
- P7 concept mapping;
- strict mastery eligibility for high-confidence punished mistakes only;
- idempotent review-derived mastery evidence;
- Before / After board comparison;
- deterministic alternative highlights;
- engine-backed “Try another move” interaction;
- direct Review → Practice remediation;
- direct Review → Study exploration;
- recent-game Review action in Play;
- first-class Review destination on Home;
- responsive review timeline / finding UI.

Validation:
- review frame reconstruction;
- capture opportunity detection;
- atari and legal rescue signals;
- punished ignored-atari classification;
- punished self-atari classification;
- direct connection-point detection;
- pass-in-atari warnings;
- learner-color filtering in computer games;
- idempotent mastery integration;
- medium-confidence findings excluded from negative mastery evidence.

Boundary:
- general dead-group classification is deliberately not claimed;
- strategic move grading, point loss, ownership and best-move analysis begin with P11.

## P11 — KataGo Analysis Adapter

Status: **implementation complete — runtime/model deployment required for live engine results**

Implemented:
- typed KataGo parallel-analysis JSON boundary;
- standard Go / GTP coordinate conversion;
- P8 saved-game → KataGo query conversion;
- handicap / player-to-move / effective-komi preservation;
- multi-turn analyzeTurns support;
- batched whole-game learner-turn scans;
- widened root candidate discovery for review;
- forced exact played-move analysis when normal moveInfos omit the move;
- candidate moves;
- visits;
- score lead;
- winrate;
- utility;
- principal variations;
- ownership;
- raw search policy;
- optional Human SL policy / humanPrior;
- optional Human SL rank profiles;
- local analysis caching;
- external long-running Node/KataGo bridge;
- same-origin web/Vercel proxy;
- bridge health endpoint;
- public-query workload caps and override allowlist;
- beginner-first score-loss translation;
- candidate markers and ownership on the shared SVG board;
- Engine Check inside deterministic Review;
- arbitrary learner-move Engine Check when P10 finds no deterministic issue;
- graceful deterministic-review fallback when KataGo is unavailable.

Validation:
- GTP coordinates;
- handicap and pass query construction;
- analyze-turn indexing;
- Human SL override construction;
- response normalization;
- PV normalization;
- ownership/policy alignment;
- forced played-move recovery;
- score-loss comparison;
- whole-game batching;
- human-turn filtering;
- provider failure behavior;
- health probing;
- beginner translation.

Operational boundary:
- a live KataGo installation and neural-network model are not stored in the repository and still need to be deployed on an analysis host;
- Chinese rules are used as the engine-analysis approximation for the app's area-scoring games, so rare rules edge cases are not treated as P1 legality overrides;
- engine point loss does not automatically become P7 mastery evidence;
- personalized interpretation of recurring engine patterns belongs to P12.

## P12 — Personalized Coach

Status: **implementation complete — empirical transfer certification pending**

Implemented:
- persistent coaching-cycle model;
- evidence-strength confidence labels;
- recent-game deterministic signal aggregation;
- recurrence-aware concept ranking;
- P7 mastery integration;
- prerequisite-aware root-cause diagnosis;
- refusal to invent a focus when evidence is absent;
- one primary focus per cycle;
- concept-specific next-game objectives;
- five-problem focused Practice handoff;
- practice-completion tracking;
- coached-game objective in Play setup and live game;
- Coach → Practice → Coach routing;
- Coach → Play → Coach routing;
- Coach → Review → Coach routing;
- deterministic turning-point ranking;
- maximum four turning points;
- maximum two turning points per source game;
- optional batched P11 KataGo enrichment;
- deterministic + engine turning-point merging;
- engine-only moments kept concept-neutral;
- frozen pre-intervention baseline;
- normalized weighted finding signal per 20 learner moves;
- short/abandoned follow-up filtering;
- latest full follow-up evaluation;
- improved / stable / worse outcome states;
- mastery change shown separately from game transfer;
- local active-plan and plan-history persistence;
- archive-and-build-next-plan workflow;
- first-class Coach destination on Home.

Validation:
- repeated game symptoms;
- supported prerequisite root causes;
- no unsupported/engine-only diagnosis;
- deterministic + KataGo moment merging;
- normalized behavior comparison;
- improvement detection;
- short-game skipping;
- practice completion persistence;
- plan persistence.

Certification note:
- the complete M5 measurement path now exists;
- real learner transfer remains an empirical requirement and is not certified by implementation alone.

## P13 — Developing-Player Curriculum

Status: **complete**

Implemented:
- separate post-beginner course while preserving the beginner path;
- tactical reading and forcing sequences;
- true engine-backed ladders;
- true two-route nets;
- snapback capture/recapture;
- equal-liberty capturing races;
- false eyes, vital points, and seki;
- shape, cutting/connection, weak groups, and attack/defense;
- influence, invasion, reduction, sente/gote, and endgame;
- opening principles and introductory joseki;
- expanded mastery graph and coach objectives;
- developing-player focused practice modes;
- practice unlock only after concept exposure;
- combined adaptive practice corpus.

Validation:
- developing curriculum structure;
- expanded knowledge graph;
- every authored developing problem replayed through the Go engine;
- corrected ladder, net, snapback, semeai, and seki examples after replay verification.

## P14 — Content Authoring Studio

Status: **implementation complete**

Implemented:
- hidden internal authoring workspace via `?studio=1`;
- visual board setup editor using the production SVG board and coordinate model;
- lesson/problem mode switching with separate local drafts;
- known-valid starter templates;
- lesson metadata and step builder;
- step add, duplicate, reorder, remove, and interaction conversion;
- progressive hint-ladder editing;
- misconception-specific point feedback editing;
- choreography cue timing editor;
- problem metadata and root solution-branch editor;
- canonical JSON source editor for the complete schema;
- JSON import, formatting, copy, export, and local autosave;
- production-validator issue reporting;
- preview gating until content is valid;
- real `LessonPlayer` / `ProblemPlayer` runtime preview;
- focused model tests for templates, board editing, summaries, and parse failures;
- authoring workflow/boundary documentation.

Boundary:
- the studio intentionally does not publish directly to GitHub or introduce a second content format;
- advanced nested branches and presentation-effect payloads remain available in canonical JSON;
- repository review and engine replay tests remain required before authored content becomes shipped curriculum.

## P15 — Production Hardening

Status: **implementation complete — real-device/browser certification pending**

Implemented:
- installable PWA manifest;
- SVG and raster install icons;
- production-only service-worker registration;
- app-shell/runtime caching and offline navigation fallback;
- explicit exclusion of KataGo API traffic from offline caching;
- centralized resilient JSON persistence;
- quarantine and bounded recovery snapshots for corrupt local data;
- hardened course, practice, mastery, game, coach, study, analysis-cache, and
  preference persistence;
- learner controls for haptics, sound, and additional reduced motion;
- OS reduced-motion support retained;
- generated optional Web Audio feedback with capability guards;
- generalized keyboard focus visibility;
- coarse-pointer minimum control sizing and enlarged board targets;
- dynamic viewport and mobile text-size hardening;
- browser capability fallbacks for service workers, vibration, audio, and
  local storage;
- lazy-loaded internal Content Authoring Studio;
- automated PWA/platform CI verification.

Validation:
- full repository test suite;
- production TypeScript/Vite build;
- KataGo server/proxy syntax checks;
- manifest/install-asset/service-worker platform checks.

Certification note:
- physical Android/iOS and cross-browser install, offline, touch, safe-area,
  and standalone-mode qualification remains a manual empirical requirement;
- no live Vercel project was available through the connected account during
  this phase, so deployed real-device certification is not claimed.

## P16 — Account/Ecosystem Integration

Status: **implementation complete — deployed auth/sync smoke pending**

Implemented:
- canonical THIEPN Account SDK 1.x consumer integration;
- app registration as `go` at `/go/`;
- anonymous/local-first mode remains fully functional;
- unsupported origins remain local-only instead of creating another auth authority;
- shared account identity with local-scope sign-out;
- automatic cross-device synchronization for durable Go learning data;
- deterministic monotonic merge rules that do not roll progress backward;
- optimistic-concurrency cloud writes with conflict pull/merge/retry;
- portable JSON backup export/import;
- Go-only cloud data deletion without deleting local data or the account;
- central account consumer manifest and pinned conformance workflow;
- isolated `public.go_user_state` backend with owner-only RLS;
- explicit authenticated Data API grants and no anonymous table access;
- SECURITY INVOKER sync RPC with anonymous execution revoked;
- Supabase advisor verification with no findings on the new Go objects.

Validation:
- central THIEPN Account consumer contract passes;
- full Go test suite passes;
- production TypeScript/Vite build passes;
- server/platform checks pass;
- backend registry, RLS, grants, and RPC privileges verified;
- Supabase migration `20261006123802_go_p16_account_sync` applied.

Remaining empirical gate:
- deploy at the canonical `https://thiepn.dev/go/` path and smoke-test real
  email/password, Google OAuth, password recovery, two-device sync, offline
  degradation, backup restore, local sign-out, and Go-only cloud deletion.

Core P0–P16 product phases are now implemented. Continue with the remaining
visual/certification track rather than inventing a parallel account system.

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
- **V9** review / variation visuals — deterministic review and SGF variation foundation complete
- **V10** engine-analysis visualization — candidate, ownership, beginner translation and coach turning-point surfacing complete
- **V11** responsive / accessibility variants — complete implementation
- **V12** visual performance and QA — automated implementation complete; physical-device/screen-reader certification pending

V12 closes the automated visual track. Physical-device, assistive-technology,
canonical-deployment, and learner-outcome certification remain empirical gates.

## Certification milestones

**M1** — engine plays legal Go correctly.  
**M2** — complete beginner understands capturing.  
**M3** — complete beginner finishes and understands a 9×9 game.  
**M4** — app identifies the learner’s actual conceptual weakness.  
**M5** — targeted practice measurably improves the next game.

M5 is the core product outcome.

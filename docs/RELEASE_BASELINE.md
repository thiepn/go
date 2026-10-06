# C0 — Release Baseline & Freeze

C0 converts the completed implementation into a finite v1.0 certification
program.

The initial candidate is **1.0.0-rc.1**.

## What is frozen

At C0 merge:

- product scope is frozen;
- P0–P16 implementation is closed;
- V0–V12 automated visual implementation is closed;
- the supported platform matrix is frozen;
- the test-profile vocabulary is frozen;
- release-blocker severity and evidence rules are frozen;
- dependency resolution is locked;
- the candidate can be identified by version and source commit.

The **C0 merge commit on `main`** is the immutable source baseline for
`1.0.0-rc.1`.

## Candidate invalidation

Certification evidence belongs to a specific release candidate.

Any change after C0 to:

- application source;
- shipped curriculum/content;
- dependencies or lockfile;
- database schema;
- service-worker/PWA behavior;
- authentication/sync behavior;
- build/deployment behavior;

creates a new `1.0.0-rc.N` candidate.

The change does not require every completed certification phase to be repeated.
It does require rerunning every automated gate and every empirical certification
whose behavior could reasonably be affected by the change.

Documentation-only evidence updates do not create a new candidate when they do
not alter product behavior.

## Freeze policy

Allowed during certification:

- correctness fixes;
- security/privacy fixes;
- accessibility fixes;
- data-loss/recovery fixes;
- deployment and canonical-path fixes;
- compatibility fixes;
- performance fixes required to meet frozen budgets;
- test/QA infrastructure;
- content corrections proven necessary by learner testing;
- operational KataGo/account configuration necessary to certify already-built
  functionality.

Not allowed without explicitly reopening product scope:

- online multiplayer;
- social systems;
- rankings;
- new game modes;
- another UI redesign;
- a new AI/LLM layer;
- broad new curriculum unrelated to a certification defect;
- new account authority;
- new persistence model;
- speculative features.

If a certification result proves that a larger product change is genuinely
required, the release freeze is intentionally broken, the reason is recorded,
and a new implementation phase is created rather than hiding feature work
inside certification.

## Reproducibility

C0 requires:

- Node 22;
- `package-lock.json`;
- `npm ci` in release CI;
- `package.json` version matching the release-candidate contract;
- production build metadata in `dist/release.json`;
- existing bundle, platform, accessibility, browser, and account gates.

The release metadata includes the build's source commit when the environment
provides `GITHUB_SHA` or `VERCEL_GIT_COMMIT_SHA`.

## Severity

**C0 / catastrophic**
- security/privacy compromise;
- data loss or cross-user data exposure;
- rules engine producing illegal Go;
- account identity/session boundary violation.

**C1 / release blocker**
- core Learn → Practice → Play → Review path cannot complete;
- canonical deployment, offline PWA, sync, or supported-device failure;
- core keyboard/screen-reader journey is unusable;
- reproducible crash or irreversible state corruption.

**C2 / major but potentially shippable with explicit acceptance**
- important secondary workflow has a reliable workaround;
- visual/layout defect materially harms a supported scenario but does not block
  core completion.

**C3 / minor**
- cosmetic or low-frequency friction with no correctness, accessibility,
  security, or data-integrity impact.

No C0/C1 issue may be accepted into v1.0.

## Evidence rule

A checkbox in a document is not certification evidence.

Evidence must identify:

1. release candidate;
2. test/profile used;
3. environment/device;
4. steps or automated workflow;
5. observed result;
6. defect references if any;
7. pass/fail decision.

Automated GitHub workflow runs count as evidence for the scope they actually
exercise. They do not substitute for physical-device, assistive-technology, or
learner-outcome testing.

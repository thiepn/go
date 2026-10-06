# Changelog

## 1.0.0-rc.2 — C1 canonical deployment candidate

Supersedes rc.1 after C1 found that the frozen app was still built and registered
as a root-scoped PWA even though its canonical product URL is
`https://thiepn.dev/go/`.

Changes:
- build base fixed to `/go/`;
- manifest start URL, scope, and icons fixed to `/go/`;
- service worker registered at and limited to `/go/`;
- generated lazy assets precached with `/go/` URLs;
- offline navigation fallback moved from root to `/go/`;
- local browser QA now runs from the same subpath contract;
- production Pages artifact verifies canonical PWA paths;
- post-deploy browser QA certifies the live canonical URL, exact source SHA,
  service-worker scope, refresh behavior, and offline lazy lesson loading.

## 1.0.0-rc.1 — C0 baseline

First frozen release candidate after completion of:

- product phases P0–P16;
- automated visual track V0–V12;
- Go rules engine and interactive beginner/developing curricula;
- guided and independent play;
- practice, mastery, Review, Study, Coach, and optional KataGo integration;
- offline PWA and resilient local persistence;
- optional THIEPN Account cross-device sync;
- responsive/accessibility variants;
- cross-browser automated QA and production bundle budgets.

This candidate begins empirical certification C1–C12. It is not yet the v1.0
release.

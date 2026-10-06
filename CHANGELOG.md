# Changelog

## 1.0.0-rc.6 — C5 accessibility candidate

Supersedes rc.5 after C5 identified WCAG AA contrast regressions on some card
and dark-theme text surfaces and an incomplete Windows forced-colors rendering
contract for the SVG Go board.

Changes:
- raises secondary, accent, and error text tokens to an AA contrast floor on
  light and dark paper surfaces;
- preserves a 3:1 focus-indicator contrast floor;
- renders the Go board explicitly with system colors in forced-colors mode;
- removes board gradients/shadows where they would undermine forced colors;
- exposes an assistive-technology role description for the interactive board;
- adds three-engine 320 CSS px reflow qualification;
- adds keyboard-only lesson and independent-play journeys;
- adds reduced-motion and forced-colors runtime checks;
- adds a static contrast regression gate;
- freezes VoiceOver, TalkBack, Windows High Contrast, browser-zoom,
  reduced-motion, and larger-text empirical evidence requirements.

## 1.0.0-rc.5 — C4 physical mobile & PWA candidate

Supersedes rc.4 after C4 identified incomplete safe-area containment while
`viewport-fit=cover` was enabled.

Changes:
- protects all four mobile safe-area edges, including top cutouts and the
  bottom home-indicator region;
- bounds the top-level app height to the usable safe viewport;
- detects browser, standalone, minimal-ui, fullscreen, and iOS standalone
  launch modes;
- surfaces browser-versus-installed launch mode in Device & accessibility;
- adds production-mode Android-phone, iPhone-WebKit, and iPad-WebKit
  qualification;
- verifies portrait/landscape reflow, offline controlled reload, local progress
  persistence, 9×9/13×13/19×19 touch placement, and responsive Precision Zoom;
- keeps true offline cold launch as a physical-device evidence gate;
- adds a real-hardware evidence checklist. Emulation is never accepted as a
  substitute for physical-device certification.

## 1.0.0-rc.4 — C3 account certification candidate

Supersedes rc.3 after C3 found that Go could initiate password recovery but did
not expose the recovery-session password update required to complete the flow.

Changes:
- subscribes to THIEPN Account auth state before resolving the initial session;
- recognizes the canonical `PASSWORD_RECOVERY` event;
- opens the account workspace automatically for recovery sessions;
- adds a confirmable new-password form using the central SDK `updatePassword`;
- adds non-destructive live production account smoke tests;
- adds a dedicated destructive two-device credentialed certification workflow;
- verifies first-sign-in merge, two-device convergence, offline local work,
  reconnect sync, local-scope sign-out, backup/restore, and Go-only cloud delete
  without turning a network failure into logout.

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

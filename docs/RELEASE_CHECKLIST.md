# v1.0 Release Checklist

Candidate: **1.0.0-rc.3**

This checklist is the release control surface. Individual phase documents hold
the detailed evidence.

## C0 — Baseline

- [x] Feature scope frozen.
- [x] Candidate version defined.
- [x] Supported platform matrix defined.
- [x] Certification test profiles defined.
- [x] Known limitations separated from blockers.
- [x] Release severity policy defined.
- [x] Build/source identification defined.
- [x] Dependency lockfile generated and aligned with the candidate.
- [x] Final C0 workflows green on one head.
- [x] C0 merged; rc.1 baseline recorded as `198febb30e0ee2f5447c64e9afbd68c05af1f10a`.

## C1 — Canonical deployment

- [x] `https://thiepn.dev/go/` serves the candidate.
- [x] No asset/root-path leakage.
- [x] Refresh and navigation work at canonical path.
- [x] Manifest/start URL/scope are correct.
- [x] Service-worker install/update/offline behavior passes.

## C2 — KataGo production runtime

- [ ] Production analysis host healthy.
- [ ] 9×9 analysis passes.
- [ ] 13×13 analysis passes.
- [ ] 19×19 analysis passes.
- [ ] Timeout/failure fallback preserves deterministic Review.
- [ ] Workload limits verified.

## C3 — THIEPN Account production smoke

- [ ] Email/password sign-in.
- [ ] Google OAuth.
- [ ] Password recovery.
- [ ] First sign-in local→cloud merge.
- [ ] Two-device sync.
- [ ] Concurrent conflict merge.
- [ ] Offline edit → online resync.
- [ ] Local-scope sign-out.
- [ ] Backup export/import.
- [ ] Go-only cloud deletion.

## C4 — Physical device / PWA

- [ ] Android Chrome physical device.
- [ ] Installed Android PWA.
- [ ] iPhone Safari physical device.
- [ ] iPhone Add to Home Screen.
- [ ] iPad/tablet qualification.
- [ ] Portrait/landscape/safe-area.
- [ ] 9×9/13×13/19×19 touch and Precision Zoom.
- [ ] Offline cold start and update.

## C5 — Accessibility

- [ ] Keyboard-only core journey.
- [ ] VoiceOver.
- [ ] TalkBack.
- [ ] Windows High Contrast / forced-colors.
- [ ] 200–400% zoom.
- [ ] 320 CSS px reflow.
- [ ] Reduced motion.
- [ ] Larger text / higher contrast.

## C6 — M1 rules integrity

- [ ] Expanded adversarial rule corpus.
- [ ] Randomized/property-style legal game validation.
- [ ] Scoring/pass/ko/suicide/capture edge cases.
- [ ] SGF replay equivalence.
- [ ] M1 certified.

## C7–C8 — M2/M3 novice learning

- [ ] Genuine zero-knowledge learners recruited.
- [ ] First course observed without outside coaching.
- [ ] Capture understanding measured.
- [ ] First guided 9×9 completion measured.
- [ ] Ending/scoring understanding measured.
- [ ] Pedagogy defects repaired.
- [ ] Affected novice tests rerun.
- [ ] M2 certified.
- [ ] M3 certified.

## C9 — M4 diagnosis

- [ ] Natural learner histories tested.
- [ ] Root-cause vs symptom cases tested.
- [ ] Coach diagnosis compared with human evidence review.
- [ ] Insufficient-evidence behavior verified.
- [ ] M4 certified.

## C10 — M5 transfer

- [ ] Baseline game.
- [ ] Diagnosis.
- [ ] Targeted practice.
- [ ] Coached follow-up game.
- [ ] Same-signal outcome comparison.
- [ ] Repeat across enough learner/concept cases.
- [ ] M5 certified.

## C11 — Long-session/failure hardening

- [ ] Large saved-game history.
- [ ] Large/branched SGF.
- [ ] Repeated engine analysis.
- [ ] Offline/online flapping.
- [ ] Service-worker upgrade.
- [ ] Storage pressure/corruption recovery.
- [ ] Account conflict stress.
- [ ] Long-session memory/runtime behavior.

## C12 — Release candidate acceptance

- [ ] Fresh learner end-to-end.
- [ ] Returning learner end-to-end.
- [ ] Developing curriculum.
- [ ] Practice.
- [ ] Play.
- [ ] Review.
- [ ] Study.
- [ ] Coach.
- [ ] Account sync.
- [ ] KataGo.
- [ ] Offline/PWA.
- [ ] Accessibility.
- [ ] No open C0/C1 defects.

## C13 — v1.0

- [ ] Version changed from prerelease to `1.0.0`.
- [ ] Final release notes.
- [ ] Production deployment.
- [ ] Rollback runbook verified.
- [ ] v1.0 source ref recorded.
- [ ] Maintenance policy active.

## C14–C15

- [ ] Real-use observation period completed.
- [ ] Defect-only follow-up completed.
- [ ] Maintenance mode entered.

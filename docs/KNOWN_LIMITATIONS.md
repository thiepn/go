# Known Limitations — v1 Release Candidate

This document distinguishes **intentional product boundaries** from
**uncertified release behavior**. An uncertified behavior is not automatically
an accepted limitation.

## Intentional v1 boundaries

These do not block v1.0 unless testing shows they prevent the product promise.

- No online multiplayer.
- No social graph, public profiles, rankings, or matchmaking.
- Bot labels such as 25k / 20k / 15k are difficulty framing, not empirically
  certified Go ranks.
- No tournament-clock suite beyond the implemented simple clock options.
- Deterministic Review intentionally avoids claiming general strategic grading
  or general dead-group classification.
- KataGo is optional enhancement; core learning and deterministic Review must
  remain usable when it is unavailable.
- KataGo uses Chinese-rules analysis as an approximation for the app's
  area-scoring games; engine output is not a P1 legality override.
- Content Authoring Studio is an internal tool and does not publish directly to
  GitHub.
- Accounts are optional; there is no account wall before learning.
- Device-specific sound, haptic, contrast, text-size, motion, and coordinate
  preferences are intentionally not cross-device synced.

## Pending certification — not yet accepted as limitations

These must be resolved or explicitly certified before v1.0:

- production KataGo/model runtime;
- production email/password, Google OAuth, recovery, and sync lifecycle;
- physical Android/iOS/iPad PWA behavior;
- VoiceOver and TalkBack;
- real Windows High Contrast;
- long-session/storage/network failure behavior;
- M2 novice capture comprehension;
- M3 novice first-game comprehension;
- M4 real learner diagnosis accuracy;
- M5 measurable transfer after targeted practice.

## Release-blocker policy

A reproducible C0/C1 defect is not converted into a “known limitation” merely
to ship. It must be fixed, or the release scope must be explicitly changed and
recertified.

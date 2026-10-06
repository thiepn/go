# Production Hardening

P15 hardens the Go app for real-world use without changing the Go rules engine,
curriculum semantics, or the learning loop.

## Release state

Implementation status: **complete**.

Automated repository verification covers:
- the full Vitest suite;
- the production TypeScript/Vite build;
- KataGo bridge/proxy syntax checks;
- PWA manifest, install assets, viewport metadata, and service-worker invariants.

Real-device and cross-browser certification remains empirical. A physical-device
pass should still be performed on representative Android/Chrome and
iOS/Safari devices before describing the product as fully device-certified.

## Offline and PWA

The app now includes:
- an installable web app manifest;
- SVG plus 192×192 and 512×512 install icons;
- mobile and Apple web-app metadata;
- a production-only service-worker registration boundary;
- an offline navigation fallback;
- app-shell and runtime asset caching;
- first-install discovery of the production entry assets referenced by the
  built HTML;
- stale cache cleanup on service-worker activation.

The service worker deliberately excludes `/api/` requests. KataGo analysis is
network/server functionality and must never be mistaken for reliable offline
content.

Core lessons, practice, local play, saved studies, progress, and locally stored
coaching data remain local-first. Engine analysis may require connectivity.

## Persistence and corrupted-state recovery

Persistent JSON now goes through one resilient platform boundary instead of
each feature independently parsing raw `localStorage`.

Covered stores:
- course progress;
- practice history;
- mastery evidence;
- saved games;
- coach plans;
- studies;
- KataGo analysis cache;
- app preferences.

On invalid JSON or a structurally invalid persisted value:
1. the app falls back to a safe empty/default value;
2. the damaged raw value is quarantined under a recovery key when the storage
   implementation supports it;
3. the broken source value is removed when possible;
4. only a bounded number of recovery snapshots are retained.

Storage access is capability-guarded so private browsing, storage restrictions,
test doubles, or browser implementation differences do not block learning.

## Accessibility and input hardening

The existing board keyboard interaction remains the primary non-pointer board
control:
- arrow keys move focus;
- Enter/Space activates the focused intersection;
- visible focus is preserved.

P15 additionally provides:
- consistent `:focus-visible` treatment for controls and focusable elements;
- coarse-pointer minimum control sizing;
- enlarged coarse-pointer board target geometry;
- disabled mobile callout/tap artifacts on the board;
- forced-colors fallbacks for conventional controls;
- dynamic viewport-height support;
- browser text-size-adjust protection;
- responsive settings UI.

The SVG board intentionally keeps its authored visual colors under forced-color
mode because stone color and board markings carry game meaning.

## Motion, sound, and haptics

The OS-level `prefers-reduced-motion` behavior remains authoritative.

The app also exposes a persisted learner preference to reduce motion even when
the operating system has not requested it. That preference collapses
transitions and animations globally.

Haptics:
- remain enabled by default where supported;
- are capability-guarded;
- can be disabled by the learner.

Sound:
- is disabled by default;
- can be enabled by the learner;
- uses short generated Web Audio tones rather than bundled media;
- fails silently on browsers that block or do not expose Web Audio.

Neither sound nor haptics affects rules, scoring, correctness, or progression.

## Performance

P15 removes the internal Content Authoring Studio from the default synchronous
application path. The studio is dynamically imported only when `?studio=1`
is requested.

This keeps an internal production tool out of the initial learner bundle while
preserving the same authoring functionality.

The service worker uses bounded named caches and does not intercept external or
API traffic.

## Browser compatibility strategy

Platform-only APIs are treated as optional capabilities:
- service workers;
- vibration;
- Web Audio;
- local storage.

The learner-facing application remains functional when those APIs are missing
or unavailable.

The production build remains the compatibility gate for the current TypeScript
and Vite target. Browser/device behavior beyond that requires a deployed
real-device qualification pass.

## Settings

A learner-facing **Device & accessibility** settings screen exposes:
- haptics;
- sound;
- additional reduced motion;
- online/offline state;
- offline-app registration state;
- detected quarantined local records.

This is intentionally a small platform settings surface, not another product
dashboard.

## CI guard

`npm run check:platform` verifies:
- required PWA files exist;
- the manifest is parseable;
- required install-icon sizes are declared;
- standalone start behavior is preserved;
- mobile viewport metadata is preserved;
- the service worker continues to exclude API requests.

GitHub Actions runs this after tests, build, and server checks.

## Remaining empirical certification

Before a final public/stable release, manually verify at minimum:
- Android Chrome: install, standalone launch, touch placement, settings,
  haptics, offline reload;
- iOS Safari: Add to Home Screen, standalone launch, viewport/safe-area
  behavior, touch placement, reduced motion;
- desktop Chrome/Edge/Firefox/Safari: keyboard board interaction, focus
  visibility, resize behavior, local persistence;
- offline transitions after the first online visit;
- corrupted-storage recovery with representative old/broken values;
- 9×9, 13×13, and 19×19 board usability at small phone widths.

No live Vercel project was available through the connected Vercel account
during P15, so this manual deployed-browser certification is deliberately not
claimed by the implementation phase.

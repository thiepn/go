# V12 — Visual Performance & QA

V12 closes the automated visual-performance track by making rendering cost,
bundle size, responsive behavior, and browser acceptance measurable CI
requirements.

## Performance changes

### Route-level workspaces

The home shell no longer eagerly evaluates every major learner workspace.

The following surfaces are dynamically loaded when entered:

- Account;
- Settings;
- Course;
- Guided Game;
- Practice;
- Play;
- Coach;
- Review;
- Study;
- Progress;
- Content Authoring Studio.

The curriculum/problem corpus is also deferred until the learner enters a
learning workspace. Pointer hover/focus on the primary learning action may
preload it to reduce perceived transition latency without putting it back in
the initial boot path.

Measured production gzip size after this split:

| Budget | Measured | CI limit |
| --- | ---: | ---: |
| Initial JavaScript | 79.0 KiB | 90 KiB |
| Initial CSS | 3.7 KiB | 20 KiB |
| Largest JS chunk | 79.0 KiB | 110 KiB |
| All JavaScript | 167.4 KiB | 240 KiB |

Before curriculum deferral the same V12 branch measured 98.9 KiB initial JS,
so the final initial JavaScript payload is about 20% smaller while total
application code remains essentially unchanged.

### Go-board interaction DOM

Interactive boards previously rendered one invisible SVG hit circle for every
intersection. A 19×19 board therefore created 361 pointer-target nodes in
addition to its visible board content.

V12 replaces those targets with one transparent interaction surface and maps
pointer coordinates to the nearest legal board intersection in constant time.

The pure coordinate mapper is unit tested at board edges and out-of-range
positions. V11 Precision Zoom remains the solution for physically meaningful
touch spacing on 13×13 and 19×19 boards.

## Offline code splitting

Code splitting must not weaken the P15 offline-first contract.

The production build now finalizes the service worker after Vite emits hashed
assets:

1. all generated JS/CSS and supported static assets are discovered;
2. the asset list is injected into the production service worker;
3. a build-specific cache fingerprint is derived from generated assets;
4. the shell cache name receives that fingerprint;
5. platform CI verifies no build markers remain and generated assets are
   present in the production precache.

This means an installed production build can enter code-split learner
workspaces offline even if those workspaces were not individually opened
before connectivity was lost.

KataGo API traffic remains explicitly excluded from service-worker caching.

## Browser acceptance matrix

Playwright runs the same acceptance flows against:

- Chromium mobile — 390×844, touch enabled;
- Firefox desktop — 1280×800;
- WebKit mobile — 390×844, touch enabled.

The suite currently contains three flows across three projects: nine browser
tests per run.

### Covered flows

**Home/reflow**
- home boots;
- primary action is reachable;
- document has no horizontal overflow.

**Accessibility lesson**
- larger-text preference;
- higher-contrast preference;
- reduced motion;
- board coordinates;
- lesson transition;
- keyboard board focus;
- Home/End board navigation;
- screen-reader live coordinate text;
- no page overflow.

**19×19 independent play**
- unlocked Play flow;
- 19×19 setup and launch;
- exactly one board pointer surface rather than per-intersection hit nodes;
- Precision Zoom;
- internal board scrolling;
- no document-level horizontal overflow.

## Defect found by browser QA

The first mobile browser run found a real V11/V12 interaction defect:
Precision Zoom enlarged the document to roughly 937 CSS pixels on a 390px
viewport in Chromium and WebKit.

The cause was CSS grid/min-content sizing allowing the intentionally enlarged
board child to contribute to document width.

The fix adds inline-size containment and explicit min/max-width constraints at
the board frame and independent-game board stage. The same browser matrix then
passed on Chromium, Firefox, and WebKit.

Failure runs retain Playwright screenshots, traces, and video for diagnosis.

## Automated gates

The repository now requires:

- Vitest unit/integration suite;
- production TypeScript/Vite build;
- gzip bundle budgets;
- KataGo runtime syntax checks;
- PWA/platform checks;
- V11 accessibility invariants;
- THIEPN Account consumer conformance;
- Chromium/Firefox/WebKit browser acceptance.

## Certification boundary

V12 provides automated browser/device-class qualification, not literal
physical-device or human assistive-technology certification.

Still empirical before calling the app fully release-certified:

- physical Android Chrome;
- physical iPhone/iPad Safari / installed PWA;
- VoiceOver;
- TalkBack;
- Windows High Contrast on real Windows;
- long-session thermal/memory behavior;
- canonical deployed `https://thiepn.dev/go/` account/OAuth/offline smoke;
- outcome milestones M1–M5 with real learner evidence.

Those are certification activities, not reasons to weaken or duplicate the
automated V12 gates.

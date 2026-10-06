# V11 — Responsive & Accessibility Variants

V11 turns the existing responsive foundation into explicit accessibility variants rather than treating accessibility as a final polish pass.

## Implemented

- keyboard-operable interactive Go boards with Arrow keys, Home, End, Enter, and Space;
- assistive-text board summaries and live focused-coordinate announcements;
- no duplicate SVG announcement for interactive boards;
- static/non-interactive boards remain labeled images;
- optional standard Go coordinates across all boards;
- semantic highlight patterns and stroke differences so board teaching cues are not color-only;
- precision zoom for interactive 13×13 and 19×19 boards;
- precision-board width derived from a 44 CSS-pixel intersection-spacing invariant;
- bounded panning viewport for precision mode;
- keyboard focus tracking inside precision mode;
- system and explicit reduced-motion support;
- system `prefers-contrast: more` plus explicit higher-contrast mode;
- optional larger interface text with responsive reflow;
- safe-area-aware horizontal layout;
- compact-phone home action reflow;
- short-landscape board sizing;
- clearer disabled states;
- browser/page zoom remains enabled.

## Device-local preferences

These are intentionally device-local and are not part of P16 cross-device learning-state sync:

- haptics;
- sound;
- reduce motion;
- larger text;
- higher contrast;
- show board coordinates.

## Touch precision

A full 19×19 board physically cannot preserve comfortable independent touch targets when compressed to a phone width. Increasing invisible target circles would create overlapping ambiguous hit regions.

V11 therefore keeps whole-board fit as the default overview and exposes **Precision zoom** on 13×13 and 19×19 interactive boards. The zoomed board is sized so adjacent intersections remain at least 44 CSS pixels apart and is panned inside a bounded viewport.

## Automated gates

V11 adds:
- geometry tests for minimum precision spacing;
- preference migration tests;
- `npm run check:a11y` to preserve keyboard instructions, zoom availability, reduced-motion/contrast support, browser zoom, and accessibility preferences.

## Remaining QA

V11 implementation is complete. Empirical verification belongs to V12 and should include:
- 320px reflow and 200–400% browser zoom;
- Android/iOS portrait and landscape;
- 9×9, 13×13, and 19×19 touch placement;
- keyboard-only complete lesson/practice/game flows;
- VoiceOver and TalkBack board announcements;
- Windows High Contrast / forced-colors;
- reduced-motion and increased-contrast OS settings;
- large-text preference across every major workspace.

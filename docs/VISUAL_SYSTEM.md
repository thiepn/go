# Visual System

## Direction

The product should feel:

- calm;
- tactile;
- precise;
- premium;
- modern;
- visually alive;
- playful when teaching benefits from it.

The visual identity comes from **Go itself**, not generic edtech decoration.

## Principle

> The board is the illustration system, animation system, teaching surface, and primary source of visual identity.

Motion must explain state, causality, attention, or progress. Decorative motion is secondary.

## Material language

### Board

- warm kaya-inspired surface;
- restrained grain;
- crisp dark grid;
- clear star points;
- slight dimensionality;
- never heavy faux-wood skeuomorphism.

### Black stones

- deep charcoal rather than pure black;
- subtle radial highlight;
- compact soft shadow;
- minute material variation where performance allows.

### White stones

- warm ivory rather than pure white;
- subtle shell-like lighting;
- sufficient edge contrast against the board.

### Surrounding UI

- warm neutral light theme;
- deep charcoal dark theme;
- restrained accent palette;
- instructional overlays reserved for meaning.

## Visual complexity progression

### Absolute beginner

```
one instruction
one board
one obvious action
```

### Developing learner

May gain:
- coordinates;
- tactical markers;
- candidate moves;
- territory overlays.

### Advanced learner

May gain:
- variations;
- move tree;
- score graph;
- ownership;
- engine candidates;
- deep analysis.

Expert UI must never simply be shown to beginners with more tooltips.

## Motion tokens

### Micro — 80–160 ms

- hover;
- press;
- selection;
- ghost stone;
- small emphasis.

### Standard — 180–280 ms

- stone placement;
- feedback;
- panels;
- lesson-state transitions.

### Structural — 300–500 ms

- board expansion;
- route transitions;
- review-mode changes;
- major layout transitions.

### Educational — variable

- concept demonstrations;
- territory fill;
- ladder sequence;
- ko repetition;
- life/death demonstrations.

Educational animation may be slower because watching it is part of learning.

## Physical vs informational motion

Use spring-like movement for:
- stones;
- cards;
- draggable objects;
- drawers.

Use eased, non-physical transitions for:
- territory;
- highlights;
- influence;
- conceptual overlays;
- instructional sequencing.

## Stone placement

Target sequence:

1. ghost stone appears;
2. placed stone begins near 0.88 scale;
3. short downward movement;
4. small overshoot near 1.02;
5. settle to 1.0 with shadow;
6. synchronized placement sound/haptic.

Target duration: roughly 140–180 ms.

## Capture

1. final capturing stone settles;
2. captured group receives a slight lift;
3. stones fade and shrink minimally;
4. board rests briefly;
5. newly created liberties may highlight when pedagogically relevant.

The learner must be able to perceive what changed.

## Concept animations

### Liberties

Neighboring intersections emerge from the stone. Remaining liberties may pulse subtly as danger increases.

### Groups

Connected stones gain a shared contour or visual envelope.

### Atari

The final liberty receives controlled emphasis. Avoid alarming red flashing.

### Ladder

Future stones can appear sequentially as translucent numbered ghosts, followed by a slight zoom-out revealing the forced path.

### Territory

Enclosed ownership fills softly through the region, like a restrained ink/water wash.

### Eyes / life

Secure eye spaces receive subtle illumination; the group settles visually once its survival is established.

### Ko

An illegal recapture previews, the prior board state ghosts over it to show repetition, and the attempted move springs back.

## Shared-element transitions

Prefer continuity:

```
course mini-board
      ↓ expands
lesson board
      ↓ persists
guided game
      ↓ persists
review board
```

Avoid destroying and recreating the visual world at each route change.

## Feedback hierarchy

### Routine success

- subtle check;
- stone/board response;
- automatic continuation where reading is unnecessary.

### Difficult success

- stronger board response;
- short mastery feedback;
- restrained sound/haptic.

### Milestone

Use richer motion only for meaningful events:
- first capture;
- first living group;
- first completed game;
- first independent win;
- chapter mastery.

## Sound

Minimum semantic library:

- several black-stone placement samples;
- several white-stone placement samples;
- capture;
- subtle correction/error;
- routine success;
- milestone;
- chapter completion.

Vary stone impact samples to avoid synthetic repetition.

Sound must always be disableable.

## Haptics

Where supported:

- legal placement: light crisp tap;
- capture: slightly stronger;
- invalid action: short differentiated feedback;
- major milestone: restrained success pattern.

Haptics must never be required to understand state.

## Reduced motion

Reduced-motion mode must preserve meaning.

Example:

Normal:
- liberties pulse sequentially.

Reduced:
- all liberties receive static rings.

Do not remove an educational cue just because its animation is disabled.

## Learning path visual metaphor

Use a Go-grid/constellation structure rather than cloning a generic winding course path.

Completed learning nodes can visually become placed stones. The learner’s map gradually becomes a meaningful Go-like composition.

## Performance requirements

- 60 fps baseline on ordinary modern phones;
- high-refresh friendly;
- visible response to input under 100 ms where practical;
- no layout shifts during lesson progression;
- board interaction available before decorative assets finish loading;
- current lesson assets preloaded;
- expensive effects lazy-loaded.

## Rendering direction

Prefer an SVG-first Go board:
- crisp at every size;
- each intersection can remain interactive;
- accessible structure is possible;
- highlights and markers are easy;
- screenshots/exports remain clean.

Use Canvas only as a supplementary effects layer where it materially improves territory washes or particles. Avoid WebGL unless future evidence justifies the complexity.

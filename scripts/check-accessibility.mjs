import {
  readFileSync,
} from 'node:fs';

const index = readFileSync(
  'index.html',
  'utf8',
);
const board = readFileSync(
  'src/board/renderer/GoBoard.tsx',
  'utf8',
);
const boardCss = readFileSync(
  'src/board/styles/board.css',
  'utf8',
);
const globalCss = readFileSync(
  'src/styles/global.css',
  'utf8',
);
const preferences = readFileSync(
  'src/platform/preferences.ts',
  'utf8',
);

const required = [
  [
    index,
    'viewport-fit=cover',
    'Viewport must preserve safe-area support.',
  ],
  [
    board,
    'aria-keyshortcuts',
    'Interactive board must publish keyboard shortcuts.',
  ],
  [
    board,
    'aria-describedby',
    'Interactive board must expose navigation instructions.',
  ],
  [
    board,
    'Precision zoom',
    'Large boards must preserve the precision zoom variant.',
  ],
  [
    boardCss,
    '.go-board-frame.is-precision-zoom',
    'Precision zoom CSS must remain available.',
  ],
  [
    globalCss,
    'prefers-reduced-motion: reduce',
    'OS reduced-motion behavior must remain available.',
  ],
  [
    globalCss,
    'prefers-contrast: more',
    'OS increased-contrast behavior must remain available.',
  ],
  [
    preferences,
    'highContrast',
    'Explicit high-contrast preference must remain available.',
  ],
  [
    preferences,
    'largeText',
    'Readable-text preference must remain available.',
  ],
  [
    preferences,
    'showCoordinates',
    'Board-coordinate preference must remain available.',
  ],
];

for (const [
  source,
  needle,
  message,
] of required) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

if (
  /user-scalable\s*=\s*no/i.test(index) ||
  /maximum-scale\s*=\s*1/i.test(index)
) {
  throw new Error(
    'Browser pinch/page zoom must not be disabled.',
  );
}

if (/touch-action\s*:\s*none/i.test(boardCss)) {
  throw new Error(
    'The Go board must not disable browser touch zoom/pan globally.',
  );
}

console.log(
  'V11 accessibility invariants verified.',
);

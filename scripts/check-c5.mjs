import {
  existsSync,
  readFileSync,
} from 'node:fs';

const requiredFiles = [
  'playwright.c5.config.ts',
  'tests/e2e/accessibility-certification.e2e.ts',
  'certification/c5-accessibility-checklist.json',
  'certification/evidence/C5.md',
  '.github/workflows/c5-accessibility-qa.yml',
  '.github/workflows/c5-production-accessibility-qa.yml',
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(
      `C5 accessibility certification is missing ${path}.`,
    );
  }
}

const css = readFileSync(
  'src/styles/tokens.css',
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
const tests = readFileSync(
  'tests/e2e/accessibility-certification.e2e.ts',
  'utf8',
);
const config = readFileSync(
  'playwright.c5.config.ts',
  'utf8',
);
const candidate = JSON.parse(
  readFileSync(
    'certification/release-candidate.json',
    'utf8',
  ),
);
const matrix = JSON.parse(
  readFileSync(
    'certification/platform-matrix.json',
    'utf8',
  ),
);
const checklist = JSON.parse(
  readFileSync(
    'certification/c5-accessibility-checklist.json',
    'utf8',
  ),
);

function blockAt(
  source,
  openBrace,
) {
  let depth = 0;

  for (
    let index = openBrace;
    index < source.length;
    index += 1
  ) {
    if (source[index] === '{') {
      depth += 1;
    } else if (
      source[index] === '}'
    ) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(
          openBrace + 1,
          index,
        );
      }
    }
  }

  throw new Error(
    'Unterminated CSS block.',
  );
}

function blockAfter(
  source,
  marker,
  from = 0,
) {
  const markerIndex =
    source.indexOf(
      marker,
      from,
    );

  if (markerIndex < 0) {
    throw new Error(
      `Missing CSS block: ${marker}`,
    );
  }

  const open =
    source.indexOf(
      '{',
      markerIndex,
    );

  return blockAt(
    source,
    open,
  );
}

function variables(
  source,
) {
  const result = {};
  const regex =
    /--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi;

  for (
    const match of source.matchAll(
      regex,
    )
  ) {
    result[match[1]] =
      match[2].toLowerCase();
  }

  return result;
}

function channel(value) {
  const normalized =
    value / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow(
        (normalized + 0.055) /
          1.055,
        2.4,
      );
}

function luminance(hex) {
  const red = channel(
    Number.parseInt(
      hex.slice(1, 3),
      16,
    ),
  );
  const green = channel(
    Number.parseInt(
      hex.slice(3, 5),
      16,
    ),
  );
  const blue = channel(
    Number.parseInt(
      hex.slice(5, 7),
      16,
    ),
  );

  return (
    0.2126 * red +
    0.7152 * green +
    0.0722 * blue
  );
}

function contrast(
  first,
  second,
) {
  const a = luminance(first);
  const b = luminance(second);
  const lighter =
    Math.max(a, b);
  const darker =
    Math.min(a, b);

  return (
    (lighter + 0.05) /
    (darker + 0.05)
  );
}

const light = variables(
  blockAfter(css, ':root'),
);
const darkMedia = blockAfter(
  css,
  '@media (prefers-color-scheme: dark)',
);
const dark = {
  ...light,
  ...variables(
    blockAfter(
      darkMedia,
      ':root',
    ),
  ),
};

const themes = [
  ['light', light],
  ['dark', dark],
];

for (const [
  themeName,
  theme,
] of themes) {
  for (const token of [
    'ink-500',
    'ink-700',
    'accent-500',
    'accent-600',
    'danger-500',
  ]) {
    for (const surface of [
      'paper-50',
      'paper-100',
      'paper-200',
    ]) {
      const ratio = contrast(
        theme[token],
        theme[surface],
      );

      if (ratio < 4.5) {
        throw new Error(
          `${themeName} ${token} on ${surface} is only ${ratio.toFixed(2)}:1; C5 requires 4.5:1.`,
        );
      }
    }
  }

  for (const token of [
    'accent-500',
    'accent-600',
  ]) {
    const ratio = contrast(
      theme[token],
      theme['accent-100'],
    );

    if (ratio < 4.5) {
      throw new Error(
        `${themeName} ${token} on accent-100 is only ${ratio.toFixed(2)}:1.`,
      );
    }
  }

  for (const surface of [
    'paper-50',
    'paper-100',
    'paper-200',
  ]) {
    const ratio = contrast(
      theme.focus,
      theme[surface],
    );

    if (ratio < 3) {
      throw new Error(
        `${themeName} focus indicator on ${surface} is only ${ratio.toFixed(2)}:1; C5 requires 3:1 non-text contrast.`,
      );
    }
  }
}

for (const needle of [
  'aria-roledescription',
  'aria-keyshortcuts',
  'aria-describedby',
  'aria-live="polite"',
]) {
  if (!board.includes(needle)) {
    throw new Error(
      `Interactive board accessibility is missing ${needle}.`,
    );
  }
}

for (const needle of [
  '@media (forced-colors: active)',
  'CanvasText',
  'Canvas',
  'Highlight',
]) {
  if (
    !boardCss.includes(needle) &&
    !globalCss.includes(needle)
  ) {
    throw new Error(
      `Forced-colors support is missing ${needle}.`,
    );
  }
}

for (const needle of [
  "name: 'chromium-320'",
  "name: 'firefox-320'",
  "name: 'webkit-320'",
  "name: 'chromium-forced-colors'",
  "name: 'chromium-reduced-motion'",
]) {
  if (!config.includes(needle)) {
    throw new Error(
      `C5 browser matrix is missing ${needle}.`,
    );
  }
}

for (const needle of [
  '320 CSS px reflow',
  'keyboard-only learner',
  'forced-colors mode',
  'reduced-motion preference',
  'aria-roledescription',
]) {
  if (!tests.includes(needle)) {
    throw new Error(
      `C5 automated evidence is missing ${needle}.`,
    );
  }
}

const currentPhase =
  Number.parseInt(
    candidate.phase.slice(1),
    10,
  );

if (
  !Number.isInteger(currentPhase) ||
  currentPhase < 5 ||
  matrix.candidate !==
    candidate.candidate ||
  checklist.phase !== 'C5' ||
  !/^1\.0\.0-rc\.\d+$/.test(
    checklist.candidate,
  )
) {
  throw new Error(
    'C5 frozen evidence or current release matrix is not valid.',
  );
}

if (
  candidate.phase === 'C5' &&
  checklist.candidate !==
    candidate.candidate
) {
  throw new Error(
    'While C5 is current, its checklist must match the active candidate.',
  );
}

console.log(
  `C5 accessibility contract verified (evidence ${checklist.candidate}; current ${candidate.candidate}).`,
);

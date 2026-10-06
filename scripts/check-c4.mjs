import {
  existsSync,
  readFileSync,
} from 'node:fs';

const requiredFiles = [
  'playwright.c4.config.ts',
  'tests/e2e/mobile-pwa.e2e.ts',
  'certification/c4-device-checklist.json',
  'certification/evidence/C4.md',
  '.github/workflows/c4-mobile-pwa-qa.yml',
  '.github/workflows/c4-production-mobile-qa.yml',
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(
      `C4 qualification is missing ${path}.`,
    );
  }
}

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
    'certification/c4-device-checklist.json',
    'utf8',
  ),
);
const globalCss = readFileSync(
  'src/styles/global.css',
  'utf8',
);
const settings = readFileSync(
  'src/platform/PlatformSettings.tsx',
  'utf8',
);
const c4Config = readFileSync(
  'playwright.c4.config.ts',
  'utf8',
);
const c4Test = readFileSync(
  'tests/e2e/mobile-pwa.e2e.ts',
  'utf8',
);

const currentPhase =
  Number.parseInt(
    candidate.phase.slice(1),
    10,
  );

if (
  !Number.isInteger(currentPhase) ||
  currentPhase < 4 ||
  checklist.phase !== 'C4' ||
  !/^1\.0\.0-rc\.\d+$/.test(
    checklist.candidate,
  ) ||
  matrix.candidate !==
    candidate.candidate
) {
  throw new Error(
    'C4 frozen evidence or current release matrix is not valid.',
  );
}

if (
  candidate.phase === 'C4' &&
  checklist.candidate !==
    candidate.candidate
) {
  throw new Error(
    'While C4 is current, its checklist must match the active candidate.',
  );
}

for (const token of [
  '--safe-area-top',
  '--safe-area-right',
  '--safe-area-bottom',
  '--safe-area-left',
  'env(safe-area-inset-top',
  'env(safe-area-inset-bottom',
]) {
  if (!globalCss.includes(token)) {
    throw new Error(
      `Safe-area containment is missing ${token}.`,
    );
  }
}

if (
  !settings.includes(
    'Launch mode',
  ) ||
  !settings.includes(
    'displayModeLabel',
  )
) {
  throw new Error(
    'Device settings must expose browser versus installed launch mode.',
  );
}

for (const project of [
  "name: 'android-phone'",
  "name: 'iphone-webkit'",
  "name: 'ipad-webkit'",
]) {
  if (!c4Config.includes(project)) {
    throw new Error(
      `C4 emulation matrix is missing ${project}.`,
    );
  }
}

for (const requirement of [
  'safe areas and rotation',
  'offline controlled reload',
  'Launch mode',
  'for (const size of [',
  'board accepts touch',
  'Precision zoom',
]) {
  if (!c4Test.includes(requirement)) {
    throw new Error(
      `C4 automated qualification is missing: ${requirement}.`,
    );
  }
}

const ids = new Set(
  checklist.devices.map(
    (device) => device.id,
  ),
);

for (const required of [
  'android-chrome',
  'ios-safari',
  'ipad-safari',
  'desktop-chromium',
  'desktop-firefox',
  'desktop-safari',
]) {
  if (!ids.has(required)) {
    throw new Error(
      `C4 physical checklist is missing ${required}.`,
    );
  }
}

console.log(
  `C4 frozen qualification contract verified (evidence ${checklist.candidate}; current ${candidate.candidate}).`,
);

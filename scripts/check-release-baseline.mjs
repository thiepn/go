import {
  existsSync,
  readFileSync,
} from 'node:fs';

function readJson(path) {
  return JSON.parse(
    readFileSync(path, 'utf8'),
  );
}

const requiredFiles = [
  'package-lock.json',
  '.nvmrc',
  '.node-version',
  'certification/release-candidate.json',
  'certification/platform-matrix.json',
  'certification/test-profiles.json',
  'certification/states/fresh.json',
  'certification/states/post-beginner.json',
  'docs/RELEASE_BASELINE.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/KNOWN_LIMITATIONS.md',
  'CHANGELOG.md',
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(
      `C0 release baseline is missing ${path}.`,
    );
  }
}

const packageJson = readJson(
  'package.json',
);
const lock = readJson(
  'package-lock.json',
);
const candidate = readJson(
  'certification/release-candidate.json',
);
const matrix = readJson(
  'certification/platform-matrix.json',
);
const profiles = readJson(
  'certification/test-profiles.json',
);
const fresh = readJson(
  'certification/states/fresh.json',
);
const postBeginner = readJson(
  'certification/states/post-beginner.json',
);

if (
  packageJson.version !==
  candidate.candidate
) {
  throw new Error(
    `package.json version ${packageJson.version} does not match frozen candidate ${candidate.candidate}.`,
  );
}

if (
  lock.version !== packageJson.version ||
  lock.packages?.['']?.version !==
    packageJson.version
) {
  throw new Error(
    'package-lock.json root version is not aligned with package.json.',
  );
}

if (lock.lockfileVersion !== 3) {
  throw new Error(
    'C0 requires npm lockfileVersion 3.',
  );
}

if (
  packageJson.engines?.node !== '22.x'
) {
  throw new Error(
    'C0 release builds must stay on Node 22.x.',
  );
}

if (
  readFileSync('.nvmrc', 'utf8').trim() !==
    '22' ||
  readFileSync(
    '.node-version',
    'utf8',
  ).trim() !== '22'
) {
  throw new Error(
    'Node version marker files must both remain 22.',
  );
}

if (
  candidate.phase !== 'C0' ||
  candidate.status !== 'frozen' ||
  candidate.canonicalUrl !==
    'https://thiepn.dev/go/' ||
  candidate.canonicalPath !== '/go/'
) {
  throw new Error(
    'Release-candidate identity or canonical target drifted from the C0 freeze.',
  );
}

if (
  matrix.candidate !== candidate.candidate ||
  profiles.candidate !==
    candidate.candidate
) {
  throw new Error(
    'Certification matrix/profile candidate does not match the release candidate.',
  );
}

const automatedIds = new Set(
  matrix.automated?.map(
    (entry) => entry.id,
  ) ?? [],
);

for (const id of [
  'chromium-mobile',
  'firefox-desktop',
  'webkit-mobile',
]) {
  if (!automatedIds.has(id)) {
    throw new Error(
      `Frozen browser matrix is missing ${id}.`,
    );
  }
}

const profileIds = new Set(
  profiles.profiles?.map(
    (entry) => entry.id,
  ) ?? [],
);

for (const id of [
  'guest-fresh',
  'guest-post-beginner',
  'signed-in-fresh',
  'signed-in-returning',
  'sync-conflict-pair',
  'offline-returning',
  'experienced-learner',
]) {
  if (!profileIds.has(id)) {
    throw new Error(
      `Frozen certification profiles are missing ${id}.`,
    );
  }
}

if (
  fresh.id !== 'fresh' ||
  Object.keys(
    fresh.localStorage ?? {},
  ).length !== 0
) {
  throw new Error(
    'Fresh certification state must remain empty.',
  );
}

if (
  postBeginner.localStorage?.[
    'thiepn-go:guided:first-9x9:complete'
  ] !== true ||
  postBeginner.localStorage?.[
    'thiepn-go:course:go-foundations:v1'
  ]?.nextLessonIndex !== 12
) {
  throw new Error(
    'Post-beginner certification state no longer matches the intended minimal unlock boundary.',
  );
}

const verifyWorkflow = readFileSync(
  '.github/workflows/verify.yml',
  'utf8',
);
const browserWorkflow = readFileSync(
  '.github/workflows/browser-qa.yml',
  'utf8',
);
const playwright = readFileSync(
  'playwright.config.ts',
  'utf8',
);

for (const [
  name,
  workflow,
] of [
  ['verify', verifyWorkflow],
  ['browser-qa', browserWorkflow],
]) {
  if (
    !workflow.includes(
      'npm ci --no-audit --no-fund',
    )
  ) {
    throw new Error(
      `${name} must use npm ci against the frozen lockfile.`,
    );
  }
}

if (
  !verifyWorkflow.includes(
    'npm run check:release',
  )
) {
  throw new Error(
    'verify workflow must enforce the C0 release baseline.',
  );
}

for (const browser of [
  "browserName: 'chromium'",
  "browserName: 'firefox'",
  "browserName: 'webkit'",
]) {
  if (!playwright.includes(browser)) {
    throw new Error(
      `Playwright config drifted from the frozen browser matrix: ${browser}.`,
    );
  }
}

if (existsSync('dist')) {
  if (!existsSync('dist/release.json')) {
    throw new Error(
      'Production build is missing dist/release.json.',
    );
  }

  const built = readJson(
    'dist/release.json',
  );

  if (
    built.version !== packageJson.version ||
    built.candidate !==
      candidate.candidate ||
    built.canonicalPath !== '/go/'
  ) {
    throw new Error(
      'Built release metadata does not match the frozen candidate.',
    );
  }
}

console.log(
  `C0 release baseline verified: ${candidate.candidate}.`,
);

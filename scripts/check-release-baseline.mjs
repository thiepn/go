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
      `Release baseline is missing ${path}.`,
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
    'The release candidate requires npm lockfileVersion 3.',
  );
}

if (
  packageJson.engines?.node !== '22.x'
) {
  throw new Error(
    'Release-candidate builds must stay on Node 22.x.',
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
  !/^C(?:[0-9]|1[0-5])$/.test(
    candidate.phase,
  ) ||
  candidate.status !== 'frozen' ||
  candidate.canonicalUrl !==
    'https://thiepn.dev/go/' ||
  candidate.canonicalPath !== '/go/'
) {
  throw new Error(
    'Release-candidate identity or canonical target drifted from the frozen release contract.',
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
const deployWorkflow = readFileSync(
  '.github/workflows/deploy-pages.yml',
  'utf8',
);
const canonicalWorkflow = readFileSync(
  '.github/workflows/canonical-deploy-qa.yml',
  'utf8',
);
const katagoWorkflow = readFileSync(
  '.github/workflows/katago-live-qa.yml',
  'utf8',
);
const accountPublicWorkflow = readFileSync(
  '.github/workflows/account-production-qa.yml',
  'utf8',
);
const accountCredentialedWorkflow = readFileSync(
  '.github/workflows/account-c3-certification.yml',
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
  ['deploy-pages', deployWorkflow],
  ['canonical-deploy-qa', canonicalWorkflow],
  ['katago-live-qa', katagoWorkflow],
  ['account-production-qa', accountPublicWorkflow],
  ['account-c3-certification', accountCredentialedWorkflow],
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
  ) ||
  !deployWorkflow.includes(
    'npm run check:release',
  )
) {
  throw new Error(
    'Verify and production deployment workflows must enforce the release baseline.',
  );
}

if (
  !deployWorkflow.includes(
    'THIEPN_RELEASE_SHA:',
  ) ||
  !deployWorkflow.includes(
    'dist/release.json',
  )
) {
  throw new Error(
    'Production deployment must stamp and verify release source metadata.',
  );
}

if (
  !canonicalWorkflow.includes(
    'https://thiepn.dev/go/',
  ) ||
  !canonicalWorkflow.includes(
    'EXPECTED_RELEASE_SHA:',
  ) ||
  !canonicalWorkflow.includes(
    'npm run qa:canonical',
  )
) {
  throw new Error(
    'Canonical deployment workflow must certify the live /go/ release and exact source SHA.',
  );
}

if (
  !katagoWorkflow.includes(
    'KATAGO_API_BASE',
  ) ||
  !katagoWorkflow.includes(
    'npm run qa:katago:live',
  )
) {
  throw new Error(
    'C2 live KataGo certification workflow is missing.',
  );
}

if (
  !deployWorkflow.includes(
    'VITE_KATAGO_API_BASE:',
  )
) {
  throw new Error(
    'Pages deployment must inject the configured KataGo proxy base.',
  );
}

if (
  !accountPublicWorkflow.includes(
    'https://thiepn.dev/go/',
  ) ||
  !accountPublicWorkflow.includes(
    'npm run qa:account:public',
  )
) {
  throw new Error(
    'C3 public account workflow must smoke the canonical production app.',
  );
}

if (
  !accountCredentialedWorkflow.includes(
    'C3_TEST_EMAIL',
  ) ||
  !accountCredentialedWorkflow.includes(
    'C3_TEST_PASSWORD',
  ) ||
  !accountCredentialedWorkflow.includes(
    'npm run qa:account:credentialed',
  )
) {
  throw new Error(
    'C3 credentialed workflow must require a dedicated destructive test account.',
  );
}

const accountProvider = readFileSync(
  'src/account/AccountProvider.tsx',
  'utf8',
);
const accountPanel = readFileSync(
  'src/account/AccountPanel.tsx',
  'utf8',
);

if (
  !accountProvider.includes(
    'PASSWORD_RECOVERY',
  ) &&
  !readFileSync(
    'src/account/recovery.ts',
    'utf8',
  ).includes(
    'PASSWORD_RECOVERY',
  )
) {
  throw new Error(
    'C3 requires explicit PASSWORD_RECOVERY handling.',
  );
}

if (
  !accountProvider.includes(
    'completePasswordRecovery',
  ) ||
  !accountPanel.includes(
    'Update password',
  )
) {
  throw new Error(
    'C3 requires a user-facing password recovery completion flow.',
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

const viteConfig = readFileSync(
  'vite.config.ts',
  'utf8',
);
const manifest = readJson(
  'public/manifest.webmanifest',
);
const pwaRuntime = readFileSync(
  'src/platform/pwa.ts',
  'utf8',
);

if (
  !viteConfig.includes("base: '/go/'") ||
  manifest.start_url !== '/go/' ||
  manifest.scope !== '/go/' ||
  !pwaRuntime.includes(
    'import.meta.env.BASE_URL',
  )
) {
  throw new Error(
    'Canonical /go/ build, manifest, and service-worker registration contract is incomplete.',
  );
}

console.log(
  `Release baseline verified: ${candidate.candidate} (${candidate.phase}).`,
);

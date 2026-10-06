import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(
    'package.json',
    'utf8',
  ),
);
const candidate = JSON.parse(
  readFileSync(
    'certification/release-candidate.json',
    'utf8',
  ),
);

if (
  packageJson.version !==
  candidate.candidate
) {
  throw new Error(
    'Cannot finalize release metadata with mismatched package/candidate versions.',
  );
}

const sourceCommit =
  process.env.THIEPN_RELEASE_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.CF_PAGES_COMMIT_SHA ??
  'local';

const provider =
  process.env.VERCEL === '1'
    ? 'vercel'
    : process.env.GITHUB_ACTIONS ===
        'true'
      ? 'github-actions'
      : 'local';

const metadata = {
  schemaVersion: 1,
  version: packageJson.version,
  candidate: candidate.candidate,
  phase: candidate.phase,
  canonicalUrl:
    candidate.canonicalUrl,
  canonicalPath:
    candidate.canonicalPath,
  sourceCommit,
  buildProvider: provider,
};

mkdirSync(
  'dist',
  { recursive: true },
);
writeFileSync(
  'dist/release.json',
  JSON.stringify(
    metadata,
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log(
  `Release metadata finalized for ${metadata.version} at ${metadata.sourceCommit}.`,
);

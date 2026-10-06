import {
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join, posix } from 'node:path';

const distDir = 'dist';
const assetDir = join(distDir, 'assets');
const swPath = join(distDir, 'sw.js');
const candidate = JSON.parse(
  readFileSync(
    'certification/release-candidate.json',
    'utf8',
  ),
);

const appBase = candidate.canonicalPath;

if (
  typeof appBase !== 'string' ||
  !appBase.startsWith('/') ||
  !appBase.endsWith('/')
) {
  throw new Error(
    'Canonical app path must start and end with /.',
  );
}

function walk(directory, prefix = 'assets') {
  return readdirSync(
    directory,
    { withFileTypes: true },
  ).flatMap((entry) => {
    const absolute = join(
      directory,
      entry.name,
    );
    const relative = posix.join(
      prefix,
      entry.name,
    );

    if (entry.isDirectory()) {
      return walk(absolute, relative);
    }

    if (
      !entry.isFile() ||
      entry.name.endsWith('.map')
    ) {
      return [];
    }

    return [relative];
  });
}

const generatedFiles = walk(assetDir)
  .filter((path) =>
    /\.(?:js|css|woff2?|png|svg|webp|avif)$/.test(
      path,
    ),
  )
  .sort();

const assets = generatedFiles.map(
  (path) => `${appBase}${path}`,
);

if (assets.length === 0) {
  throw new Error(
    'No generated production assets found for offline precache.',
  );
}

const buildFingerprint = generatedFiles
  .map((path) => {
    const file = join(
      distDir,
      path,
    );

    return `${path}:${statSync(file).size}`;
  })
  .join('\n');

const buildId = createHash('sha256')
  .update(buildFingerprint)
  .digest('hex')
  .slice(0, 12);

let serviceWorker = readFileSync(
  swPath,
  'utf8',
);

const assetMarker =
  '/*__GENERATED_ASSETS__*/ []';
const cacheMarker =
  '__BUILD_CACHE__';
const baseMarker =
  '__APP_BASE__';

if (
  !serviceWorker.includes(assetMarker) ||
  !serviceWorker.includes(cacheMarker) ||
  !serviceWorker.includes(baseMarker)
) {
  throw new Error(
    'Service-worker build markers are missing.',
  );
}

serviceWorker = serviceWorker
  .replace(
    assetMarker,
    JSON.stringify(
      assets,
      null,
      2,
    ),
  )
  .replaceAll(
    cacheMarker,
    buildId,
  )
  .replaceAll(
    baseMarker,
    appBase,
  );

writeFileSync(
  swPath,
  serviceWorker,
  'utf8',
);

console.log(
  `Offline precache finalized: ${assets.length} generated assets at ${appBase}, cache ${buildId}.`,
);

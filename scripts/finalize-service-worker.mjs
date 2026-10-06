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

const assets = walk(assetDir)
  .filter((path) =>
    /\.(?:js|css|woff2?|png|svg|webp|avif)$/.test(
      path,
    ),
  )
  .sort()
  .map((path) => `/${path}`);

if (assets.length === 0) {
  throw new Error(
    'No generated production assets found for offline precache.',
  );
}

const buildFingerprint = assets
  .map((path) => {
    const file = join(
      distDir,
      path.replace(/^\//, ''),
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

if (
  !serviceWorker.includes(assetMarker) ||
  !serviceWorker.includes(cacheMarker)
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
  );

writeFileSync(
  swPath,
  serviceWorker,
  'utf8',
);

console.log(
  `Offline precache finalized: ${assets.length} generated assets, cache ${buildId}.`,
);

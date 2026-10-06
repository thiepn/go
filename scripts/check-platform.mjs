import {
  existsSync,
  readFileSync,
} from 'node:fs';

const requiredFiles = [
  'public/manifest.webmanifest',
  'public/sw.js',
  'public/offline.html',
  'public/icon.svg',
  'public/icon-192.png',
  'public/icon-512.png',
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(`Missing platform asset: ${path}`);
  }
}

const manifest = JSON.parse(
  readFileSync(
    'public/manifest.webmanifest',
    'utf8',
  ),
);

if (
  manifest.start_url !== '/go/' ||
  manifest.scope !== '/go/'
) {
  throw new Error(
    'PWA start_url and scope must remain rooted at /go/.',
  );
}

if (manifest.display !== 'standalone') {
  throw new Error('PWA display mode must remain standalone.');
}

const iconSizes = new Set(
  (manifest.icons ?? []).map(
    (icon) => icon.sizes,
  ),
);

for (const size of ['192x192', '512x512']) {
  if (!iconSizes.has(size)) {
    throw new Error(
      `PWA manifest is missing required icon size ${size}.`,
    );
  }
}

const index = readFileSync('index.html', 'utf8');

if (
  !index.includes('rel="manifest"') ||
  !index.includes('href="/go/manifest.webmanifest"')
) {
  throw new Error(
    'index.html must link the canonical /go/ PWA manifest.',
  );
}

if (!index.includes('viewport-fit=cover')) {
  throw new Error(
    'index.html must preserve viewport-fit=cover for mobile safe areas.',
  );
}

const globalCss = readFileSync(
  'src/styles/global.css',
  'utf8',
);

for (const inset of [
  'safe-area-inset-top',
  'safe-area-inset-right',
  'safe-area-inset-bottom',
  'safe-area-inset-left',
]) {
  if (!globalCss.includes(inset)) {
    throw new Error(
      `Mobile safe-area containment is missing ${inset}.`,
    );
  }
}

const serviceWorker = readFileSync(
  'public/sw.js',
  'utf8',
);

if (!serviceWorker.includes("url.pathname.startsWith('/api/')")) {
  throw new Error(
    'Service worker must never cache KataGo API responses.',
  );
}

if (
  !serviceWorker.includes(
    '/*__GENERATED_ASSETS__*/ []',
  ) ||
  !serviceWorker.includes(
    '__BUILD_CACHE__',
  ) ||
  !serviceWorker.includes(
    '__APP_BASE__',
  )
) {
  throw new Error(
    'Source service worker must retain build-time precache markers.',
  );
}

if (existsSync('dist/sw.js')) {
  const builtServiceWorker = readFileSync(
    'dist/sw.js',
    'utf8',
  );

  if (
    builtServiceWorker.includes(
      '/*__GENERATED_ASSETS__*/ []',
    ) ||
    builtServiceWorker.includes(
      '__BUILD_CACHE__',
    ) ||
    builtServiceWorker.includes(
      '__APP_BASE__',
    )
  ) {
    throw new Error(
      'Production service worker still contains unresolved build markers.',
    );
  }

  if (
    !builtServiceWorker.includes(
      '/go/assets/',
    )
  ) {
    throw new Error(
      'Production service worker must precache generated code-split assets.',
    );
  }

  if (
    !builtServiceWorker.includes(
      "const APP_BASE = '/go/';",
    ) ||
    !builtServiceWorker.includes(
      "url.pathname.startsWith('/api/')",
    )
  ) {
    throw new Error(
      'Built service worker must keep KataGo API traffic out of caches.',
    );
  }
}

if (existsSync('dist/index.html')) {
  const builtIndex = readFileSync(
    'dist/index.html',
    'utf8',
  );

  if (
    !builtIndex.includes('/go/assets/') ||
    !builtIndex.includes(
      '/go/manifest.webmanifest',
    )
  ) {
    throw new Error(
      'Production HTML must reference assets and manifest under /go/.',
    );
  }

  if (
    /(?:src|href)="\/(?:assets|manifest\.webmanifest|icon-)/.test(
      builtIndex,
    )
  ) {
    throw new Error(
      'Production HTML contains a root-scoped app asset.',
    );
  }
}

console.log('Platform assets verified.');

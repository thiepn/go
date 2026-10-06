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

if (manifest.start_url !== '/') {
  throw new Error('PWA start_url must remain rooted at /.');
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

if (!index.includes('rel="manifest"')) {
  throw new Error('index.html must link the PWA manifest.');
}

if (!index.includes('viewport-fit=cover')) {
  throw new Error(
    'index.html must preserve viewport-fit=cover for mobile safe areas.',
  );
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

console.log('Platform assets verified.');

const SHELL_CACHE = 'thiepn-go-shell-v1';
const RUNTIME_CACHE = 'thiepn-go-runtime-v1';
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

async function cacheAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(APP_SHELL);

  const root = await cache.match('/');
  if (!root) return;

  const html = await root.clone().text();
  const assetPaths = [
    ...html.matchAll(/(?:src|href)="([^"]+)"/g),
  ]
    .map((match) => match[1])
    .filter(
      (path) =>
        path.startsWith('/assets/') ||
        path.startsWith('/src/'),
    );

  await Promise.allSettled(
    [...new Set(assetPaths)].map((path) =>
      cache.add(path),
    ),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheAppShell().then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('thiepn-go-') &&
                key !== SHELL_CACHE &&
                key !== RUNTIME_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match('/')) ||
      (await caches.match('/offline.html'))
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (
    response.ok &&
    response.type === 'basic'
  ) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

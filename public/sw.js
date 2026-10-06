const SHELL_CACHE = 'thiepn-go-shell-__BUILD_CACHE__';
const RUNTIME_CACHE = 'thiepn-go-runtime-v1';
const APP_BASE = '__APP_BASE__';
const GENERATED_ASSETS = /*__GENERATED_ASSETS__*/ [];
const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}offline.html`,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}icon.svg`,
  `${APP_BASE}icon-192.png`,
  `${APP_BASE}icon-512.png`,
  ...GENERATED_ASSETS,
];

async function cacheAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(APP_SHELL);

  const root = await cache.match(APP_BASE);
  if (!root) return;

  const html = await root.clone().text();
  const assetPaths = [
    ...html.matchAll(/(?:src|href)="([^"]+)"/g),
  ]
    .map((match) => match[1])
    .filter(
      (path) =>
        path.startsWith(`${APP_BASE}assets/`) ||
        path.startsWith(`${APP_BASE}src/`),
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
      (await caches.match(APP_BASE)) ||
      (await caches.match(
        `${APP_BASE}offline.html`,
      ))
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

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith(
      `${APP_BASE}api/`,
    )
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

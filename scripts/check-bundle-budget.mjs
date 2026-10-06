import {
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = 'dist';
const html = readFileSync(
  join(dist, 'index.html'),
  'utf8',
);

function assetPaths(pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter(Boolean)
    .map((path) =>
      path.replace(/^\//, ''),
    );
}

const initialJs = assetPaths(
  /<script[^>]+src="([^"]+\.js)"/g,
);
const initialCss = assetPaths(
  /<link[^>]+href="([^"]+\.css)"[^>]*>/g,
);

function size(path) {
  const raw = readFileSync(
    join(dist, path),
  );
  return {
    raw: raw.byteLength,
    gzip: gzipSync(raw).byteLength,
  };
}

function kib(bytes) {
  return Math.round(
    (bytes / 1024) * 10,
  ) / 10;
}

function totalGzip(paths) {
  return paths.reduce(
    (sum, path) => sum + size(path).gzip,
    0,
  );
}

const assetDir = join(dist, 'assets');
const allAssets = readdirSync(assetDir)
  .filter((name) =>
    statSync(join(assetDir, name)).isFile(),
  )
  .map((name) => `assets/${name}`);

const allJs = allAssets.filter(
  (path) => path.endsWith('.js'),
);
const largestJs = allJs
  .map((path) => ({
    path,
    ...size(path),
  }))
  .sort((a, b) => b.gzip - a.gzip)[0];

const budgets = {
  initialJsGzip: 90 * 1024,
  initialCssGzip: 20 * 1024,
  largestJsGzip: 110 * 1024,
  totalJsGzip: 240 * 1024,
};

const actual = {
  initialJsGzip: totalGzip(initialJs),
  initialCssGzip: totalGzip(initialCss),
  largestJsGzip:
    largestJs?.gzip ?? 0,
  totalJsGzip: totalGzip(allJs),
};

console.log('Production bundle budget');
console.table({
  'initial JS gzip': {
    actual: `${kib(actual.initialJsGzip)} KiB`,
    budget: `${kib(budgets.initialJsGzip)} KiB`,
  },
  'initial CSS gzip': {
    actual: `${kib(actual.initialCssGzip)} KiB`,
    budget: `${kib(budgets.initialCssGzip)} KiB`,
  },
  'largest JS chunk gzip': {
    actual: `${kib(actual.largestJsGzip)} KiB`,
    budget: `${kib(budgets.largestJsGzip)} KiB`,
  },
  'all JS gzip': {
    actual: `${kib(actual.totalJsGzip)} KiB`,
    budget: `${kib(budgets.totalJsGzip)} KiB`,
  },
});

if (initialJs.length === 0) {
  throw new Error(
    'No initial JavaScript asset was found in dist/index.html.',
  );
}

for (const [name, budget] of Object.entries(budgets)) {
  if (actual[name] > budget) {
    throw new Error(
      `${name} exceeded budget: ${kib(actual[name])} KiB > ${kib(budget)} KiB`,
    );
  }
}

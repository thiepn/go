import {
  isArrayOf,
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import type {
  KataGoPositionAnalysis,
} from './types';

export const KATAGO_CACHE_KEY =
  'thiepn-go:katago-cache:v1';

interface CacheEntry {
  readonly key: string;
  readonly savedAt: number;
  readonly analysis: KataGoPositionAnalysis;
}

function isCacheEntry(
  value: unknown,
): value is CacheEntry {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.savedAt === 'number' &&
    isRecord(value.analysis)
  );
}

function load(): CacheEntry[] {
  return readJson(
    KATAGO_CACHE_KEY,
    () => [],
    (value): value is CacheEntry[] =>
      isArrayOf(value, isCacheEntry),
  );
}

export function analysisCacheKey(
  recordId: string,
  moveNumber: number,
  visits: number,
  humanProfile: string | null,
  includeOwnership = true,
  includePolicy = true,
): string {
  return [
    recordId,
    moveNumber,
    visits,
    humanProfile ?? 'none',
    includeOwnership ? 'own1' : 'own0',
    includePolicy ? 'pol1' : 'pol0',
  ].join(':');
}

export function readAnalysisCache(
  key: string,
  maxAgeMs =
    30 * 24 * 60 * 60 * 1000,
): KataGoPositionAnalysis | null {
  const entry = load().find(
    (item) => item.key === key,
  );

  if (
    !entry ||
    Date.now() - entry.savedAt >
      maxAgeMs
  ) {
    return null;
  }

  return entry.analysis;
}

export function writeAnalysisCache(
  key: string,
  analysis: KataGoPositionAnalysis,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const entries = load().filter(
      (item) => item.key !== key,
    );

    writeJson(
      KATAGO_CACHE_KEY,
      [
        {
          key,
          savedAt: Date.now(),
          analysis,
        },
        ...entries,
      ].slice(0, 160),
    );
  } catch {
    // Engine analysis remains usable without local caching.
  }
}

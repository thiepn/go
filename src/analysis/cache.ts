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

function load(): CacheEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      KATAGO_CACHE_KEY,
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as CacheEntry[])
      : [];
  } catch {
    return [];
  }
}

export function analysisCacheKey(
  recordId: string,
  moveNumber: number,
  visits: number,
  humanProfile: string | null,
): string {
  return [
    recordId,
    moveNumber,
    visits,
    humanProfile ?? 'none',
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

    window.localStorage.setItem(
      KATAGO_CACHE_KEY,
      JSON.stringify([
        {
          key,
          savedAt: Date.now(),
          analysis,
        },
        ...entries,
      ].slice(0, 160)),
    );
  } catch {
    // Engine analysis remains usable without local caching.
  }
}

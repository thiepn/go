export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const APP_STORAGE_PREFIX = 'thiepn-go:';
export const RECOVERY_STORAGE_PREFIX =
  'thiepn-go:recovery:';

const MAX_RECOVERY_ENTRIES = 3;

export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isArrayOf<T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(predicate);
}

function localStorageOrNull(): StorageLike | null {
  if (typeof window === 'undefined') return null;

  try {
    const storage = window.localStorage;
    const probe = '__thiepn_go_storage_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function recoveryKeys(storage: StorageLike): string[] {
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (key?.startsWith(RECOVERY_STORAGE_PREFIX)) {
      keys.push(key);
    }
  }

  return keys.sort();
}

function trimRecoveryEntries(storage: StorageLike): void {
  const keys = recoveryKeys(storage);

  while (keys.length > MAX_RECOVERY_ENTRIES) {
    const oldest = keys.shift();
    if (!oldest) break;

    try {
      storage.removeItem(oldest);
    } catch {
      return;
    }
  }
}

export function quarantineStoredValue(
  storage: StorageLike,
  sourceKey: string,
  raw: string,
  now = Date.now(),
): void {
  const recoveryKey =
    `${RECOVERY_STORAGE_PREFIX}${String(now).padStart(16, '0')}:${encodeURIComponent(sourceKey)}`;

  try {
    storage.setItem(recoveryKey, raw);
    trimRecoveryEntries(storage);
  } catch {
    // Recovery must never prevent the app from starting.
  }

  try {
    storage.removeItem(sourceKey);
  } catch {
    // The caller still receives a safe fallback.
  }
}

export function readJsonFromStorage<T>(
  storage: StorageLike,
  key: string,
  fallback: () => T,
  validate: (value: unknown) => value is T,
): T {
  let raw: string | null;

  try {
    raw = storage.getItem(key);
  } catch {
    return fallback();
  }

  if (raw === null) return fallback();

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!validate(parsed)) {
      quarantineStoredValue(storage, key, raw);
      return fallback();
    }

    return parsed;
  } catch {
    quarantineStoredValue(storage, key, raw);
    return fallback();
  }
}

export function readJson<T>(
  key: string,
  fallback: () => T,
  validate: (value: unknown) => value is T,
): T {
  const storage = localStorageOrNull();
  return storage
    ? readJsonFromStorage(storage, key, fallback, validate)
    : fallback();
}

export function writeJson(
  key: string,
  value: unknown,
): boolean {
  const storage = localStorageOrNull();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export interface RecoveryEntry {
  readonly storageKey: string;
  readonly sourceKey: string;
  readonly savedAt: number | null;
}

export function listRecoveryEntries(): RecoveryEntry[] {
  const storage = localStorageOrNull();
  if (!storage) return [];

  return recoveryKeys(storage)
    .map((storageKey) => {
      const suffix = storageKey.slice(
        RECOVERY_STORAGE_PREFIX.length,
      );
      const separator = suffix.indexOf(':');

      if (separator < 0) {
        return {
          storageKey,
          sourceKey: 'unknown',
          savedAt: null,
        };
      }

      const timestamp = Number(
        suffix.slice(0, separator),
      );
      const encodedSource = suffix.slice(separator + 1);

      return {
        storageKey,
        sourceKey: decodeURIComponent(encodedSource),
        savedAt:
          Number.isFinite(timestamp)
            ? timestamp
            : null,
      };
    })
    .reverse();
}

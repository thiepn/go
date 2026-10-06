import {
  isRecord,
  readJson,
  writeJson,
} from './storage';

export const PREFERENCES_STORAGE_KEY =
  'thiepn-go:preferences:v1';

export interface AppPreferences {
  readonly sound: boolean;
  readonly haptics: boolean;
  readonly reduceMotion: boolean;
  readonly highContrast: boolean;
  readonly largeText: boolean;
  readonly showCoordinates: boolean;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  sound: false,
  haptics: true,
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  showCoordinates: false,
};

type Listener = () => void;

let initialized = false;
let current = DEFAULT_PREFERENCES;
const listeners = new Set<Listener>();

export function normalizePreferences(
  value: unknown,
): AppPreferences {
  if (!isRecord(value)) {
    return DEFAULT_PREFERENCES;
  }

  return {
    sound:
      typeof value.sound === 'boolean'
        ? value.sound
        : DEFAULT_PREFERENCES.sound,
    haptics:
      typeof value.haptics === 'boolean'
        ? value.haptics
        : DEFAULT_PREFERENCES.haptics,
    reduceMotion:
      typeof value.reduceMotion === 'boolean'
        ? value.reduceMotion
        : DEFAULT_PREFERENCES.reduceMotion,
    highContrast:
      typeof value.highContrast === 'boolean'
        ? value.highContrast
        : DEFAULT_PREFERENCES.highContrast,
    largeText:
      typeof value.largeText === 'boolean'
        ? value.largeText
        : DEFAULT_PREFERENCES.largeText,
    showCoordinates:
      typeof value.showCoordinates === 'boolean'
        ? value.showCoordinates
        : DEFAULT_PREFERENCES.showCoordinates,
  };
}

function isPreferenceRecord(
  value: unknown,
): value is Record<string, unknown> {
  return isRecord(value);
}

function loadPreferences(): AppPreferences {
  const stored = readJson(
    PREFERENCES_STORAGE_KEY,
    () => ({ ...DEFAULT_PREFERENCES }),
    isPreferenceRecord,
  );

  return normalizePreferences(stored);
}

export function applyPreferences(
  preferences: AppPreferences,
): void {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.reduceMotion =
    preferences.reduceMotion ? 'true' : 'false';
  document.documentElement.dataset.highContrast =
    preferences.highContrast ? 'true' : 'false';
  document.documentElement.dataset.largeText =
    preferences.largeText ? 'true' : 'false';
}

function ensurePreferences(): void {
  if (initialized) return;
  initialized = true;
  current = loadPreferences();
  applyPreferences(current);
}

export function getPreferences(): AppPreferences {
  ensurePreferences();
  return current;
}

export function setPreferences(
  patch: Partial<AppPreferences>,
): AppPreferences {
  ensurePreferences();

  current = {
    ...current,
    ...patch,
  };

  writeJson(PREFERENCES_STORAGE_KEY, current);
  applyPreferences(current);

  for (const listener of listeners) {
    listener();
  }

  return current;
}

export function subscribePreferences(
  listener: Listener,
): () => void {
  ensurePreferences();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function initializePreferences(): void {
  ensurePreferences();

  if (typeof window === 'undefined') return;

  window.addEventListener('storage', (event) => {
    if (event.key !== PREFERENCES_STORAGE_KEY) return;

    current = loadPreferences();
    applyPreferences(current);

    for (const listener of listeners) {
      listener();
    }
  });
}

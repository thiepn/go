import type {
  IndependentGameState,
  SavedGameRecord,
} from './types';

export const GAME_RECORDS_STORAGE_KEY =
  'thiepn-go:game-records:v1';

export function loadGameRecords(): SavedGameRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(
      GAME_RECORDS_STORAGE_KEY,
    );
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as SavedGameRecord[])
      : [];
  } catch {
    return [];
  }
}

export function createGameRecord(
  state: IndependentGameState,
  playedAt = Date.now(),
): SavedGameRecord | null {
  if (
    state.phase !== 'complete' ||
    state.result === null
  ) {
    return null;
  }

  return {
    id: `game-${playedAt}-${state.game.moves.length}`,
    playedAt,
    settings: state.settings,
    moves: state.game.moves,
    result: state.result,
    captures: state.game.captures,
  };
}

export function saveGameRecord(
  record: SavedGameRecord,
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadGameRecords().filter(
      (item) => item.id !== record.id,
    );

    window.localStorage.setItem(
      GAME_RECORDS_STORAGE_KEY,
      JSON.stringify([record, ...existing].slice(0, 50)),
    );
  } catch {
    // Independent play remains usable without persistence.
  }
}

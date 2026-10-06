import {
  isArrayOf,
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import type {
  IndependentGameState,
  SavedGameRecord,
} from './types';

export const GAME_RECORDS_STORAGE_KEY =
  'thiepn-go:game-records:v1';

function isSavedGameRecord(
  value: unknown,
): value is SavedGameRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.playedAt === 'number' &&
    isRecord(value.settings) &&
    Array.isArray(value.moves) &&
    isRecord(value.result) &&
    isRecord(value.captures)
  );
}

export function loadGameRecords(): SavedGameRecord[] {
  return readJson(
    GAME_RECORDS_STORAGE_KEY,
    () => [],
    (value): value is SavedGameRecord[] =>
      isArrayOf(value, isSavedGameRecord),
  );
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
  try {
    const existing = loadGameRecords().filter(
      (item) => item.id !== record.id,
    );

    writeJson(
      GAME_RECORDS_STORAGE_KEY,
      [record, ...existing].slice(0, 50),
    );
  } catch {
    // Independent play remains usable without persistence.
  }
}

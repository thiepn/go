import {
  applyLocalState,
  collectLocalState,
  isGoSyncPayload,
  mergeGoSyncPayloads,
  type GoSyncPayload,
} from './sync';
import { isRecord } from '../platform/storage';

export interface GoBackup {
  readonly format: 'thiepn-go-backup';
  readonly version: 1;
  readonly exportedAt: number;
  readonly state: GoSyncPayload;
}

export function createGoBackup(): GoBackup {
  return {
    format: 'thiepn-go-backup',
    version: 1,
    exportedAt: Date.now(),
    state: collectLocalState(),
  };
}

export function serializeGoBackup(
  backup = createGoBackup(),
): string {
  return JSON.stringify(
    backup,
    null,
    2,
  );
}

export function parseGoBackup(
  source: string,
): GoBackup {
  const value: unknown = JSON.parse(source);

  if (
    !isRecord(value) ||
    value.format !== 'thiepn-go-backup' ||
    value.version !== 1 ||
    typeof value.exportedAt !== 'number' ||
    !isGoSyncPayload(value.state)
  ) {
    throw new Error(
      'This file is not a supported Go backup.',
    );
  }

  return value as unknown as GoBackup;
}

export function restoreGoBackup(
  backup: GoBackup,
): GoSyncPayload {
  const merged = mergeGoSyncPayloads(
    backup.state,
    collectLocalState(),
  );
  applyLocalState(merged);
  return merged;
}

export function downloadGoBackup(): void {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined'
  ) {
    return;
  }

  const backup = createGoBackup();
  const blob = new Blob(
    [serializeGoBackup(backup)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const date = new Date(
    backup.exportedAt,
  )
    .toISOString()
    .slice(0, 10);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download =
    `go-backup-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

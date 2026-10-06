import {
  isArrayOf,
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import type { StudyDocument } from './types';

export const STUDY_STORAGE_KEY =
  'thiepn-go:studies:v1';

function isStudyDocument(
  value: unknown,
): value is StudyDocument {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isRecord(value.metadata) &&
    isRecord(value.root) &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  );
}

export function loadStudyDocuments(): StudyDocument[] {
  return readJson(
    STUDY_STORAGE_KEY,
    () => [],
    (value): value is StudyDocument[] =>
      isArrayOf(value, isStudyDocument),
  );
}

export function saveStudyDocument(
  document: StudyDocument,
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadStudyDocuments().filter(
      (item) => item.id !== document.id,
    );

    writeJson(
      STUDY_STORAGE_KEY,
      [document, ...existing].slice(0, 50),
    );
  } catch {
    // Study remains usable without persistence.
  }
}

export function deleteStudyDocument(
  documentId: string,
): void {
  if (typeof window === 'undefined') return;

  try {
    const next = loadStudyDocuments().filter(
      (item) => item.id !== documentId,
    );

    writeJson(
      STUDY_STORAGE_KEY,
      next,
    );
  } catch {
    // Ignore storage failures.
  }
}

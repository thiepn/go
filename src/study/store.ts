import type { StudyDocument } from './types';

export const STUDY_STORAGE_KEY =
  'thiepn-go:studies:v1';

export function loadStudyDocuments(): StudyDocument[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(
      STUDY_STORAGE_KEY,
    );
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as StudyDocument[])
      : [];
  } catch {
    return [];
  }
}

export function saveStudyDocument(
  document: StudyDocument,
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = loadStudyDocuments().filter(
      (item) => item.id !== document.id,
    );

    window.localStorage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify([document, ...existing].slice(0, 50)),
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

    window.localStorage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Ignore storage failures.
  }
}

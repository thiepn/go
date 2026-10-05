import type {
  BoardMarker,
} from '../board';
import type {
  StudyMark,
} from './types';

export function studyMarksToBoardMarkers(
  marks: readonly StudyMark[] | undefined,
): BoardMarker[] {
  return (marks ?? []).map((mark) => ({
    point: mark.point,
    label:
      mark.kind === 'label'
        ? mark.label ?? ''
        : mark.kind === 'triangle'
          ? '△'
          : mark.kind === 'square'
            ? '□'
            : mark.kind === 'circle'
              ? '○'
              : '×',
    tone:
      mark.kind === 'cross'
        ? 'warning'
        : 'accent',
  }));
}

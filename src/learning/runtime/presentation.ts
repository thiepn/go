import type {
  LessonEffect,
  LessonPresentation,
} from './types';

export const EMPTY_PRESENTATION: LessonPresentation = {
  highlights: [],
  groupHighlights: [],
  markers: [],
  ghostStone: null,
};

export function applyLessonEffects(
  presentation: LessonPresentation,
  effects: readonly LessonEffect[] | undefined,
): LessonPresentation {
  let next = presentation;

  for (const effect of effects ?? []) {
    switch (effect.type) {
      case 'clear-presentation':
        next = EMPTY_PRESENTATION;
        break;
      case 'highlight':
        next = {
          ...next,
          highlights: [
            ...next.highlights,
            ...effect.points.map((point) => ({
              point,
              kind: effect.kind,
              pulse: effect.pulse,
            })),
          ],
        };
        break;
      case 'group-highlight':
        next = {
          ...next,
          groupHighlights: [
            ...next.groupHighlights,
            {
              stones: effect.stones,
              kind: effect.kind,
            },
          ],
        };
        break;
      case 'marker':
        next = {
          ...next,
          markers: [...next.markers, effect.marker],
        };
        break;
      case 'ghost':
        next = {
          ...next,
          ghostStone: effect.ghost,
        };
        break;
    }
  }

  return next;
}

import type { Board } from '../../go/engine';
import { getGroup } from '../../go/engine';
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
  board?: Board,
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

      case 'show-group': {
        if (!board) break;
        const group = getGroup(board, effect.at);
        if (!group) break;

        next = {
          ...next,
          groupHighlights: [
            ...next.groupHighlights,
            {
              stones: group.stones,
              kind: effect.kind,
            },
          ],
        };
        break;
      }

      case 'show-liberties': {
        if (!board) break;
        const group = getGroup(board, effect.of);
        if (!group) break;

        next = {
          ...next,
          highlights: [
            ...next.highlights,
            ...group.liberties.map((point) => ({
              point,
              kind: 'liberty' as const,
              pulse: effect.pulse,
            })),
          ],
        };
        break;
      }

      case 'show-atari': {
        if (!board) break;
        const group = getGroup(board, effect.groupAt);
        if (!group || group.liberties.length !== 1) break;

        next = {
          ...next,
          groupHighlights: [
            ...next.groupHighlights,
            {
              stones: group.stones,
              kind: 'warning',
            },
          ],
          highlights: [
            ...next.highlights,
            {
              point: group.liberties[0],
              kind: 'warning',
              pulse: true,
            },
          ],
        };
        break;
      }

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

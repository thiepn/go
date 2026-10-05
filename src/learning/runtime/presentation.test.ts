import { describe, expect, it } from 'vitest';

import { createGame } from '../../go/engine';
import {
  applyLessonEffects,
  EMPTY_PRESENTATION,
} from './presentation';

describe('semantic lesson presentation effects', () => {
  it('derives group liberties from engine state', () => {
    const game = createGame({
      size: 5,
      setup: {
        black: [{ x: 2, y: 2 }],
      },
    });

    const presentation = applyLessonEffects(
      EMPTY_PRESENTATION,
      [
        {
          type: 'show-liberties',
          of: { x: 2, y: 2 },
        },
      ],
      game.board,
    );

    expect(presentation.highlights).toHaveLength(4);
    expect(
      presentation.highlights.every(
        (highlight) => highlight.kind === 'liberty',
      ),
    ).toBe(true);
  });

  it('visualizes atari only when the group has one liberty', () => {
    const game = createGame({
      size: 5,
      setup: {
        black: [{ x: 2, y: 2 }],
        white: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
      },
    });

    const presentation = applyLessonEffects(
      EMPTY_PRESENTATION,
      [
        {
          type: 'show-atari',
          groupAt: { x: 2, y: 2 },
        },
      ],
      game.board,
    );

    expect(presentation.groupHighlights).toHaveLength(1);
    expect(presentation.highlights).toHaveLength(1);
    expect(presentation.highlights[0].point).toEqual({ x: 2, y: 3 });
    expect(presentation.highlights[0].kind).toBe('warning');
  });
});

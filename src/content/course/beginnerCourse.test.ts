import { describe, expect, it } from 'vitest';

import { beginnerCourse } from './beginnerCourse';
import {
  flattenCourseLessons,
  validateCourse,
} from '../../learning';
import {
  createGame,
  scoreArea,
} from '../../go/engine';
import { scoringLesson } from '../lessons';

describe('beginner course', () => {
  it('is valid in prerequisite order', () => {
    expect(validateCourse(beginnerCourse)).toEqual([]);
  });

  it('contains the complete zero-to-first-game path', () => {
    const lessons = flattenCourseLessons(beginnerCourse);

    expect(lessons).toHaveLength(12);
    expect(lessons[0].lesson.id).toBe('foundation-first-stone');
    expect(lessons.at(-1)?.lesson.id).toBe('foundation-ready-for-9x9');
  });

  it('uses a scoring example whose raw area is actually tied 5-5', () => {
    const setup = scoringLesson.initialBoard;
    const game = createGame({
      size: setup.size,
      setup: {
        black: setup.black,
        white: setup.white,
      },
      rules: { komi: 0 },
    });

    const score = scoreArea(game.board, 0);

    expect(score.total.black).toBe(5);
    expect(score.total.white).toBe(5);
  });

  it('finishes on a 9x9 readiness lesson', () => {
    const lessons = flattenCourseLessons(beginnerCourse);
    const finalLesson = lessons.at(-1)?.lesson;

    expect(finalLesson?.initialBoard.size).toBe(9);
    expect(finalLesson?.concept).toBe('first-game-readiness');
  });
});

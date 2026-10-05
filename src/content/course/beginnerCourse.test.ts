import { describe, expect, it } from 'vitest';

import { beginnerCourse } from './beginnerCourse';
import {
  flattenCourseLessons,
  validateCourse,
} from '../../learning';

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

  it('finishes on a 9x9 readiness lesson', () => {
    const lessons = flattenCourseLessons(beginnerCourse);
    const finalLesson = lessons.at(-1)?.lesson;

    expect(finalLesson?.initialBoard.size).toBe(9);
    expect(finalLesson?.concept).toBe('first-game-readiness');
  });
});

import { describe, expect, it } from 'vitest';

import {
  flattenCourseLessons,
  validateCourse,
} from '../../learning';
import {
  developingCourse,
} from './developingCourse';

describe('developing-player course', () => {
  it('is valid in authored prerequisite order', () => {
    expect(
      validateCourse(developingCourse),
    ).toEqual([]);
  });

  it('contains five progressive modules and nineteen lessons', () => {
    const lessons =
      flattenCourseLessons(
        developingCourse,
      );

    expect(
      developingCourse.modules,
    ).toHaveLength(5);
    expect(lessons).toHaveLength(19);
    expect(
      lessons[0].lesson.id,
    ).toBe(
      'develop-reading-depth',
    );
    expect(
      lessons.at(-1)?.lesson.id,
    ).toBe('develop-joseki');
  });

  it('covers the intended tactical strategic and endgame concepts', () => {
    const concepts = new Set(
      flattenCourseLessons(
        developingCourse,
      ).map(
        (entry) =>
          entry.lesson.concept,
      ),
    );

    for (const concept of [
      'reading',
      'ladder',
      'net',
      'snapback',
      'semeai',
      'false-eye',
      'vital-point',
      'seki',
      'cutting',
      'shape',
      'weak-groups',
      'attack-defense',
      'influence',
      'invasion',
      'reduction',
      'sente-gote',
      'endgame',
      'opening',
      'joseki',
    ]) {
      expect(
        concepts.has(concept),
      ).toBe(true);
    }
  });

  it('keeps lessons interactive instead of text-only', () => {
    const lessons =
      flattenCourseLessons(
        developingCourse,
      );

    for (const { lesson } of lessons) {
      expect(
        lesson.steps.some(
          (step) =>
            step.kind !==
            'continue',
        ),
      ).toBe(true);
    }
  });
});

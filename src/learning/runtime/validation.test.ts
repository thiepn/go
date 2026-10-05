import { describe, expect, it } from 'vitest';

import type { LessonDefinition } from './types';
import { validateLesson } from './validation';

describe('lesson validation', () => {
  it('accepts a minimal valid lesson', () => {
    const lesson: LessonDefinition = {
      id: 'valid',
      title: 'Valid',
      concept: 'board',
      initialBoard: { size: 5 },
      steps: [
        {
          id: 'one',
          kind: 'continue',
          title: 'One',
          instruction: 'Continue.',
        },
      ],
    };

    expect(validateLesson(lesson)).toEqual([]);
  });

  it('detects duplicate step IDs and bad choice references', () => {
    const lesson: LessonDefinition = {
      id: 'invalid',
      title: 'Invalid',
      concept: 'board',
      initialBoard: { size: 5 },
      steps: [
        {
          id: 'same',
          kind: 'continue',
          title: 'One',
          instruction: 'Continue.',
        },
        {
          id: 'same',
          kind: 'choose-answer',
          title: 'Two',
          instruction: 'Choose.',
          choices: [{ id: 'a', label: 'A' }],
          correctChoiceId: 'missing',
        },
      ],
    };

    const issues = validateLesson(lesson);

    expect(issues.some((issue) => /unique/.test(issue.message))).toBe(true);
    expect(
      issues.some((issue) => /existing choice/.test(issue.message)),
    ).toBe(true);
  });
});

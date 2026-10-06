import { describe, expect, it } from 'vitest';

import {
  editSetupPoint,
  inspectAuthoringSource,
  lessonSummary,
  problemSummary,
  setupToBoard,
  templateSource,
} from './model';

describe('content authoring studio model', () => {
  it('ships valid lesson and problem templates', () => {
    const lesson = inspectAuthoringSource(
      'lesson',
      templateSource('lesson'),
    );
    const problem = inspectAuthoringSource(
      'problem',
      templateSource('problem'),
    );

    expect(lesson.parseError).toBeNull();
    expect(lesson.issues).toEqual([]);
    expect(problem.parseError).toBeNull();
    expect(problem.issues).toEqual([]);
  });

  it('edits setup stones without overlap', () => {
    const setup = {
      size: 9,
      toPlay: 'black' as const,
      black: [{ x: 2, y: 3 }],
      white: [],
    };

    const white = editSetupPoint(
      setup,
      { x: 2, y: 3 },
      'white',
    );
    const erased = editSetupPoint(
      white,
      { x: 2, y: 3 },
      'erase',
    );

    expect(white.black).toEqual([]);
    expect(white.white).toEqual([{ x: 2, y: 3 }]);
    expect(erased.black).toEqual([]);
    expect(erased.white).toEqual([]);
  });

  it('renders setup data through the production board model', () => {
    const board = setupToBoard({
      size: 9,
      toPlay: 'black',
      black: [{ x: 0, y: 0 }],
      white: [{ x: 8, y: 8 }],
    });

    expect(board.size).toBe(9);
    expect(board.intersections[0]).toBe('black');
    expect(board.intersections.at(-1)).toBe('white');
  });

  it('summarizes lesson and problem authoring depth', () => {
    const lessonInspection = inspectAuthoringSource(
      'lesson',
      templateSource('lesson'),
    );
    const problemInspection = inspectAuthoringSource(
      'problem',
      templateSource('problem'),
    );

    const lesson = lessonInspection.value;
    const problem = problemInspection.value;

    if (!lesson || !('steps' in lesson)) {
      throw new Error('Lesson template failed to load.');
    }

    if (!problem || !('root' in problem)) {
      throw new Error('Problem template failed to load.');
    }

    expect(lessonSummary(lesson)).toEqual({
      steps: 1,
      hints: 0,
      choreographyCues: 0,
    });

    expect(problemSummary(problem)).toEqual({
      nodes: 1,
      branches: 1,
      hints: 0,
    });
  });

  it('surfaces parse errors instead of throwing', () => {
    const inspection = inspectAuthoringSource(
      'lesson',
      '{broken',
    );

    expect(inspection.value).toBeNull();
    expect(inspection.parseError).not.toBeNull();
  });
});
